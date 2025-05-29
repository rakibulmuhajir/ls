#!/usr/bin/env python3
"""
XML Educational Content Word Extractor
Extracts words from XML topics and generates meanings using local Ollama models
Creates CSV output with words, meanings, and source topics
"""

import xml.etree.ElementTree as ET
import csv
import re
import json
import requests
import asyncio
import aiohttp
from collections import defaultdict, Counter
from typing import Dict, List, Set, Optional, Tuple
import nltk
from nltk.corpus import stopwords, wordnet
from nltk.tag import pos_tag
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.collocations import BigramCollocationFinder, BigramAssocMeasures, TrigramCollocationFinder, TrigramAssocMeasures
import argparse
import logging
from pathlib import Path
import time
from tqdm import tqdm
import os
import concurrent.futures
import sys

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    print("NLTK data download failed - continuing anyway")

class XMLWordExtractor:
    def __init__(self, ollama_host="http://localhost:11434", model_name="gemma3:12b",
                 use_phrases=False, spacy_model=None, verbose=False):
        # Initialize logger FIRST
        self.verbose = verbose
        self.setup_logging()

        self.ollama_host = ollama_host
        self.model_name = model_name
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.cache_file = "word_cache.json"
        self.cache_path = Path(self.cache_file).absolute()
        self.use_phrases = use_phrases
        self.spacy_model = spacy_model
        self.nlp = None
        self.load_cache()

        if spacy_model:
            try:
                import spacy
                self.nlp = spacy.load(spacy_model)
                self.logger.info(f"Loaded spaCy model: {spacy_model}")
            except ImportError:
                self.logger.warning("spaCy not installed. Falling back to NLTK.")
            except Exception as e:
                self.logger.error(f"Error loading spaCy model: {e}")

        # Extended stop words for educational content
        self.extended_stop_words = self.stop_words.union({
            'also', 'however', 'therefore', 'thus', 'moreover', 'furthermore',
            'additionally', 'consequently', 'meanwhile', 'nevertheless',
            'chapter', 'section', 'figure', 'table', 'page', 'example',
            'exercise', 'question', 'answer', 'solution', 'explanation'
        })

        # Patterns to exclude (formulas, references, etc.)
        self.exclude_patterns = [
            r'^[A-Z]{2,}$',                    # All caps (acronyms)
            r'^\d+$',                          # Pure numbers
            r'^[a-zA-Z]$',                     # Single letters
            r'^\d+[a-zA-Z]+\d*$',             # Formulas like H2O, CO2
            r'^[a-zA-Z]+\d+[a-zA-Z]*\d*$',    # Mixed alphanumeric
            r'^(Fig|Table|Chapter|Page|Ex|Q)\.',  # Reference abbreviations
            r'[^\w\s-]',                       # Special characters (except hyphens)
            r'^\w{1,2}$',                     # Very short words
            r'^\w{25,}$',                     # Very long words (likely errors)
        ]

        # Subject-specific terms to prioritize
        self.educational_keywords = {
            'science': ['hypothesis', 'theory', 'experiment', 'observation', 'analysis'],
            'math': ['equation', 'variable', 'function', 'solution', 'calculate'],
            'biology': ['organism', 'evolution', 'genetics', 'ecosystem', 'species'],
            'chemistry': ['element', 'compound', 'reaction', 'molecule', 'atomic'],
            'physics': ['force', 'energy', 'motion', 'wave', 'particle', 'velocity']
        }

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('word_extraction.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info("Logging initialized")

        # Add verbose logging to stdout
        if self.verbose:
            verbose_handler = logging.StreamHandler(sys.stdout)
            verbose_handler.setLevel(logging.DEBUG)
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            verbose_handler.setFormatter(formatter)
            self.logger.addHandler(verbose_handler)
            self.logger.setLevel(logging.DEBUG)

    def load_cache(self):
        """Load word definitions from cache file"""
        self.cache = {}
        try:
            if self.cache_path.exists():
                with open(self.cache_path, 'r') as f:
                    self.cache = json.load(f)
                self.logger.info(f"Loaded cache from {self.cache_path} with {len(self.cache)} entries")
                if self.verbose:
                    print(f"\n📦 Cache contents ({len(self.cache)} words):")
                    for i, (word, meaning) in enumerate(self.cache.items(), 1):
                        print(f"  {i}. {word}: {meaning.get('definition', '')[:60]}...")
                    print()
        except Exception as e:
            self.logger.warning(f"Error loading cache: {e}")

    def save_cache(self):
        """Save word definitions to cache file"""
        try:
            with open(self.cache_path, 'w') as f:
                json.dump(self.cache, f, indent=2)
            self.logger.info(f"Saved cache to {self.cache_path} with {len(self.cache)} entries")

            if self.verbose:
                print(f"\n💾 Saved cache to {self.cache_path} with {len(self.cache)} entries")
                print("Sample cache entries:")
                for i, (word, meaning) in enumerate(list(self.cache.items())[:5], 1):
                    print(f"  {i}. {word}: {meaning.get('definition', '')[:60]}...")
        except Exception as e:
            self.logger.error(f"Error saving cache: {e}")

    def check_model_available(self) -> bool:
        """Check if the specified model is available on Ollama server"""
        try:
            response = requests.get(f"{self.ollama_host}/api/tags")
            response.raise_for_status()
            models = [model['name'] for model in response.json().get('models', [])]
            return any(self.model_name in model for model in models)
        except Exception as e:
            self.logger.error(f"Error checking model availability: {e}")
            return False

    def parse_xml_content(self, xml_file: str, skip_sections: List[str] = None) -> Dict[str, Dict]:
        """Parse XML and extract content by topics/sections with hierarchy"""
        if skip_sections is None:
            skip_sections = []

        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()

            topics_content = {}
            parent_stack = []  # Stack to track parent elements
            topic_counter = 1

            # Recursive function to traverse XML with hierarchy
            def traverse_element(element, current_path=""):
                nonlocal topic_counter

                # Build hierarchical path
                element_id = element.get('id', element.get('name', f"topic_{topic_counter}"))
                element_title = element.get('type', element.get('name', element_id))
                full_path = f"{current_path}/{element_id}" if current_path else element_id
                hierarchical_title = f"{current_path}/{element_title}" if current_path else element_title

                # Skip if in skip list
                if element_id in skip_sections or element_title in skip_sections:
                    self.logger.info(f"Skipping section: {hierarchical_title}")
                    return

                # Extract content if it's a topic element
                if element.tag.lower() in ['topic', 'section', 'chapter', 'lesson']:
                    # Extract content from this element
                    content_parts = []
                    for text_elem in element.iter():
                        if text_elem is element:  # Skip self to avoid duplicate content
                            continue
                        if text_elem.text and text_elem.text.strip():
                            content_parts.append(text_elem.text.strip())
                        if text_elem.tail and text_elem.tail.strip():
                            content_parts.append(text_elem.tail.strip())

                    topics_content[full_path] = {
                        'id': element_id,
                        'title': element_title,
                        'hierarchical_title': hierarchical_title,
                        'content': ' '.join(content_parts),
                        'word_count': 0,
                        'unique_words': [],
                        'parent_path': current_path
                    }
                    topic_counter += 1
                    current_path = full_path  # Update path for children

                # Process children recursively
                for child in element:
                    traverse_element(child, current_path)

            # Start traversal from root
            traverse_element(root)

            # If no specific topic tags found, treat entire content as one topic
            if not topics_content:
                self.logger.warning("No topic elements found. Treating entire document as one topic.")
                all_text = []
                for elem in root.iter():
                    if elem.text and elem.text.strip():
                        all_text.append(elem.text.strip())
                    if elem.tail and elem.tail.strip():
                        all_text.append(elem.tail.strip())

                topics_content['general'] = {
                    'id': 'general',
                    'title': 'General Content',
                    'hierarchical_title': 'General Content',
                    'content': ' '.join(all_text),
                    'word_count': 0,
                    'unique_words': [],
                    'parent_path': ''
                }

            self.logger.info(f"Extracted {len(topics_content)} topics from XML")
            return topics_content

        except Exception as e:
            self.logger.error(f"Error parsing XML file {xml_file}: {e}")
            return {}

    def extract_phrases(self, text: str, min_freq: int = 2) -> List[str]:
        """Extract meaningful phrases (bigrams and trigrams) from text"""
        tokens = word_tokenize(text)

        # Find significant bigrams
        bigram_measures = BigramAssocMeasures()
        bigram_finder = BigramCollocationFinder.from_words(tokens)
        bigram_finder.apply_freq_filter(min_freq)
        bigrams = bigram_finder.nbest(bigram_measures.pmi, 10)

        # Find significant trigrams
        trigram_measures = TrigramAssocMeasures()
        trigram_finder = TrigramCollocationFinder.from_words(tokens)
        trigram_finder.apply_freq_filter(min_freq)
        trigrams = trigram_finder.nbest(trigram_measures.pmi, 5)

        # Convert to phrase strings
        phrases = set()
        for bigram in bigrams:
            phrase = "_".join(bigram)
            phrases.add(phrase)

        for trigram in trigrams:
            phrase = "_".join(trigram)
            phrases.add(phrase)

        return list(phrases)

    def extract_meaningful_words(self, text: str) -> List[str]:
        """Extract meaningful words from text content"""
        # Clean text
        text = re.sub(r'<[^>]+>', '', text)  # Remove HTML tags
        text = re.sub(r'[^\w\s-]', ' ', text)  # Keep only words, spaces, hyphens
        text = re.sub(r'\s+', ' ', text).strip().lower()

        # Extract phrases if enabled
        phrases = []
        if self.use_phrases:
            phrases = self.extract_phrases(text)

        # Tokenize
        tokens = word_tokenize(text)

        # If spaCy is available, use it for more accurate processing
        if self.nlp:
            return self._extract_with_spacy(text, phrases)

        # Fallback to NLTK processing
        meaningful_words = []
        for token in tokens:
            # Skip if matches exclude patterns
            if any(re.match(pattern, token, re.IGNORECASE) for pattern in self.exclude_patterns):
                continue

            # Skip stop words
            if token.lower() in self.extended_stop_words:
                continue

            # Skip very short or long words
            if len(token) < 3 or len(token) > 20:
                continue

            # Must be a real English word (check with WordNet)
            if not wordnet.synsets(token):
                continue

            # Check if it's educationally relevant
            if self._is_educational_word(token):
                meaningful_words.append(token)

        # Add phrases
        meaningful_words.extend(phrases)

        return list(set(meaningful_words))  # Remove duplicates

    def _extract_with_spacy(self, text: str, phrases: List[str]) -> List[str]:
        """Extract meaningful words using spaCy for more accurate processing"""
        try:
            doc = self.nlp(text)
            meaningful_words = []

            for token in doc:
                # Skip stop words, punctuation, spaces
                if token.is_stop or token.is_punct or token.is_space:
                    continue

                # Skip if matches exclude patterns
                if any(re.match(pattern, token.text, re.IGNORECASE) for pattern in self.exclude_patterns):
                    continue

                # Skip very short or long words
                if len(token.text) < 3 or len(token.text) > 20:
                    continue

                # Focus on educational word types
                educational_pos = {'NOUN', 'VERB', 'ADJ', 'ADV'}
                if token.pos_ not in educational_pos:
                    continue

                # Check if it's educationally relevant
                if self._is_educational_word(token.text):
                    meaningful_words.append(token.lemma_.lower())

            # Add phrases
            meaningful_words.extend(phrases)

            return list(set(meaningful_words))
        except Exception as e:
            self.logger.error(f"spaCy processing error: {e}")
            return []

    def _is_educational_word(self, word: str) -> bool:
        """Check if word is educationally relevant"""
        # POS tagging to get word type
        pos_tags = pos_tag([word])
        if not pos_tags:
            return False

        _, pos = pos_tags[0]

        # Focus on educational word types
        educational_pos = ['NN', 'NNS', 'VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'JJ', 'JJR', 'JJS', 'RB']

        if pos not in educational_pos:
            return False

        # Prioritize subject-specific terms
        word_lower = word.lower()
        for subject_terms in self.educational_keywords.values():
            if word_lower in subject_terms:
                return True

        # Check word complexity (prefer complex educational terms)
        if len(word) >= 5 and any(char in word for char in 'aeiou'):
            return True

        return len(word) >= 4  # Basic length filter

    async def get_word_meaning(self, word: str, context: str = "") -> Optional[Dict[str, str]]:
        """Get word meaning from Ollama model with retry logic"""
        # Check cache first
        if word in self.cache:
            if self.verbose:
                print(f"\n🔍 [CACHED] Word: {word}")
                meaning = self.cache[word]
                print(f"   Type: {meaning.get('type', 'unknown')}")
                print(f"   Definition: {meaning.get('definition', '')}")
                print(f"   Example: {meaning.get('example', '')}")
                print(f"   Difficulty: {meaning.get('difficulty', 2)}")
            return self.cache[word]

        if self.verbose:
            print(f"\n🧠 Processing: {word}")

        # Determine part of speech
        pos_tags = pos_tag([word])
        pos = pos_tags[0][1] if pos_tags else "unknown"

        # Map POS tags to readable forms
        pos_map = {
            'NN': 'noun', 'NNS': 'noun', 'NNP': 'proper noun', 'NNPS': 'proper noun',
            'VB': 'verb', 'VBD': 'verb', 'VBG': 'verb', 'VBN': 'verb', 'VBP': 'verb', 'VBZ': 'verb',
            'JJ': 'adjective', 'JJR': 'adjective', 'JJS': 'adjective',
            'RB': 'adverb', 'RBR': 'adverb', 'RBS': 'adverb'
        }

        readable_pos = pos_map.get(pos, 'word')

        prompt = f"""
Define the word "{word}" ({readable_pos}) in simple, clear language suitable for students.

Provide ONLY a JSON response with these fields:
- "word": the word being defined
- "type": part of speech (noun, verb, adjective, adverb, etc.)
- "definition": clear, simple definition (under 50 words)
- "example": one sentence showing the word in use
- "difficulty": number from 1-5 (1=basic, 5=advanced)

Context: This word appears in educational content about: {context}

Example response:
{{
    "word": "hypothesis",
    "type": "noun",
    "definition": "An educated guess or prediction that can be tested through experiments",
    "example": "The scientist formed a hypothesis about why plants grow faster in sunlight.",
    "difficulty": 3
}}

Respond ONLY with valid JSON:"""

        # Retry logic with exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{self.ollama_host}/api/generate",
                        json={
                            "model": self.model_name,
                            "prompt": prompt,
                            "stream": False,
                            "options": {
                                "temperature": 0.2,
                                "top_p": 0.8,
                                "num_predict": 150
                            }
                        },
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            content = result.get('response', '').strip()

                            # Extract JSON from response
                            try:
                                # Find JSON in the response
                                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                                if json_match:
                                    json_data = json.loads(json_match.group())
                                    # Validate required fields
                                    required_fields = ['word', 'type', 'definition', 'example', 'difficulty']
                                    if all(field in json_data for field in required_fields):
                                        # Cache and return
                                        self.cache[word] = json_data

                                        if self.verbose:
                                            print(f"✅ Processed: {word}")
                                            print(f"   Type: {json_data.get('type', 'unknown')}")
                                            print(f"   Definition: {json_data.get('definition', '')}")
                                            print(f"   Example: {json_data.get('example', '')}")
                                            print(f"   Difficulty: {json_data.get('difficulty', 2)}")

                                        return json_data
                            except json.JSONDecodeError:
                                pass

                            # Fallback: create basic definition
                            fallback = {
                                "word": word,
                                "type": readable_pos,
                                "definition": f"Educational term related to {word}",
                                "example": f"The concept of {word} is important in this subject.",
                                "difficulty": 2
                            }
                            self.cache[word] = fallback

                            if self.verbose:
                                print(f"⚠️  Fallback definition for: {word}")
                                print(f"   Definition: {fallback['definition']}")

                            return fallback
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                wait_time = 2 ** attempt  # Exponential backoff
                self.logger.warning(f"Attempt {attempt+1} failed for '{word}': {e}. Retrying in {wait_time}s")
                if self.verbose:
                    print(f"⚠️  Attempt {attempt+1} failed for '{word}': {e}. Retrying in {wait_time}s")
                await asyncio.sleep(wait_time)
            except Exception as e:
                self.logger.error(f"Unexpected error for '{word}': {e}")
                if self.verbose:
                    print(f"❌ Unexpected error for '{word}': {e}")
                break

        self.logger.error(f"Failed to get meaning for '{word}' after {max_retries} attempts")
        if self.verbose:
            print(f"❌ Failed to process '{word}' after {max_retries} attempts")
        return None

    async def process_topics(self, topics_content: Dict[str, Dict], batch_size: int = 5) -> List[Dict]:
        """Process all topics and extract word meanings with progress tracking"""
        all_word_data = []
        processed_words = set()  # Track to avoid duplicates

        # First pass: extract words from all topics
        self.logger.info("Extracting words from topics...")
        topics = list(topics_content.items())

        # Process topics sequentially to avoid multiprocessing issues
        for topic_id, topic_info in tqdm(topics, desc="Processing Topics"):
            try:
                words = self.extract_meaningful_words(topic_info['content'])
                topic_info['word_count'] = len(words)
                topic_info['unique_words'] = words

                if self.verbose:
                    print(f"\n📝 Topic: {topic_info['title']}")
                    print(f"   Words: {len(words)}")
                    print(f"   Sample: {', '.join(words[:5])}{'...' if len(words) > 5 else ''}")
            except Exception as e:
                self.logger.error(f"Error processing topic {topic_id}: {e}")
                topic_info['word_count'] = 0
                topic_info['unique_words'] = []

        # Prepare all words to process
        all_words = []
        for topic_id, topic_info in topics:
            all_words.extend([(w, topic_id, topic_info['hierarchical_title'])
                             for w in topic_info['unique_words']
                             if w not in processed_words])

        # Process words in batches with progress bar
        total_words = len(all_words)
        self.logger.info(f"Processing {total_words} unique words...")

        if total_words == 0:
            return []

        # Process batches with progress tracking
        pbar = tqdm(total=total_words, desc="Words Processed")
        for i in range(0, total_words, batch_size):
            batch = all_words[i:i + batch_size]
            self.logger.debug(f"Processing batch {i//batch_size + 1} with {len(batch)} words")

            # Process batch
            tasks = []
            for word, topic_id, topic_title in batch:
                task = self.get_word_meaning(word, topic_title)
                tasks.append((word, topic_id, topic_title, task))

            # Wait for all tasks in batch
            for word, t_id, t_title, task in tasks:
                meaning_data = await task
                if meaning_data:
                    word_entry = {
                        'word': word,
                        'topic_id': t_id,
                        'topic_title': t_title,
                        'type': meaning_data.get('type', 'unknown'),
                        'definition': meaning_data.get('definition', ''),
                        'example': meaning_data.get('example', ''),
                        'difficulty': meaning_data.get('difficulty', 2)
                    }
                    all_word_data.append(word_entry)
                    processed_words.add(word)
                    pbar.update(1)

                # Small delay to prevent overwhelming Ollama
                await asyncio.sleep(0.2)

            # Longer delay between batches
            await asyncio.sleep(1)

        pbar.close()
        return all_word_data

    def create_csv_output(self, word_data: List[Dict], output_file: str):
        """Create CSV file with word meanings"""
        fieldnames = ['word', 'topic_id', 'topic_title', 'type', 'definition', 'example', 'difficulty']
        output_path = Path(output_file).absolute()

        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            # Sort by topic, then by word
            sorted_data = sorted(word_data, key=lambda x: (x['topic_id'], x['word']))
            writer.writerows(sorted_data)

        self.logger.info(f"CSV output saved to {output_path}")
        if self.verbose:
            print(f"\n💾 CSV output saved to {output_path}")
            print("Sample output:")
            for i, row in enumerate(sorted_data[:5], 1):
                print(f"  {i}. {row['word']} ({row['type']}): {row['definition'][:60]}...")

async def main():
    parser = argparse.ArgumentParser(description='Extract words and meanings from educational XML content')
    parser.add_argument('xml_file', help='Path to XML file')
    parser.add_argument('--output', '-o', default='word_meanings.csv', help='Output CSV file')
    parser.add_argument('--skip', nargs='*', default=[], help='Section IDs or titles to skip')
    parser.add_argument('--batch-size', '-b', type=int, default=5, help='Batch size for processing')
    parser.add_argument('--ollama-host', default='http://localhost:11434', help='Ollama host URL')
    parser.add_argument('--model', '-m', default='llama3.2:latest', help='Ollama model name')
    parser.add_argument('--summary', '-s', help='Generate summary report file')
    parser.add_argument('--phrases', action='store_true', help='Enable phrase detection (bigrams/trigrams)')
    parser.add_argument('--spacy-model', help='spaCy model for enhanced NLP processing')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output with word-by-word details')

    args = parser.parse_args()

    # Validate XML file exists
    xml_path = Path(args.xml_file)
    if not xml_path.exists():
        print(f"Error: XML file '{args.xml_file}' not found")
        return

    # Initialize extractor
    extractor = XMLWordExtractor(
        ollama_host=args.ollama_host,
        model_name=args.model,
        use_phrases=args.phrases,
        spacy_model=args.spacy_model,
        verbose=args.verbose
    )

    print(f"🚀 Starting word extraction from: {xml_path.name}")
    print(f"📋 Skip sections: {args.skip if args.skip else 'None'}")
    print(f"🤖 Using model: {args.model}")
    print(f"📝 Output file: {args.output}")
    if args.phrases:
        print("🔤 Phrase detection: Enabled")
    if args.spacy_model:
        print(f"🧠 Using spaCy model: {args.spacy_model}")
    if args.verbose:
        print("🔊 Verbose mode: Enabled")
        print(f"💾 Cache location: {extractor.cache_path}")

    # Validate model availability
    if not extractor.check_model_available():
        print(f"❌ Model {args.model} not found on Ollama server at {args.ollama_host}")
        print("Available models:")
        try:
            response = requests.get(f"{args.ollama_host}/api/tags")
            models = [model['name'] for model in response.json().get('models', [])]
            for model in models:
                print(f"  - {model}")
        except:
            print("  (Unable to retrieve model list)")
        return

    try:
        # Parse XML content
        topics_content = extractor.parse_xml_content(args.xml_file, args.skip)
        if not topics_content:
            print("❌ No content extracted from XML file")
            return

        # Process topics and get word meanings
        word_data = await extractor.process_topics(topics_content, args.batch_size)

        if not word_data:
            print("❌ No words processed successfully")
            return

        # Create CSV output
        extractor.create_csv_output(word_data, args.output)

        # Save cache at end of processing
        extractor.save_cache()

        # Create summary report if requested
        if args.summary:
            extractor.create_summary_report(topics_content, word_data, args.summary)

        print(f"\n✅ Processing complete!")
        print(f"📊 Processed {len(word_data)} words from {len(topics_content)} topics")
        print(f"💾 Results saved to: {args.output}")
        if args.summary:
            print(f"📋 Summary saved to: {args.summary}")
        print(f"💾 Cache saved to: {extractor.cache_path}")

    except KeyboardInterrupt:
        print("\n⏹️ Processing interrupted by user")
        # Save cache before exiting
        extractor.save_cache()
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        extractor.save_cache()

if __name__ == "__main__":
    asyncio.run(main())
