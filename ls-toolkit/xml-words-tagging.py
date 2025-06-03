#This script tags words in an XML document with dictionary data loaded from a CSV file.
import xml.etree.ElementTree as ET
import re
import logging
import os
import csv
import json
from typing import Dict, List, Set, Optional, Any
import html

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('xml_word_tagging.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def load_dictionary_from_csv(csv_file_path: str) -> Dict[str, Dict[str, Dict[str, Any]]]:
    """
    Loads dictionary data from CSV file.
    Returns: {topic_id: {normalized_term: {term_type: str, original_term: str, ...}}}

    CSV structure: term, topic_id, enrichment_data (JSON with term_type)
    """
    dictionary_by_topic: Dict[str, Dict[str, Dict[str, Any]]] = {}

    try:
        with open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)

            for row_num, row in enumerate(reader, start=1):
                term = row.get('term', '').strip()
                topic_id = row.get('topic_id', '').strip()
                enrichment_data_str = row.get('enrichment_data', '').strip()

                if not term or not topic_id:
                    logger.warning(f"Row {row_num}: Missing term or topic_id. Skipping.")
                    continue

                # Parse enrichment_data JSON
                enrichment_data = {}
                if enrichment_data_str:
                    try:
                        enrichment_data = json.loads(enrichment_data_str)
                    except json.JSONDecodeError as e:
                        logger.warning(f"Row {row_num}: Invalid JSON in enrichment_data for term '{term}': {e}")
                        continue

                # Initialize topic if not exists
                if topic_id not in dictionary_by_topic:
                    dictionary_by_topic[topic_id] = {}

                # Store normalized term as key
                normalized_term = term.lower()
                dictionary_by_topic[topic_id][normalized_term] = {
                    'original_term': term,  # Keep original case
                    'term_type': enrichment_data.get('term_type', 'unknown'),
                    'urdu_meaning': enrichment_data.get('urdu_meaning', ''),
                    'meaning': enrichment_data.get('explanation', ''),  # Use explanation as meaning
                    'example': enrichment_data.get('example_sentence', '')
                }

        total_terms = sum(len(terms) for terms in dictionary_by_topic.values())
        logger.info(f"Loaded {total_terms} dictionary terms across {len(dictionary_by_topic)} topics from '{csv_file_path}'")
        return dictionary_by_topic

    except FileNotFoundError:
        logger.error(f"CSV file not found: {csv_file_path}")
        raise
    except Exception as e:
        logger.error(f"Error loading CSV file '{csv_file_path}': {e}", exc_info=True)
        raise

def escape_attribute_value(value: Optional[str]) -> str:
    """Escapes a string to be safely used as an XML attribute value."""
    if value is None:
        return ""
    return html.escape(str(value), quote=True)

def create_short_meaning(full_meaning: str, max_length: int = 70) -> str:
    """Creates a short version of the meaning for data attributes."""
    if not full_meaning:
        return ""

    # Try to split by sentences first
    sentences = re.split(r'(?<=[.!?])\s+', full_meaning.strip())
    if sentences and sentences[0]:
        first_sentence = sentences[0]
        if len(first_sentence) <= max_length:
            return first_sentence
        else:
            # Truncate and add ellipsis
            return first_sentence[:max_length-3] + "..."

    # Fallback: just truncate
    return full_meaning[:max_length-3] + "..." if len(full_meaning) > max_length else full_meaning

def tag_dictionary_words_in_text(text_content: str,
                                 dictionary_for_topic: Dict[str, Dict[str, Any]]) -> str:
    """
    Tags words in text_content with <dict_word> tags if they exist in dictionary.

    Args:
        text_content: The text to process
        dictionary_for_topic: {normalized_term: {original_term, term_type, ...}}

    Returns:
        Text with <dict_word> tags around dictionary terms
    """
    if not text_content or not dictionary_for_topic:
        return text_content

    # Tokenize text into words and non-words (punctuation, spaces)
    tokens = re.findall(r"(\b[a-zA-Z0-9'-]+\b|[^a-zA-Z0-9'-]+)", text_content)
    output_parts = []

    for token in tokens:
        is_word_token = bool(re.match(r"^[a-zA-Z0-9'-]+$", token))

        if not is_word_token:
            # Non-word token (punctuation, spaces) - keep as is
            output_parts.append(html.escape(token))
            continue

        # Check if this word should be tagged
        normalized_token = token.lower()
        word_data = dictionary_for_topic.get(normalized_token)

        if word_data:
            # Create dict_word tag with data attributes
            term_type = word_data.get('term_type', 'unknown')
            original_term = word_data.get('original_term', token)
            urdu_meaning = word_data.get('urdu_meaning', '')
            meaning = word_data.get('meaning', '')

            # Build attributes list
            attributes = []
            attributes.append(f'data-word="{escape_attribute_value(original_term)}"')
            attributes.append(f'data-term-type="{escape_attribute_value(term_type)}"')

            if urdu_meaning:
                attributes.append(f'data-urdu="{escape_attribute_value(urdu_meaning)}"')

            if meaning:
                short_meaning = create_short_meaning(meaning)
                if short_meaning:
                    attributes.append(f'data-short-meaning="{escape_attribute_value(meaning)}"')

            # Create the tagged word
            tag_content = f'<dict_word {" ".join(attributes)}>{html.escape(token)}</dict_word>'
            output_parts.append(tag_content)
        else:
            # Regular word - escape and keep as is
            output_parts.append(html.escape(token))

    return "".join(output_parts)

