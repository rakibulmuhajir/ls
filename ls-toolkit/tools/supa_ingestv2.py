from supabase import create_client
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import re
import logging
from typing import Dict, List, Optional, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ingestion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --- Supabase Setup ---
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ntvfjkvlgkpcoroyoyss.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dmZqa3ZsZ2twY29yb3lveXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc2OTM4MiwiZXhwIjoyMDYzMzQ1MzgyfQ.9zSJSMGcct8ZHSiwJIr6cSB9oJF8uVHLkQCWqLS_P8w")

if SUPABASE_KEY == "YOUR_SUPABASE_SERVICE_ROLE_OR_ANON_KEY" or not SUPABASE_KEY:
    logger.error("CRITICAL ERROR: Supabase key is not set correctly.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info(f"Connected to Supabase URL: {SUPABASE_URL}")

# --- Configuration ---
class ProcessingConfig:
    """Configuration for section processing behavior"""

    # How to handle existing sections of the same type
    SECTION_CONFLICT_RESOLUTION = {
        'MEMORY_TECHNIQUES': 'replace',  # Replace existing memory techniques
        'QUESTION_BANK': 'replace',      # Replace question banks
        'EXERCISES': 'append',           # Keep adding exercises
        'EXAMPLES': 'append',            # Keep adding examples
        'DEFAULT': 'ask'                 # Ask user or use default behavior
    }

    # Default behavior when not specified
    DEFAULT_CONFLICT_BEHAVIOR = 'append'  # 'replace', 'append', or 'skip'

    # Question bank processing patterns
    QUESTION_PATTERNS = {
        'mcq': ['multiple_choice', 'mcq', 'choice_question'],
        'fill_blanks': ['fill_in_blanks', 'fill_blanks', 'blanks'],
        'short_answer': ['short_answer', 'short_qa', 'brief_answer'],
        'long_answer': ['long_answer', 'detailed_answer', 'essay'],
        'true_false': ['true_false', 'tf_question', 'boolean']
    }

config = ProcessingConfig()

# --- Animation Registry (existing) ---
ANIMATION_REGISTRY = {
    'hydrogen-oxygen-water': 'hydrogen-oxygen-water',
    'states-of-matter': 'states-of-matter',
    'phase-changes': 'phase-changes',
    'carbon-allotropes': 'carbon-allotropes',
    'solutions-colloids': 'solutions-colloids',
    'temperature-solubility': 'temperature-solubility',
    'water-formation': 'hydrogen-oxygen-water',
    'matter-states': 'states-of-matter',
    'allotropes-carbon': 'carbon-allotropes',
}

def validate_animation_reference(animation_ref: str) -> Optional[str]:
    """Validate if animation reference exists in registry"""
    if animation_ref in ANIMATION_REGISTRY:
        return ANIMATION_REGISTRY[animation_ref]
    logger.warning(f"Animation reference '{animation_ref}' not found in registry")
    return None

# --- Enhanced Helper Functions ---
def insert_and_return_pk(table_name: str, data: Dict[str, Any], pk_column_name: str) -> int:
    """Insert data and return primary key"""
    try:
        logger.debug(f"Inserting into {table_name}: {data}")
        response = supabase.table(table_name).insert(data).execute()

        response_error = getattr(response, 'error', None)
        response_data = getattr(response, 'data', None)

        if response_error or not response_data:
            error_message = "Unknown error during insert."
            if response_error:
                error_message = f"Code: {getattr(response_error, 'code', 'N/A')}, Message: {getattr(response_error, 'message', str(response_error))}"
            elif not response_data:
                error_message = "No data returned from insert operation."

            logger.error(f"Insert failed for table {table_name}: {error_message}")
            raise Exception(f"Insert failed for table {table_name}. Error: {error_message}")

        if not isinstance(response_data, list) or len(response_data) == 0:
            logger.error(f"Insert into {table_name} returned unexpected data format: {response_data}")
            raise Exception(f"Insert into {table_name} did not return expected data format.")

        pk_value = response_data[0][pk_column_name]
        logger.debug(f"Successfully inserted into {table_name}, PK: {pk_value}")
        return pk_value

    except Exception as e:
        logger.error(f"Error inserting into {table_name}: {str(e)}")
        raise

def get_or_create_id(table_name: str, search_column: str, search_value: str,
                     pk_column_name: str, extra_data: Dict[str, Any] = {}) -> int:
    """Get existing ID or create new record"""
    try:
        logger.debug(f"Getting or creating in {table_name} by {search_column}='{search_value}'")
        response = supabase.table(table_name).select(pk_column_name).eq(search_column, search_value).execute()

        response_error = getattr(response, 'error', None)
        response_data = getattr(response, 'data', None)

        if response_error:
            error_message = f"Code: {getattr(response_error, 'code', 'N/A')}, Message: {getattr(response_error, 'message', str(response_error))}"
            logger.error(f"Select failed for table {table_name}: {error_message}")
            raise Exception(f"Select failed for table {table_name}. Error: {error_message}")

        if response_data:
            if isinstance(response_data, list) and len(response_data) > 0:
                pk_value = response_data[0][pk_column_name]
                logger.debug(f"Found existing record in {table_name}, PK: {pk_value}")
                return pk_value
            else:
                logger.error(f"Select for {table_name} returned unexpected format: {response_data}")
                raise Exception(f"Select for {table_name} returned data in unexpected format")
        else:
            # Create new record
            insert_data = {search_column: search_value, **extra_data}
            pk_value = insert_and_return_pk(table_name, insert_data, pk_column_name)
            logger.info(f"Created new record in {table_name}, PK: {pk_value}")
            return pk_value

    except Exception as e:
        logger.error(f"Error in get_or_create_id for {table_name}: {str(e)}")
        raise

def get_formatted_text(element_xml) -> str:
    """Enhanced to handle animation references and various formatting"""
    if element_xml is None:
        return ""

    text_parts = []
    if element_xml.text:
        text_parts.append(element_xml.text.strip())

    for child in element_xml:
        tag = child.tag.lower()
        if tag == 'emphasis':
            content = get_formatted_text(child)
            emp_type = child.get('type', 'italic')
            text_parts.append(f"**{content}**" if emp_type == 'bold' else f"*{content}*")
        elif tag == 'formula':
            content = child.text.strip() if child.text else ""
            text_parts.append(f"[{child.get('type','')}:{content}]")
        elif tag == 'animation':
            animation_ref = child.get('ref') or child.get('name') or child.get('id')
            animation_height = child.get('height', '300')

            if animation_ref:
                validated_type = validate_animation_reference(animation_ref)
                if validated_type:
                    text_parts.append(f"[ANIMATION:{validated_type}:{animation_height}]")
                    logger.info(f"Added animation reference: {animation_ref} -> {validated_type}")
                else:
                    text_parts.append(f"[ANIMATION_PLACEHOLDER:{animation_ref}:{animation_height}]")
                    logger.warning(f"Animation '{animation_ref}' not yet implemented, added as placeholder")
            else:
                logger.warning("Animation tag found without ref/name/id attribute")
        elif tag == 'list':
            continue
        else:
            text_parts.append(get_formatted_text(child))

        if child.tail:
            text_parts.append(child.tail.strip())

    return " ".join(filter(None, text_parts)).strip()

# --- Enhanced Section Management ---
def get_topic_pk(book_pk: int, chapter_number: str, topic_xml_id: str) -> Optional[int]:
    """Get topic primary key from book, chapter, and topic identifiers"""
    try:
        # First get chapter_pk
        chapter_response = supabase.table("chapters").select("chapter_pk").eq(
            "book_fk", book_pk
        ).eq("chapter_number_display", chapter_number).execute()

        if not chapter_response.data:
            logger.error(f"Chapter {chapter_number} not found in book {book_pk}")
            return None

        chapter_pk = chapter_response.data[0]["chapter_pk"]

        # Then get topic_pk
        topic_response = supabase.table("topics").select("topic_pk").eq(
            "chapter_fk", chapter_pk
        ).eq("topic_xml_id", topic_xml_id).execute()

        if not topic_response.data:
            logger.error(f"Topic {topic_xml_id} not found in chapter {chapter_pk}")
            return None

        return topic_response.data[0]["topic_pk"]

    except Exception as e:
        logger.error(f"Error getting topic_pk: {str(e)}")
        return None

def get_existing_sections(topic_pk: int) -> List[Dict[str, Any]]:
    """Get all existing sections for a topic"""
    try:
        response = supabase.table("sections").select(
            "section_pk, section_type_xml, title, order_in_topic"
        ).eq("topic_fk", topic_pk).order("order_in_topic").execute()

        return response.data or []
    except Exception as e:
        logger.error(f"Error getting existing sections: {str(e)}")
        return []

def find_conflicting_section(existing_sections: List[Dict[str, Any]],
                           new_section_type: str) -> Optional[Dict[str, Any]]:
    """Find if there's a conflicting section of the same type"""
    for section in existing_sections:
        if section['section_type_xml'] == new_section_type:
            return section
    return None

def determine_conflict_resolution(section_type: str, conflict_behavior: Optional[str] = None) -> str:
    """Determine how to handle section conflicts"""
    if conflict_behavior:
        return conflict_behavior

    return config.SECTION_CONFLICT_RESOLUTION.get(
        section_type,
        config.DEFAULT_CONFLICT_BEHAVIOR
    )

def get_max_section_order(topic_pk: int) -> int:
    """Get the maximum order_in_topic for existing sections"""
    try:
        response = supabase.table("sections").select("order_in_topic").eq(
            "topic_fk", topic_pk
        ).order("order_in_topic", desc=True).limit(1).execute()

        if response.data:
            return response.data[0]["order_in_topic"]
        return 0

    except Exception as e:
        logger.error(f"Error getting max section order: {str(e)}")
        return 0

def delete_section_completely(section_pk: int) -> bool:
    """Delete a section and all its content"""
    try:
        # Delete content elements (cascade will handle list_items)
        supabase.table("content_elements").delete().eq("section_fk", section_pk).execute()

        # Delete the section itself
        supabase.table("sections").delete().eq("section_pk", section_pk).execute()

        logger.info(f"Deleted section {section_pk} completely")
        return True
    except Exception as e:
        logger.error(f"Error deleting section {section_pk}: {str(e)}")
        return False

# --- Enhanced Section Processing ---
def add_section_to_topic(section_xml_file: str, book_pk: int, chapter_number: str,
                        topic_xml_id: str, section_order: Optional[int] = None,
                        conflict_behavior: Optional[str] = None) -> Optional[int]:
    """
    Add a new section to an existing topic with conflict resolution

    Args:
        section_xml_file: Path to XML file containing the section
        book_pk: Book primary key
        chapter_number: Chapter number (e.g., "1")
        topic_xml_id: Topic XML ID (e.g., "1.1")
        section_order: Optional specific order, otherwise appends at end
        conflict_behavior: 'replace', 'append', 'skip' - overrides config

    Returns:
        section_pk if successful, None if failed
    """
    try:
        logger.info(f"Adding section from {section_xml_file} to topic {topic_xml_id}")

        # Get topic_pk
        topic_pk = get_topic_pk(book_pk, chapter_number, topic_xml_id)
        if not topic_pk:
            raise Exception(f"Topic {topic_xml_id} not found")

        # Parse section XML
        with open(section_xml_file, 'r', encoding='utf-8') as f:
            xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', f.read())

        root = ET.fromstring(xml_str)

        # Validate root is a section
        if root.tag.lower() != 'section':
            raise Exception(f"Expected <section> root tag, found <{root.tag}>")

        section_type = root.get("type", "UNKNOWN")
        section_title = root.get("title", f"Section {section_type}")

        # Check for existing sections and conflicts
        existing_sections = get_existing_sections(topic_pk)
        conflicting_section = find_conflicting_section(existing_sections, section_type)

        if conflicting_section:
            resolution = determine_conflict_resolution(section_type, conflict_behavior)
            logger.info(f"Found conflicting section {conflicting_section['section_pk']} of type {section_type}")
            logger.info(f"Resolution strategy: {resolution}")

            if resolution == 'replace':
                logger.info(f"Replacing existing section {conflicting_section['section_pk']}")
                delete_section_completely(conflicting_section['section_pk'])
                # Use the same order as the deleted section
                section_order = conflicting_section['order_in_topic']
            elif resolution == 'skip':
                logger.info(f"Skipping section addition due to existing section")
                return conflicting_section['section_pk']
            # For 'append', continue with normal processing

        # Determine section order
        if section_order is None:
            section_order = get_max_section_order(topic_pk) + 1

        # Create section
        section_data = {
            "topic_fk": topic_pk,
            "section_type_xml": section_type,
            "title": section_title,
            "order_in_topic": section_order
        }
        section_pk = insert_and_return_pk("sections", section_data, "section_pk")
        logger.info(f"Created Section - PK: {section_pk}, Type: '{section_type}'")

        # Process section content with enhanced processing
        elements_processed = process_section_content_enhanced(root, section_pk, section_type)
        logger.info(f"Section {section_pk} added successfully with {elements_processed} elements")

        return section_pk

    except Exception as e:
        logger.error(f"Error adding section to topic: {str(e)}")
        return None

def add_sections_to_multiple_topics(section_xml_file: str, book_pk: int,
                                   topic_mappings: List[Dict[str, str]],
                                   conflict_behavior: Optional[str] = None) -> Dict[str, List]:
    """
    Add the same section to multiple topics with enhanced conflict resolution
    """
    successful_additions = []
    failed_additions = []
    skipped_additions = []

    for mapping in topic_mappings:
        try:
            chapter_number = mapping['chapter_number']
            topic_xml_id = mapping['topic_xml_id']

            section_pk = add_section_to_topic(
                section_xml_file,
                book_pk,
                chapter_number,
                topic_xml_id,
                conflict_behavior=conflict_behavior
            )

            if section_pk:
                successful_additions.append({
                    'topic_xml_id': topic_xml_id,
                    'section_pk': section_pk
                })
            else:
                skipped_additions.append({
                    'topic_xml_id': topic_xml_id,
                    'reason': 'Section processing returned None'
                })

        except Exception as e:
            logger.error(f"Failed to add section to topic {mapping['topic_xml_id']}: {str(e)}")
            failed_additions.append({
                'topic_xml_id': mapping['topic_xml_id'],
                'error': str(e)
            })

    logger.info(f"Bulk section addition completed: {len(successful_additions)} successful, "
               f"{len(skipped_additions)} skipped, {len(failed_additions)} failed")

    return {
        'successful': successful_additions,
        'skipped': skipped_additions,
        'failed': failed_additions
    }

# --- Enhanced Content Processing ---
def detect_question_type(element_xml) -> str:
    """Detect the type of question from XML structure"""
    tag_name = element_xml.tag.lower()

    # Check for explicit type attribute
    if element_xml.get('type'):
        return element_xml.get('type').upper()

    # Pattern matching for question types
    for q_type, patterns in config.QUESTION_PATTERNS.items():
        if any(pattern in tag_name for pattern in patterns):
            return q_type.upper()

    # Look for specific child elements that indicate question type
    if element_xml.find('.//choice') is not None or element_xml.find('.//option') is not None:
        return 'MCQ'
    if element_xml.find('.//blank') is not None or '_____' in (element_xml.text or ''):
        return 'FILL_BLANKS'
    if element_xml.find('.//true') is not None or element_xml.find('.//false') is not None:
        return 'TRUE_FALSE'

    return 'GENERIC_QUESTION'

def process_question_bank_section(section_xml, section_fk: int) -> int:
    """Enhanced processing for question bank sections"""
    elements_processed = 0
    order_counter = 1

    try:
        for child_xml in section_xml:
            tag_name = child_xml.tag.lower()

            # Detect question type
            question_type = detect_question_type(child_xml)

            if 'question' in tag_name or 'mcq' in tag_name or 'exercise' in tag_name:
                # Process as question with enhanced type detection
                elements_processed += process_enhanced_question(
                    child_xml, section_fk, order_counter, question_type
                )
                order_counter = elements_processed + 1
            else:
                # Use generic processing for other elements
                elements_processed += process_generic_element(
                    child_xml, section_fk, order_counter
                )
                order_counter = elements_processed + 1

        return elements_processed

    except Exception as e:
        logger.error(f"Error processing question bank section: {str(e)}")
        return elements_processed

def process_enhanced_question(question_xml, section_fk: int, start_order: int,
                            question_type: str) -> int:
    """Process different types of questions with enhanced handling"""
    elements_processed = 0
    order_counter = start_order

    try:
        # Create question header
        question_id = question_xml.get('id', f"q_{start_order}")
        question_title = question_xml.get('title') or f"{question_type} Question {question_id}"

        header_pk = insert_content(
            section_fk, f'{question_type}_HEADER', order_counter, "element_pk",
            xml_id_attribute=question_id, title_attribute=question_title,
            attribute_type=question_type
        )
        elements_processed += 1
        order_counter += 1

        # Process question content based on type
        if question_type == 'MCQ':
            elements_processed += process_mcq_content(question_xml, section_fk, order_counter)
        elif question_type == 'FILL_BLANKS':
            elements_processed += process_fill_blanks_content(question_xml, section_fk, order_counter)
        elif question_type == 'TRUE_FALSE':
            elements_processed += process_true_false_content(question_xml, section_fk, order_counter)
        else:
            # Generic question processing
            elements_processed += process_generic_question_content(question_xml, section_fk, order_counter)

        return elements_processed

    except Exception as e:
        logger.error(f"Error processing enhanced question: {str(e)}")
        return elements_processed

def process_mcq_content(mcq_xml, section_fk: int, start_order: int) -> int:
    """Process MCQ specific content"""
    elements_processed = 0
    order_counter = start_order

    # Process question text
    question_elem = mcq_xml.find('.//question') or mcq_xml.find('.//text')
    if question_elem is not None:
        question_text = get_formatted_text(question_elem)
        insert_content(section_fk, 'MCQ_QUESTION', order_counter, "element_pk",
                      text_content=question_text)
        elements_processed += 1
        order_counter += 1

    # Process choices/options
    choices_container = mcq_xml.find('.//choices') or mcq_xml.find('.//options') or mcq_xml
    if choices_container is not None:
        choice_pk = insert_content(section_fk, 'MCQ_CHOICES_CONTAINER', order_counter, "element_pk")
        elements_processed += 1
        order_counter += 1

        # Process individual choices
        choice_items = []
        for idx, choice in enumerate(choices_container.findall('.//choice') or
                                   choices_container.findall('.//option'), 1):
            choice_text = get_formatted_text(choice)
            is_correct = choice.get('correct', 'false').lower() == 'true'
            choice_items.append({
                "parent_content_element_fk": choice_pk,
                "item_text": f"{'[CORRECT] ' if is_correct else ''}{choice_text}",
                "order_in_list": idx
            })

        if choice_items:
            supabase.table("list_items").insert(choice_items).execute()

    # Process answer/explanation
    answer_elem = mcq_xml.find('.//answer') or mcq_xml.find('.//explanation')
    if answer_elem is not None:
        answer_text = get_formatted_text(answer_elem)
        insert_content(section_fk, 'MCQ_ANSWER', order_counter, "element_pk",
                      text_content=answer_text)
        elements_processed += 1

    return elements_processed

def process_fill_blanks_content(fill_xml, section_fk: int, start_order: int) -> int:
    """Process fill in the blanks content"""
    elements_processed = 0
    order_counter = start_order

    # Process question with blanks
    question_elem = fill_xml.find('.//question') or fill_xml.find('.//text')
    if question_elem is not None:
        question_text = get_formatted_text(question_elem)
        insert_content(section_fk, 'FILL_BLANKS_QUESTION', order_counter, "element_pk",
                      text_content=question_text)
        elements_processed += 1
        order_counter += 1

    # Process answers for blanks
    answers_elem = fill_xml.find('.//answers') or fill_xml.find('.//answer')
    if answers_elem is not None:
        answers_text = get_formatted_text(answers_elem)
        insert_content(section_fk, 'FILL_BLANKS_ANSWERS', order_counter, "element_pk",
                      text_content=answers_text)
        elements_processed += 1

    return elements_processed

def process_true_false_content(tf_xml, section_fk: int, start_order: int) -> int:
    """Process true/false question content"""
    elements_processed = 0
    order_counter = start_order

    # Process question
    question_elem = tf_xml.find('.//question') or tf_xml.find('.//statement')
    if question_elem is not None:
        question_text = get_formatted_text(question_elem)
        insert_content(section_fk, 'TRUE_FALSE_QUESTION', order_counter, "element_pk",
                      text_content=question_text)
        elements_processed += 1
        order_counter += 1

    # Process correct answer
    answer_elem = tf_xml.find('.//answer') or tf_xml.find('.//correct')
    if answer_elem is not None:
        answer_text = get_formatted_text(answer_elem)
        correct_answer = answer_elem.get('value', answer_text).upper()
        insert_content(section_fk, 'TRUE_FALSE_ANSWER', order_counter, "element_pk",
                      text_content=f"Correct Answer: {correct_answer}")
        elements_processed += 1

    return elements_processed

def process_generic_question_content(question_xml, section_fk: int, start_order: int) -> int:
    """Process generic question content"""
    elements_processed = 0
    order_counter = start_order

    # Process question text
    question_elem = question_xml.find('.//question')
    if question_elem is not None:
        question_text = get_formatted_text(question_elem)
        insert_content(section_fk, 'QUESTION', order_counter, "element_pk",
                      text_content=question_text)
        elements_processed += 1
        order_counter += 1

        # Process question lists
        for list_xml in question_elem.findall('list'):
            list_items = process_list_items(list_xml, elements_processed)
            if list_items:
                supabase.table("list_items").insert(list_items).execute()

    # Process answer
    answer_elem = question_xml.find('.//answer')
    if answer_elem is not None:
        answer_text = get_formatted_text(answer_elem)
        insert_content(section_fk, 'ANSWER', order_counter, "element_pk",
                      text_content=answer_text)
        elements_processed += 1

    return elements_processed

def process_generic_element(element_xml, section_fk: int, start_order: int) -> int:
    """Enhanced generic processing for unknown element types"""
    elements_processed = 0
    order_counter = start_order

    try:
        tag_name = element_xml.tag.lower()
        title_attr = element_xml.get('title')
        xml_id_attr = element_xml.get('id')
        level_attr = element_xml.get('level')
        type_attr = element_xml.get('type')

        # Get text content, excluding child lists
        text_parts = []
        if element_xml.text and element_xml.text.strip():
            text_parts.append(element_xml.text.strip())
        for child in element_xml:
            if child.tag.lower() != 'list':
                # This part is simplified, assuming direct text or simple emphasis
                if child.tail:
                    text_parts.append(child.tail.strip())

        text_content = " ".join(filter(None, text_parts)).strip()


        # Create a normalized element type name
        element_type = tag_name.upper().replace('-', '_')

        # Insert the main element
        main_element_pk = None
        if text_content or title_attr or xml_id_attr:
            main_element_pk = insert_content(
                section_fk, element_type, order_counter, "element_pk",
                text_content=text_content, xml_id_attribute=xml_id_attr,
                title_attribute=title_attr, attribute_level=level_attr,
                attribute_type=type_attr
            )
            elements_processed += 1
            order_counter += 1

        # Process any child lists separately
        for list_xml in element_xml.findall('list'):
            # Create a dedicated container for the list
            list_container_pk = process_list_container(list_xml, section_fk, order_counter, "List")
            elements_processed += 1
            order_counter += 1

            # Now the list_items are correctly linked to their own container
            # The original process_list_container handles the items inside.


        logger.debug(f"Processed generic element: {tag_name} -> {element_type}")

        return elements_processed

    except Exception as e:
        logger.error(f"Error processing generic element {element_xml.tag}: {str(e)}")
        return elements_processed

def process_section_content_enhanced(section_element_xml, section_fk: int, section_type: str) -> int:
    """Enhanced section content processing with type-specific handling"""

    # Route to specialized processors based on section type
    if section_type in ['QUESTION_BANK', 'MCQ_BANK', 'EXERCISE_BANK']:
        return process_question_bank_section(section_element_xml, section_fk)
    elif section_type == 'MEMORY_TECHNIQUES':
        return process_memory_techniques_section(section_element_xml, section_fk)
    else:
        # Use the original comprehensive processing for standard sections
        return insert_section_content(section_element_xml, section_fk)

def process_memory_techniques_section(section_xml, section_fk: int) -> int:
    """Process memory techniques section"""
    elements_processed = 0
    order_counter = 1

    try:
        for child_xml in section_xml:
            tag_name = child_xml.tag.lower()

            # Handle Memory Technique sections
            if tag_name in ['visual_mnemonics', 'acronyms_acrostics', 'story_method', 'memory_palace',
                           'keyword_associations', 'rhymes_rhythms', 'number_shape_associations',
                           'practice_instructions', 'effectiveness_ranking', 'digital_integration']:
                memory_elements = process_memory_technique_subsection(child_xml, section_fk, order_counter, tag_name)
                elements_processed += memory_elements['elements']
                order_counter += memory_elements['order_increment']
            else:
                # Use generic processing for unknown memory technique types
                elements_processed += process_generic_element(child_xml, section_fk, order_counter)
                order_counter += 1

        logger.info(f"Processed memory techniques section with {elements_processed} elements")
        return elements_processed

    except Exception as e:
        logger.error(f"Error processing memory techniques section: {str(e)}")
        return elements_processed

def process_memory_technique_subsection(section_xml, section_fk: int, start_order: int, section_type: str) -> Dict[str, int]:
    """Process memory technique subsections like visual_mnemonics, acronyms, etc."""
    elements_processed = 0
    order_counter = start_order

    try:
        # Create container for this memory technique type
        container_title = section_type.replace('_', ' ').title()
        container_pk = insert_content(section_fk, f'{section_type.upper()}_CONTAINER', order_counter, "element_pk",
                                     title_attribute=container_title)
        elements_processed += 1
        order_counter += 1

        # Process individual items
        for item_xml in section_xml:
            item_tag = item_xml.tag.lower()
            item_title = item_xml.get('title') or item_xml.get('id')

            # Process the item content
            item_text_parts = []
            for child in item_xml:
                if child.tag.lower() == 'paragraph':
                    item_text_parts.append(get_formatted_text(child))
                elif child.text and child.text.strip():
                    item_text_parts.append(child.text.strip())

            item_text = '\n'.join(item_text_parts)

            if item_text or item_title:
                insert_content(section_fk, f'{section_type.upper()}_ITEM', order_counter, "element_pk",
                              text_content=item_text, title_attribute=item_title)
                elements_processed += 1
                order_counter += 1

        logger.info(f"Processed memory technique subsection: {section_type}, {elements_processed-1} items")
        return {'elements': elements_processed, 'order_increment': order_counter - start_order}

    except Exception as e:
        logger.error(f"Error processing memory technique subsection {section_type}: {str(e)}")
        return {'elements': elements_processed, 'order_increment': order_counter - start_order}

# --- Original Content Processing Functions (Enhanced) ---
def insert_section_content(section_element_xml, section_fk: int) -> int:
    """Process section content and return count of elements processed - ORIGINAL ENHANCED"""
    elements_processed = 0
    order_counter = 1

    try:
        for child_xml in section_element_xml:
            tag_name = child_xml.tag.lower()
            title_attr = child_xml.get('title')
            xml_id_attr = child_xml.get('id')
            level_attr = child_xml.get('level')
            type_attr = child_xml.get('type')

            logger.debug(f"Processing element: {tag_name}")

            if tag_name in ['definition_content', 'explanation_content']:
                for para_xml in child_xml.findall('paragraph'):
                    text = get_formatted_text(para_xml)
                    insert_content(section_fk, "PARAGRAPH", order_counter, "element_pk", text_content=text)
                    elements_processed += 1
                    order_counter += 1

            elif tag_name in ['analogy', 'example', 'connection_item', 'fun_fact', 'interactive_prompt']:
                container_ce_pk = insert_content(section_fk, tag_name.upper(), order_counter, "element_pk",
                                                 xml_id_attribute=xml_id_attr, title_attribute=title_attr,
                                                 attribute_level=level_attr, attribute_type=type_attr)
                elements_processed += 1
                order_counter += 1

                # Process child content
                for inner_child_xml in child_xml:
                    inner_tag_name = inner_child_xml.tag.lower()
                    if inner_tag_name == 'paragraph':
                        text = get_formatted_text(inner_child_xml)
                        insert_content(section_fk, 'PARAGRAPH', order_counter, "element_pk", text_content=text)
                        elements_processed += 1
                        order_counter += 1
                    elif inner_tag_name == 'list':
                        list_items = process_list_items(inner_child_xml, container_ce_pk)
                        if list_items:
                            supabase.table("list_items").insert(list_items).execute()
                            logger.debug(f"Inserted {len(list_items)} list items for element {container_ce_pk}")

            elif tag_name == 'key_points':
                kp_container_pk = insert_content(section_fk, 'KEY_POINTS_CONTAINER', order_counter, "element_pk",
                                                 title_attribute=title_attr, attribute_type=type_attr)
                elements_processed += 1
                order_counter += 1

                points_to_insert = []
                for point_idx, point_xml in enumerate(child_xml.findall('point'), start=1):
                    point_text = get_formatted_text(point_xml)
                    points_to_insert.append({
                        "parent_content_element_fk": kp_container_pk,
                        "item_text": point_text,
                        "order_in_list": point_idx
                    })

                if points_to_insert:
                    supabase.table("list_items").insert(points_to_insert).execute()
                    logger.debug(f"Inserted {len(points_to_insert)} key points")

            elif tag_name == 'exercise_block':
                exercises_processed = process_exercise_block(child_xml, section_fk, order_counter)
                elements_processed += exercises_processed['elements']
                order_counter += exercises_processed['order_increment']

            elif tag_name == 'paragraph':
                text = get_formatted_text(child_xml)
                insert_content(section_fk, 'PARAGRAPH', order_counter, "element_pk",
                               text_content=text, attribute_type=type_attr)
                elements_processed += 1
                order_counter += 1

            elif tag_name == 'list':
                list_container_pk = process_list_container(child_xml, section_fk, order_counter, title_attr)
                elements_processed += 1
                order_counter += 1

            # Handle Memory Technique sections (delegated to specialized processor)
            elif tag_name in ['visual_mnemonics', 'acronyms_acrostics', 'story_method', 'memory_palace',
                              'keyword_associations', 'rhymes_rhythms', 'number_shape_associations']:
                memory_elements = process_memory_technique_subsection(child_xml, section_fk, order_counter, tag_name)
                elements_processed += memory_elements['elements']
                order_counter += memory_elements['order_increment']

            else:
                # Enhanced generic processing for unknown elements
                logger.debug(f"Generic processing for tag: {tag_name}")
                elements_processed += process_generic_element(child_xml, section_fk, order_counter)
                order_counter += 1

        logger.debug(f"Section {section_fk} processing completed: {elements_processed} elements")
        return elements_processed

    except Exception as e:
        logger.error(f"Error processing section content for section {section_fk}: {str(e)}")
        return elements_processed

def process_list_items(list_xml, parent_element_pk: int) -> List[Dict[str, Any]]:
    """Process list items and return list for batch insert"""
    items_to_insert = []
    for item_idx, item_xml in enumerate(list_xml.findall('item'), start=1):
        item_text = get_formatted_text(item_xml)
        items_to_insert.append({
            "parent_content_element_fk": parent_element_pk,
            "item_text": item_text,
            "order_in_list": item_idx
        })
    return items_to_insert

def process_list_container(list_xml, section_fk: int, order_counter: int, title_attr: Optional[str]) -> int:
    """Process list container and its items"""
    list_type_from_xml = list_xml.get('type', 'unordered').upper()
    list_container_pk = insert_content(section_fk, f'LIST_{list_type_from_xml}_CONTAINER', order_counter, "element_pk",
                                       title_attribute=title_attr, attribute_type=list_xml.get('type', 'unordered'))

    list_items_to_insert = process_list_items(list_xml, list_container_pk)
    if list_items_to_insert:
        supabase.table("list_items").insert(list_items_to_insert).execute()
        logger.debug(f"Inserted {len(list_items_to_insert)} list items")

    return list_container_pk

def process_exercise_block(exercise_block_xml, section_fk: int, start_order: int) -> Dict[str, int]:
    """Process exercise block and return counts"""
    elements_processed = 0
    order_counter = start_order

    for ex_xml in exercise_block_xml.findall('exercise'):
        ex_id = ex_xml.get('id')
        ex_level = ex_xml.get('level')
        ex_title_attr = ex_xml.get('title')
        exercise_display_title = ex_title_attr if ex_title_attr else f"Exercise {ex_id if ex_id else ''} ({ex_level if ex_level else 'N/A'})".strip()

        insert_content(section_fk, 'EXERCISE_HEADER', order_counter, "element_pk",
                       xml_id_attribute=ex_id, title_attribute=exercise_display_title,
                       attribute_level=ex_level)
        elements_processed += 1
        order_counter += 1

        # Process question
        q_xml = ex_xml.find('question')
        if q_xml:
            q_text = get_formatted_text(q_xml)
            question_ce_pk = insert_content(section_fk, 'QUESTION', order_counter, "element_pk", text_content=q_text)
            elements_processed += 1
            order_counter += 1

            # Process question lists
            for list_in_q_xml in q_xml.findall('list'):
                question_list_items = process_list_items(list_in_q_xml, question_ce_pk)
                if question_list_items:
                    supabase.table("list_items").insert(question_list_items).execute()

        # Process answer
        ans_xml = ex_xml.find('answer')
        if ans_xml:
            ans_text = get_formatted_text(ans_xml)
            insert_content(section_fk, 'ANSWER', order_counter, "element_pk", text_content=ans_text)
            elements_processed += 1
            order_counter += 1

        # Process answer framework
        ans_fw_xml = ex_xml.find('answer_framework')
        if ans_fw_xml:
            ans_fw_text = get_formatted_text(ans_fw_xml)
            insert_content(section_fk, 'ANSWER_FRAMEWORK', order_counter, "element_pk", text_content=ans_fw_text)
            elements_processed += 1
            order_counter += 1

    return {'elements': elements_processed, 'order_increment': order_counter - start_order}

def insert_content(section_fk: int, element_type: str, order_in_section: int, pk_column_name: str,
                   text_content: Optional[str] = None, xml_id_attribute: Optional[str] = None,
                   title_attribute: Optional[str] = None, attribute_level: Optional[str] = None,
                   attribute_type: Optional[str] = None, formula_type: Optional[str] = None) -> int:
    """Insert content element and return primary key"""
    data = {
        "section_fk": section_fk,
        "element_type": element_type,
        "order_in_section": order_in_section,
        "text_content": text_content,
        "xml_id_attribute": xml_id_attribute,
        "title_attribute": title_attribute,
        "attribute_level": attribute_level,
        "attribute_type": attribute_type,
        "formula_type": formula_type
    }
    element_pk = insert_and_return_pk("content_elements", data, pk_column_name)
    return element_pk

# --- Enhanced Legacy Support ---
def update_existing_section(section_pk: int, section_xml_file: str) -> bool:
    """
    Update an existing section with new content
    """
    try:
        logger.info(f"Updating section {section_pk} from {section_xml_file}")

        # Delete existing content elements (cascade will handle list_items)
        delete_response = supabase.table("content_elements").delete().eq(
            "section_fk", section_pk
        ).execute()
        logger.info(f"Deleted existing content for section {section_pk}")

        # Parse new section XML
        with open(section_xml_file, 'r', encoding='utf-8') as f:
            xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', f.read())

        root = ET.fromstring(xml_str)

        # Update section metadata if provided
        if root.get("title") or root.get("type"):
            update_data = {}
            if root.get("title"):
                update_data["title"] = root.get("title")
            if root.get("type"):
                update_data["section_type_xml"] = root.get("type")

            if update_data:
                supabase.table("sections").update(update_data).eq(
                    "section_pk", section_pk
                ).execute()
                logger.info(f"Updated section metadata")

        # Insert new content with enhanced processing
        section_type = root.get("type", "UNKNOWN")
        elements_processed = process_section_content_enhanced(root, section_pk, section_type)
        logger.info(f"Section {section_pk} updated successfully with {elements_processed} elements")

        return True

    except Exception as e:
        logger.error(f"Error updating section: {str(e)}")
        return False

# --- Enhanced Get-or-Create Functions for True Agnosticism ---
def get_or_create_book_pk(book_details: Dict[str, Any]) -> int:
    """Get existing book or create new one based on unique identifiers"""
    try:
        # Try to find existing book by title and board_id (most unique combo)
        search_criteria = [
            ("title", book_details["title"]),
            ("board_pk", book_details["board_id"])
        ]

        # Add ISBN if provided (most reliable identifier)
        if book_details.get("isbn"):
            response = supabase.table("books").select("book_pk").eq(
                "isbn", book_details["isbn"]
            ).execute()

            if response.data:
                book_pk = response.data[0]["book_pk"]
                logger.info(f"Found existing book by ISBN: {book_pk}")
                return book_pk

        # Try by title + subject combination
        response = supabase.table("books").select("book_pk").eq(
            "title", book_details["title"]
        ).eq("subject", book_details["subject"]).execute()

        if response.data:
            book_pk = response.data[0]["book_pk"]
            logger.info(f"Found existing book by title+subject: {book_pk}")
            return book_pk

        # Book doesn't exist, create it
        logger.info("Book not found, creating new book")

        # Create/get board
        board_pk = get_or_create_id(
            "boards", "board_name", book_details["board_name"], "board_pk",
            extra_data={"country": book_details.get("country")}
        )

        # Create/get grade
        grade_pk = get_or_create_id(
            "grades", "grade_name", book_details["grade_name"], "grade_pk"
        )

        # Create book
        book_data = {
            "title": book_details["title"],
            "board_fk": board_pk,
            "grade_fk": grade_pk,
            "subject": book_details["subject"],
            "author": book_details.get("author"),
            "publication_year": book_details.get("publication_year"),
            "isbn": book_details.get("isbn"),
            "edition": book_details.get("edition"),
            "description": book_details.get("description"),
            "language": book_details.get("language", "English"),
        }
        book_pk = insert_and_return_pk("books", book_data, "book_pk")
        logger.info(f"Created new book: {book_pk}")
        return book_pk

    except Exception as e:
        logger.error(f"Error in get_or_create_book_pk: {str(e)}")
        raise

def get_or_create_chapter_pk(book_pk: int, chapter_xml_id: str, chapter_title: str,
                            chapter_order: int) -> int:
    """Get existing chapter or create new one"""
    try:
        # Try to find by book + chapter_number_display (most reliable)
        response = supabase.table("chapters").select("chapter_pk").eq(
            "book_fk", book_pk
        ).eq("chapter_number_display", chapter_xml_id).execute()

        if response.data:
            chapter_pk = response.data[0]["chapter_pk"]
            logger.info(f"Found existing chapter: {chapter_pk}")
            return chapter_pk

        # Chapter doesn't exist, create it
        chapter_data = {
            "book_fk": book_pk,
            "title": chapter_title,
            "chapter_number_display": chapter_xml_id,
            "chapter_order": chapter_order
        }
        chapter_pk = insert_and_return_pk("chapters", chapter_data, "chapter_pk")
        logger.info(f"Created new chapter: {chapter_pk}")
        return chapter_pk

    except Exception as e:
        logger.error(f"Error in get_or_create_chapter_pk: {str(e)}")
        raise

def get_or_create_topic_pk(chapter_pk: int, topic_xml_id: str, topic_title: str,
                          topic_order: int, topic_type: Optional[str] = None) -> int:
    """Get existing topic or create new one"""
    try:
        # Try to find by chapter + topic_xml_id
        response = supabase.table("topics").select("topic_pk").eq(
            "chapter_fk", chapter_pk
        ).eq("topic_xml_id", topic_xml_id).execute()

        if response.data:
            topic_pk = response.data[0]["topic_pk"]
            logger.info(f"Found existing topic: {topic_pk}")
            return topic_pk

        # Topic doesn't exist, create it
        topic_data = {
            "chapter_fk": chapter_pk,
            "topic_xml_id": topic_xml_id,
            "title": topic_title,
            "order_in_chapter": topic_order
        }
        topic_pk = insert_and_return_pk("topics", topic_data, "topic_pk")
        logger.info(f"Created new topic: {topic_pk}")
        return topic_pk

    except Exception as e:
        logger.error(f"Error in get_or_create_topic_pk: {str(e)}")
        raise

def upsert_section_to_topic(topic_pk: int, section_xml, section_order: int,
                           conflict_behavior: str = "append") -> int:
    """
    Upsert section with conflict resolution - used by process_full_chapter
    """
    try:
        section_type = section_xml.get("type", "UNKNOWN")
        section_title = section_xml.get("title", f"Section {section_type}")

        # Check for existing sections and conflicts
        existing_sections = get_existing_sections(topic_pk)
        conflicting_section = find_conflicting_section(existing_sections, section_type)

        if conflicting_section:
            resolution = determine_conflict_resolution(section_type, conflict_behavior)
            logger.info(f"Found conflicting section {conflicting_section['section_pk']} of type {section_type}")
            logger.info(f"Resolution strategy: {resolution}")

            if resolution == 'replace':
                logger.info(f"Replacing existing section {conflicting_section['section_pk']}")
                delete_section_completely(conflicting_section['section_pk'])
                # Use the same order as the deleted section
                section_order = conflicting_section['order_in_topic']
            elif resolution == 'skip':
                logger.info(f"Skipping section due to existing section")
                return conflicting_section['section_pk']
            # For 'append', continue with normal processing

        # Create section
        section_data = {
            "topic_fk": topic_pk,
            "section_type_xml": section_type,
            "title": section_title,
            "order_in_topic": section_order
        }
        section_pk = insert_and_return_pk("sections", section_data, "section_pk")
        logger.info(f"Created Section - PK: {section_pk}, Type: '{section_type}'")

        # Process section content
        elements_processed = process_section_content_enhanced(section_xml, section_pk, section_type)
        logger.debug(f"Processed {elements_processed} elements in section {section_pk}")

        return section_pk

    except Exception as e:
        logger.error(f"Error upserting section: {str(e)}")
        raise

def add_question_bank_topic_if_needed(chapter_pk: int, book_details: Dict[str, Any]) -> Optional[int]:
    """
    Automatically add a Question Bank topic at the end of a chapter if configured
    """
    try:
        # Check if auto-generation is enabled in book_details
        if not book_details.get("auto_generate_question_bank", False):
            return None

        # Check if Question Bank topic already exists
        response = supabase.table("topics").select("topic_pk").eq(
            "chapter_fk", chapter_pk
        ).ilike("title", "%question%bank%").execute()

        if response.data:
            logger.info("Question Bank topic already exists")
            return response.data[0]["topic_pk"]

        # Get max topic order for this chapter
        max_order_response = supabase.table("topics").select("order_in_chapter").eq(
            "chapter_fk", chapter_pk
        ).order("order_in_chapter", desc=True).limit(1).execute()

        next_order = 1
        if max_order_response.data:
            next_order = max_order_response.data[0]["order_in_chapter"] + 1

        # Create Question Bank topic
        qb_topic_data = {
            "chapter_fk": chapter_pk,
            "topic_xml_id": f"QB_{next_order}",
            "title": "Question Bank",
            "order_in_chapter": next_order
        }
        qb_topic_pk = insert_and_return_pk("topics", qb_topic_data, "topic_pk")
        logger.info(f"Auto-generated Question Bank topic: {qb_topic_pk}")

        return qb_topic_pk

    except Exception as e:
        logger.error(f"Error adding question bank topic: {str(e)}")
        return None

# --- TRULY AGNOSTIC Full Chapter Processing ---
def process_xml(xml_file_path: str, book_details: Dict[str, Any], process_type: str = "full") -> Optional[int]:
    """
    Process XML file based on type - TRULY AGNOSTIC VERSION

    Args:
        xml_file_path: Path to XML file
        book_details: Book metadata
        process_type: "full" for complete chapter, "section" for individual section

    Returns:
        section_pk for section processing, book_pk for full processing
    """
    if process_type == "section":
        # For individual section, book_details should include chapter_number and topic_xml_id
        return add_section_to_topic(
            xml_file_path,
            book_details.get("book_pk", 1),
            book_details["chapter_number"],
            book_details["topic_xml_id"],
            conflict_behavior=book_details.get("conflict_behavior")
        )
    else:
        # Enhanced agnostic full processing
        return process_full_chapter_agnostic(xml_file_path, book_details)

def process_full_chapter_agnostic(xml_file_path: str, book_details: Dict[str, Any]) -> Optional[int]:
    """
    TRULY AGNOSTIC full chapter processing with intelligent upsert logic
    """
    try:
        logger.info(f"Starting AGNOSTIC XML processing for: {xml_file_path}")

        with open(xml_file_path, 'r', encoding='utf-8') as f:
            xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', f.read())

        root = ET.fromstring(xml_str)
        logger.info(f"Successfully parsed XML file: {xml_file_path}")

        # STEP 1: Get or create book (agnostic)
        book_pk = get_or_create_book_pk(book_details)
        logger.info(f"Book PK (get/create): {book_pk}")

        # STEP 2: Handle different root elements agnostically
        chapters_to_process = []

        if root.tag.lower() in ['chapter', 'chpter']:
            # Single chapter file
            chapters_to_process.append({
                'element': root,
                'order': book_details.get("current_chapter_order", 1)
            })
        elif root.tag.lower() in ['book', 'textbook', 'root']:
            # Multi-chapter book file
            for idx, chapter_elem in enumerate(root.findall(".//chapter"), start=1):
                chapters_to_process.append({
                    'element': chapter_elem,
                    'order': idx
                })
        else:
            logger.warning(f"Unknown root tag <{root.tag}>, treating as single chapter")
            chapters_to_process.append({
                'element': root,
                'order': book_details.get("current_chapter_order", 1)
            })

        # STEP 3: Process each chapter agnostically
        processed_chapters = []
        for chapter_info in chapters_to_process:
            chapter_elem = chapter_info['element']
            chapter_order = chapter_info['order']

            # Get or create chapter
            chapter_pk = get_or_create_chapter_pk(
                book_pk,
                chapter_elem.get("id", f"ch_{chapter_order}"),
                chapter_elem.get("title", f"Chapter {chapter_order}"),
                chapter_order
            )

            # Process topics within chapter
            topics_processed = process_topics_agnostic(chapter_elem, chapter_pk, book_details)

            # Auto-generate question bank if configured
            qb_topic_pk = add_question_bank_topic_if_needed(chapter_pk, book_details)
            if qb_topic_pk:
                topics_processed += 1

            processed_chapters.append({
                'chapter_pk': chapter_pk,
                'topics_processed': topics_processed
            })

            logger.info(f"Chapter {chapter_pk} completed: {topics_processed} topics processed")

        total_topics = sum(ch['topics_processed'] for ch in processed_chapters)
        logger.info(f"AGNOSTIC XML processing completed: {len(processed_chapters)} chapters, {total_topics} total topics")

        return book_pk

    except Exception as e:
        logger.error(f"Critical error in agnostic processing: {str(e)}")
        raise

def process_topics_agnostic(chapter_elem, chapter_pk: int, book_details: Dict[str, Any]) -> int:
    """
    Agnostically process all topics within a chapter
    """
    topics_processed = 0
    conflict_behavior = book_details.get("default_conflict_behavior", config.DEFAULT_CONFLICT_BEHAVIOR)

    try:
        # Find all topic elements (flexible tag matching)
        topic_elements = (chapter_elem.findall("topic") +
                         chapter_elem.findall("section") +
                         chapter_elem.findall("unit"))

        if not topic_elements:
            # If no explicit topics, treat the whole chapter as one topic
            logger.info("No topic elements found, treating chapter as single topic")
            topic_pk = get_or_create_topic_pk(
                chapter_pk,
                "main",
                chapter_elem.get("title", "Main Content"),
                1
            )

            # Process all sections directly under chapter
            sections_processed = process_sections_agnostic(chapter_elem, topic_pk, conflict_behavior)
            logger.info(f"Processed chapter as single topic: {sections_processed} sections")
            return 1

        # Process each topic
        for topic_idx, topic_elem in enumerate(topic_elements, start=1):
            try:
                # Get or create topic
                topic_pk = get_or_create_topic_pk(
                    chapter_pk,
                    topic_elem.get("id", f"topic_{topic_idx}"),
                    topic_elem.get("title", f"Topic {topic_idx}"),
                    topic_idx,
                    topic_elem.get("type")
                )

                # Process sections within topic
                sections_processed = process_sections_agnostic(topic_elem, topic_pk, conflict_behavior)
                logger.info(f"Topic {topic_pk} completed: {sections_processed} sections processed")
                topics_processed += 1

            except Exception as e:
                logger.error(f"Error processing topic {topic_idx}: {str(e)}")
                continue

        return topics_processed

    except Exception as e:
        logger.error(f"Error processing topics: {str(e)}")
        return topics_processed

def process_sections_agnostic(parent_elem, topic_pk: int, conflict_behavior: str) -> int:
    """
    Agnostically process all sections within a topic or chapter
    """
    sections_processed = 0

    try:
        # Find all section elements
        section_elements = parent_elem.findall("section")

        if not section_elements:
            # If no explicit sections, treat parent content as one section
            logger.debug("No section elements found, processing parent content as single section")

            # Determine section type from parent or content
            section_type = (parent_elem.get("type") or
                          detect_content_type(parent_elem) or
                          "CONTENT")

            fake_section_order = 1
            section_pk = upsert_section_to_topic(
                topic_pk,
                create_virtual_section(parent_elem, section_type),
                fake_section_order,
                conflict_behavior
            )
            return 1

        # Process each section
        for section_idx, section_elem in enumerate(section_elements, start=1):
            try:
                section_pk = upsert_section_to_topic(
                    topic_pk,
                    section_elem,
                    section_idx,
                    conflict_behavior
                )
                sections_processed += 1

            except Exception as e:
                logger.error(f"Error processing section {section_idx}: {str(e)}")
                continue

        return sections_processed

    except Exception as e:
        logger.error(f"Error processing sections: {str(e)}")
        return sections_processed

def detect_content_type(element) -> str:
    """
    Intelligently detect content type from XML structure
    """
    # Look for specific child elements that indicate content type
    child_tags = [child.tag.lower() for child in element]

    # Question bank indicators
    question_indicators = ['question', 'mcq', 'exercise', 'problem', 'quiz']
    if any(indicator in ' '.join(child_tags) for indicator in question_indicators):
        return "QUESTION_BANK"

    # Memory technique indicators
    memory_indicators = ['visual_mnemonics', 'acronyms', 'story_method', 'memory_palace']
    if any(indicator in child_tags for indicator in memory_indicators):
        return "MEMORY_TECHNIQUES"

    # Educational content indicators
    content_indicators = ['definition', 'explanation', 'example', 'analogy']
    if any(indicator in ' '.join(child_tags) for indicator in content_indicators):
        return "CORE_CONTENT"

    # Assessment indicators
    assessment_indicators = ['assessment', 'test', 'exam', 'evaluation']
    if any(indicator in ' '.join(child_tags) for indicator in assessment_indicators):
        return "ASSESSMENT"

    # Default
    return "CONTENT"

def create_virtual_section(parent_elem, section_type: str):
    """
    Create a virtual section element for content without explicit sections
    """
    class VirtualSection:
        def __init__(self, parent, s_type):
            self.parent = parent
            self.section_type = s_type

        def get(self, attr, default=None):
            if attr == "type":
                return self.section_type
            elif attr == "title":
                return self.parent.get("title", f"{self.section_type} Section")
            return self.parent.get(attr, default)

        def __iter__(self):
            return iter(self.parent)

        def findall(self, tag):
            return self.parent.findall(tag)

    return VirtualSection(parent_elem, section_type)

# --- Legacy Backward Compatibility ---
def process_full_chapter(xml_file_path: str, book_details: Dict[str, Any]) -> Optional[int]:
    """Original full chapter processing - kept for backward compatibility"""
    logger.warning("Using legacy process_full_chapter - consider upgrading to agnostic version")
    return process_full_chapter_agnostic(xml_file_path, book_details)

# --- Batch Section Processing for Multiple Topics ---
def add_multiple_sections_from_single_file(xml_file_path: str, book_pk: int,
                                          chapter_number: str,
                                          conflict_behavior: str = "replace") -> Dict[str, List]:
    """
    Process XML file containing multiple sections targeted at different topics

    XML Structure Expected:
    <sections>
        <section type="MEMORY_TECHNIQUES" target_topic="1.1">...</section>
        <section type="QUESTION_BANK" target_topic="1.2">...</section>
    </sections>

    Args:
        xml_file_path: Path to XML file with multiple sections
        book_pk: Book primary key
        chapter_number: Chapter number (e.g., "1")
        conflict_behavior: How to handle conflicts

    Returns:
        Dictionary with successful/failed results
    """
    successful_additions = []
    failed_additions = []

    try:
        logger.info(f"Processing batch sections from {xml_file_path}")

        # Parse XML
        with open(xml_file_path, 'r', encoding='utf-8') as f:
            xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', f.read())

        root = ET.fromstring(xml_str)

        # Handle different root structures
        sections_to_process = []
        if root.tag.lower() == 'sections':
            sections_to_process = root.findall('section')
        elif root.tag.lower() == 'section':
            sections_to_process = [root]
        else:
            # Try to find sections anywhere in the document
            sections_to_process = root.findall('.//section')

        if not sections_to_process:
            logger.error("No sections found in the XML file")
            return {'successful': [], 'failed': [{'error': 'No sections found'}]}

        # Process each section
        for section_idx, section_elem in enumerate(sections_to_process):
            try:
                # Determine target topic
                target_topic = (section_elem.get('target_topic') or
                              section_elem.get('topic_id') or
                              section_elem.get('for_topic'))

                if not target_topic:
                    logger.warning(f"Section {section_idx} has no target_topic, skipping")
                    failed_additions.append({
                        'section_index': section_idx,
                        'error': 'No target_topic specified'
                    })
                    continue

                # Get topic_pk
                topic_pk = get_topic_pk(book_pk, chapter_number, target_topic)
                if not topic_pk:
                    failed_additions.append({
                        'topic_xml_id': target_topic,
                        'error': f'Topic {target_topic} not found'
                    })
                    continue

                # Create temporary XML file for this section
                temp_section_xml = create_temp_section_file(section_elem)

                # Add section to topic
                section_pk = add_section_to_topic(
                    temp_section_xml,
                    book_pk,
                    chapter_number,
                    target_topic,
                    conflict_behavior=conflict_behavior
                )

                # Clean up temp file
                os.unlink(temp_section_xml)

                if section_pk:
                    successful_additions.append({
                        'topic_xml_id': target_topic,
                        'section_pk': section_pk,
                        'section_type': section_elem.get('type')
                    })
                else:
                    failed_additions.append({
                        'topic_xml_id': target_topic,
                        'error': 'Section processing returned None'
                    })

            except Exception as e:
                logger.error(f"Error processing section for topic {target_topic}: {str(e)}")
                failed_additions.append({
                    'topic_xml_id': target_topic,
                    'error': str(e)
                })

        logger.info(f"Batch processing completed: {len(successful_additions)} successful, {len(failed_additions)} failed")
        return {
            'successful': successful_additions,
            'failed': failed_additions
        }

    except Exception as e:
        logger.error(f"Error in batch section processing: {str(e)}")
        return {
            'successful': [],
            'failed': [{'error': str(e)}]
        }

def create_temp_section_file(section_elem) -> str:
    """Create temporary XML file for a single section"""
    import tempfile

    # Create temporary file
    temp_fd, temp_path = tempfile.mkstemp(suffix='.xml', prefix='temp_section_')

    try:
        # Create XML string for this section
        section_xml = ET.tostring(section_elem, encoding='unicode')

        # Write to temp file
        with os.fdopen(temp_fd, 'w', encoding='utf-8') as temp_file:
            temp_file.write(section_xml)

        return temp_path

    except Exception as e:
        os.close(temp_fd)
        os.unlink(temp_path)
        raise

def add_memory_techniques_to_all_topics_in_chapter(book_pk: int, chapter_number: str,
                                                  base_memory_techniques_file: str,
                                                  conflict_behavior: str = "replace") -> Dict[str, List]:
    """
    Add memory techniques to ALL topics in a chapter

    Args:
        book_pk: Book primary key
        chapter_number: Chapter number (e.g., "1")
        base_memory_techniques_file: Template memory techniques XML file
        conflict_behavior: How to handle existing memory techniques

    Returns:
        Results dictionary
    """
    try:
        # Get all topics in the chapter
        chapter_pk_response = supabase.table("chapters").select("chapter_pk").eq(
            "book_fk", book_pk
        ).eq("chapter_number_display", chapter_number).execute()

        if not chapter_pk_response.data:
            return {'successful': [], 'failed': [{'error': f'Chapter {chapter_number} not found'}]}

        chapter_pk = chapter_pk_response.data[0]["chapter_pk"]

        # Get all topics in this chapter
        topics_response = supabase.table("topics").select("topic_xml_id").eq(
            "chapter_fk", chapter_pk
        ).order("order_in_chapter").execute()

        if not topics_response.data:
            return {'successful': [], 'failed': [{'error': 'No topics found in chapter'}]}

        # Create topic mappings
        topic_mappings = [
            {'chapter_number': chapter_number, 'topic_xml_id': topic['topic_xml_id']}
            for topic in topics_response.data
        ]

        logger.info(f"Adding memory techniques to {len(topic_mappings)} topics in chapter {chapter_number}")

        # Use bulk add function
        return add_sections_to_multiple_topics(
            base_memory_techniques_file,
            book_pk,
            topic_mappings,
            conflict_behavior
        )

    except Exception as e:
        logger.error(f"Error adding memory techniques to all topics: {str(e)}")
        return {'successful': [], 'failed': [{'error': str(e)}]}

# --- Enhanced Main Execution Examples ---
if __name__ == "__main__":
    logger.info("=== Starting TRULY AGNOSTIC XML Ingestion Process ===")

    # MEMORY TECHNIQUES EXAMPLES:

    # Example 1: Add memory techniques to specific topics (RECOMMENDED for your case)
    # memory_topic_list = [
    #     {'chapter_number': '1', 'topic_xml_id': '1.1'},
    #     {'chapter_number': '1', 'topic_xml_id': '1.2'},
    #     {'chapter_number': '1', 'topic_xml_id': '1.3'},
    #     {'chapter_number': '1', 'topic_xml_id': '1.4'},
    # ]
    # results = add_sections_to_multiple_topics(
    #     section_xml_file="memory-techniques-template.xml",  # Your base template
    #     book_pk=1,
    #     topic_mappings=memory_topic_list,
    #     conflict_behavior="replace"  # Replace existing memory techniques
    # )
    # print(f"Memory techniques added to: {len(results['successful'])} topics")

    # # Example 2: Add memory techniques to ALL topics in a chapter automatically
    # results = add_memory_techniques_to_all_topics_in_chapter(
    #     book_pk=1,
    #     chapter_number="1",
    #     base_memory_techniques_file="memory-techniques-template.xml",
    #     conflict_behavior="replace"
    # )
    # print(f"Memory techniques added to: {len(results['successful'])} topics")

    # # Example 3: Process multiple sections from single XML file (target_topic approach)
    # results = add_multiple_sections_from_single_file(
    #     xml_file_path="multiple-memory-techniques.xml",  # Contains sections with target_topic
    #     book_pk=1,
    #     chapter_number="1",
    #     conflict_behavior="replace"
    # )
    # print(f"Processed {len(results['successful'])} sections successfully")

    # # Example 4: Completely agnostic full chapter processing
    # agnostic_book_details = {
    #     "title": "Chemistry Grade 9 (Punjab Board)",
    #     "board_name": "Punjab Textbook Board",
    #     "grade_name": "Grade 9",
    #     "subject": "Chemistry",
    #     "author": "PTB Authors",
    #     "publication_year": 2023,
    #     "isbn": "978-PTB-CHEM-G9-01",
    #     "edition": "2023 Edition",
    #     "description": "Official Chemistry Book for Grade 9 by Punjab Textbook Board.",
    #     "language": "English",
    #     "country": "Pakistan",
    #     "current_chapter_order": 1,
    #     "default_conflict_behavior": "replace",
    #     "auto_generate_question_bank": True
    # }
    # process_xml("app-chapter1.xml", agnostic_book_details, process_type="full")

    # logger.info("=== Enhanced XML Ingestion Process Completed ===")
    # """Original full chapter processing - kept for backward compatibility"""
    # try:
    #     logger.info(f"Starting XML processing for: {xml_file_path}")

    #     with open(xml_file_path, 'r', encoding='utf-8') as f:
    #         xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', f.read())

    #     root = ET.fromstring(xml_str)
    #     logger.info(f"Successfully parsed XML file: {xml_file_path}")

    #     # Create/get board
    #     board_pk = get_or_create_id(
    #         "boards",
    #         "board_name",
    #         book_details["board_name"],
    #         "board_pk",
    #         extra_data={"country": book_details.get("country")}
    #     )
    #     logger.info(f"Board PK: {board_pk}")

    #     # Create/get grade
    #     grade_pk = get_or_create_id(
    #         "grades",
    #         "grade_name",
    #         book_details["grade_name"],
    #         "grade_pk"
    #     )
    #     logger.info(f"Grade PK: {grade_pk}")

    #     # Create book
    #     book_data = {
    #         "title": book_details["title"],
    #         "board_fk": board_pk,
    #         "grade_fk": grade_pk,
    #         "subject": book_details["subject"],
    #         "author": book_details.get("author"),
    #         "publication_year": book_details.get("publication_year"),
    #         "isbn": book_details.get("isbn"),
    #         "edition": book_details.get("edition"),
    #         "description": book_details.get("description"),
    #         "language": book_details.get("language", "English"),
    #     }
    #     book_pk = insert_and_return_pk("books", book_data, "book_pk")
    #     logger.info(f"Created Book - PK: {book_pk}, Title: '{book_details['title']}'")

    #     # Validate root element
    #     if root.tag.lower() not in ['chapter', 'chpter']:
    #         logger.warning(f"Root tag is <{root.tag}>, expected <chapter>")

    #     # Create chapter
    #     chapter_data = {
    #         "book_fk": book_pk,
    #         "title": root.get("title"),
    #         "chapter_number_display": root.get("id"),
    #         "chapter_order": book_details.get("current_chapter_order", 1)
    #     }
    #     chapter_pk = insert_and_return_pk("chapters", chapter_data, "chapter_pk")
    #     logger.info(f"Created Chapter - PK: {chapter_pk}, Title: '{chapter_data['title']}'")

    #     # Process topics
    #     topics_processed = 0
    #     for topic_idx, topic_elem in enumerate(root.findall("topic"), start=1):
    #         try:
    #             topic_data = {
    #                 "chapter_fk": chapter_pk,
    #                 "topic_xml_id": topic_elem.get("id"),
    #                 "title": topic_elem.get("title"),
    #                 "order_in_chapter": topic_idx
    #             }
    #             topic_pk = insert_and_return_pk("topics", topic_data, "topic_pk")
    #             logger.info(f"Created Topic - PK: {topic_pk}, Title: '{topic_data['title']}'")

    #             # Process sections (including memory techniques if present)
    #             sections_processed = 0
    #             for section_idx, section_elem in enumerate(topic_elem.findall("section"), start=1):
    #                 try:
    #                     section_data = {
    #                         "topic_fk": topic_pk,
    #                         "section_type_xml": section_elem.get("type"),
    #                         "title": section_elem.get("title"),
    #                         "order_in_topic": section_idx
    #                     }
    #                     section_pk = insert_and_return_pk("sections", section_data, "section_pk")
    #                     logger.info(f"Created Section - PK: {section_pk}, Type: '{section_data['section_type_xml']}'")

    #                     # Process section content with enhanced processing
    #                     section_type = section_elem.get("type", "UNKNOWN")
    #                     elements_processed = process_section_content_enhanced(section_elem, section_pk, section_type)
    #                     logger.debug(f"Processed {elements_processed} elements in section {section_pk}")
    #                     sections_processed += 1

    #                 except Exception as e:
    #                     logger.error(f"Error processing section {section_idx} in topic {topic_pk}: {str(e)}")
    #                     continue

    #             logger.info(f"Topic {topic_pk} completed: {sections_processed} sections processed")
    #             topics_processed += 1

    #         except Exception as e:
    #             logger.error(f"Error processing topic {topic_idx}: {str(e)}")
    #             continue

    #     logger.info(f"XML processing completed: {topics_processed} topics processed")
    #     return book_pk

    # except Exception as e:
    #     logger.error(f"Critical error in process_xml: {str(e)}")
    #     raise

# --- Main Execution Examples ---
if __name__ == "__main__":
    logger.info("=== Starting Enhanced XML Ingestion Process ===")

    # Example 1: Add memory techniques section to a single topic
    # add_section_to_topic(
    #     section_xml_file="mem-tech-sample.xml",
    #     book_pk=1,
    #     chapter_number="1",
    #     topic_xml_id="1.1",
    #     conflict_behavior="replace"  # Will replace existing memory techniques
    # )

    # Example 2: Add question bank to multiple topics
    # topic_list = [
    #     {'chapter_number': '1', 'topic_xml_id': '1.1'},
    #     {'chapter_number': '1', 'topic_xml_id': '1.2'},
    #     {'chapter_number': '1', 'topic_xml_id': '1.3'},
    # ]
    # results = add_sections_to_multiple_topics(
    #     section_xml_file="question-bank-sample.xml",
    #     book_pk=1,
    #     topic_mappings=topic_list,
    #     conflict_behavior="replace"
    # )

    # Example 3: Process full chapter (original functionality - backward compatible)
    # current_book_details = {
    #     "title": "Chemistry Grade 9 (Punjab Board)",
    #     "board_name": "Punjab Textbook Board",
    #     "grade_name": "Grade 9",
    #     "subject": "Chemistry",
    #     "author": "PTB Authors",
    #     "publication_year": 2023,
    #     "isbn": "978-PTB-CHEM-G9-01",
    #     "edition": "2023 Edition",
    #     "description": "Official Chemistry Book for Grade 9 by Punjab Textbook Board.",
    #     "language": "English",
    #     "country": "Pakistan",
    #     "current_chapter_order": 1
    # }
    # process_xml("app-chapter1.xml", current_book_details, process_type="full")

    # Example 4: Add any new section type (completely agnostic)
    # add_section_to_topic(
    #     section_xml_file="new-experimental-section.xml",
    #     book_pk=1,
    #     chapter_number="1",
    #     topic_xml_id="1.1",
    #     conflict_behavior="append"  # Add even if similar type exists
    # )

    logger.info("=== Enhanced XML Ingestion Process Completed ===")