def should_skip_element(tag_name: str) -> bool:
    """Determines if an element should be skipped for word tagging."""
    skip_tags = {'formula', 'dict_word', 'script', 'style'}
    return tag_name.lower() in skip_tags

def process_element_text_content(element: ET.Element,
                                dictionary_for_topic: Dict[str, Dict[str, Any]]):
    """
    Recursively processes an XML element's text and tail to tag words.
    Modifies the element in place.
    """
    if element is None or should_skip_element(element.tag):
        return

    # Process element's text content
    if element.text:
        element.text = tag_dictionary_words_in_text(element.text, dictionary_for_topic)

    # Process all child elements
    for child in element:
        process_element_text_content(child, dictionary_for_topic)

        # Process child's tail text
        if child.tail:
            child.tail = tag_dictionary_words_in_text(child.tail, dictionary_for_topic)

def process_xml_file(input_xml_path: str,
                     dictionary_by_topic: Dict[str, Dict[str, Dict[str, Any]]],
                     output_xml_path: str):
    """
    Processes XML file and tags dictionary words based on topic data.

    Args:
        input_xml_path: Path to input XML file
        dictionary_by_topic: Dictionary data loaded from CSV
        output_xml_path: Path for output tagged XML file
    """
    try:
        # Read and parse XML
        logger.info(f"Reading XML file: {input_xml_path}")
        with open(input_xml_path, 'r', encoding='utf-8') as f:
            xml_content = f.read()

        # Handle common XML parsing issues
        xml_content = re.sub(r'&(?!(?:amp|lt|gt|quot|apos|#\d{1,6}|#x[0-9a-fA-F]{1,5});)', '&amp;', xml_content)

        # Parse XML
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e:
            logger.error(f"XML parsing failed: {e}")
            raise

        # Find all topic elements
        topic_elements = []
        if root.tag.lower() == 'topic':
            topic_elements.append(root)
        else:
            topic_elements.extend(root.findall('.//topic'))

        if not topic_elements:
            logger.warning(f"No <topic> elements found in '{input_xml_path}'")
            # Still proceed - might want to process the whole document
            topic_elements = [root]

        processed_topics = 0

        for topic_element in topic_elements:
            topic_id = topic_element.get('id', 'unknown')

            # Get dictionary for this topic
            dictionary_for_topic = dictionary_by_topic.get(topic_id, {})

            if not dictionary_for_topic:
                logger.info(f"No dictionary data found for topic '{topic_id}'. Skipping word tagging.")
                continue

            logger.info(f"Processing topic '{topic_id}' with {len(dictionary_for_topic)} dictionary terms")

            # Process all text content in this topic
            process_element_text_content(topic_element, dictionary_for_topic)
            processed_topics += 1

        # Convert back to string and save
        logger.info(f"Saving tagged XML to: {output_xml_path}")
        xml_output = ET.tostring(root, encoding='unicode', method='xml')

        with open(output_xml_path, 'w', encoding='utf-8') as f:
            f.write('<?xml version="1.0" encoding="utf-8"?>\n')
            f.write(xml_output)

        logger.info(f"Successfully processed {processed_topics} topics and saved to '{output_xml_path}'")

    except Exception as e:
        logger.error(f"Error processing XML file '{input_xml_path}': {e}", exc_info=True)
        raise

def main():
    """Main function to run the XML word tagging script."""

    # File paths - modify these as needed
    csv_file = "enriched_CHEM_IX_chapter1.csv"  # term, topic_id, enrichment_data
    input_xml_file = "chem-ix-1st-chap.xml"     # Original XML content
    output_xml_file = "content_tagged.xml"  # Output with tagged words

    logger.info("=== Starting XML Dictionary Word Tagger ===")

    # Validate input files exist
    if not os.path.exists(csv_file):
        logger.error(f"CSV dictionary file not found: '{csv_file}'")
        return 1

    if not os.path.exists(input_xml_file):
        logger.error(f"Input XML file not found: '{input_xml_file}'")
        return 1

    try:
        # Load dictionary data from CSV
        logger.info("Loading dictionary data from CSV...")
        dictionary_by_topic = load_dictionary_from_csv(csv_file)

        if not dictionary_by_topic:
            logger.warning("No dictionary data loaded. Nothing to tag.")
            return 1

        # Process XML file and add tags
        logger.info("Processing XML file...")
        process_xml_file(input_xml_file, dictionary_by_topic, output_xml_file)

        logger.info("=== XML Dictionary Word Tagger Completed Successfully ===")
        return 0

    except Exception as e:
        logger.error(f"=== XML Dictionary Word Tagger Failed: {e} ===", exc_info=True)
        return 1

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)
