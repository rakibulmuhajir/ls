import logging
from supabase import create_client
import json
import csv
from datetime import datetime
import os
from typing import Dict, List, Optional, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('enrichment_ingestion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --- Supabase Setup ---
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ntvfjkvlgkpcoroyoyss.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dmZqa3ZsZ2twY29yb3lveXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc2OTM4MiwiZXhwIjoyMDYzMzQ1MzgyfQ.9zSJSMGcct8ZHSiwJIr6cSB9oJF8uVHLkQCWqLS_P8w")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class EnrichmentIngester:
    def __init__(self, supabase_client, book_pk: int):
        self.supabase = supabase_client
        self.book_pk = book_pk
        self.topic_cache = {}  # Cache topic_pk lookups
        self.stats = {
            'total_processed': 0,
            'successful_inserts': 0,
            'updates': 0,
            'errors': 0,
            'missing_topics': set()
        }

    def process_enrichments_csv(self, csv_path: str, update_existing: bool = True):
        """
        Process enrichments CSV file

        Args:
            csv_path: Path to the CSV file
            update_existing: Whether to update existing enrichments
        """
        try:
            logger.info(f"Starting enrichment processing for: {csv_path}")
            logger.info(f"Book PK: {self.book_pk}, Update existing: {update_existing}")

            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)

                # Process in batches for efficiency
                batch = []
                batch_size = 50

                for row_num, row in enumerate(reader, start=1):
                    self.stats['total_processed'] += 1

                    try:
                        enrichment = self._process_row(row)
                        if enrichment:
                            batch.append(enrichment)

                        # Process batch when it reaches size limit
                        if len(batch) >= batch_size:
                            self._process_batch(batch, update_existing)
                            batch = []

                    except Exception as e:
                        logger.error(f"Error processing row {row_num}: {str(e)}")
                        self.stats['errors'] += 1
                        continue

                # Process remaining items
                if batch:
                    self._process_batch(batch, update_existing)

            self._print_summary()

        except FileNotFoundError:
            logger.error(f"CSV file not found: {csv_path}")
            raise
        except Exception as e:
            logger.error(f"Critical error processing enrichments: {str(e)}")
            raise

    def process_single_enrichment(self, term: str, topic_id: str, enrichment_json: Dict[str, Any]):
        """
        Process a single enrichment - useful for real-time updates

        Args:
            term: The word/term
            topic_id: Topic XML ID (e.g., "1.1", "8.3")
            enrichment_json: The enrichment data as a dictionary
        """
        try:
            topic_pk = self._get_topic_pk_from_xml_id(topic_id)
            if not topic_pk:
                logger.error(f"Topic {topic_id} not found")
                return False

            enrichment = self._extract_enrichment_data(term, topic_pk, enrichment_json)

            # Try to insert/update
            response = self.supabase.table('topic_enrichments').upsert(
                enrichment,
                on_conflict='word,topic_fk'
            ).execute()

            logger.info(f"Successfully processed enrichment for '{term}' in topic {topic_id}")
            return True

        except Exception as e:
            logger.error(f"Error processing single enrichment: {str(e)}")
            return False

    def update_enrichments_for_topic(self, topic_id: str, enrichments_data: List[Dict]):
        """
        Update all enrichments for a specific topic

        Args:
            topic_id: Topic XML ID
            enrichments_data: List of enrichment dictionaries with 'term' and 'enrichment_data'
        """
        topic_pk = self._get_topic_pk_from_xml_id(topic_id)
        if not topic_pk:
            logger.error(f"Topic {topic_id} not found")
            return

        batch = []
        for item in enrichments_data:
            try:
                json_data = item['enrichment_data'] if isinstance(item['enrichment_data'], dict) else json.loads(item['enrichment_data'])
                enrichment = self._extract_enrichment_data(item['term'], topic_pk, json_data)
                batch.append(enrichment)
            except Exception as e:
                logger.error(f"Error processing enrichment for term '{item.get('term', 'unknown')}': {str(e)}")

        if batch:
            self._process_batch(batch, update_existing=True)
            logger.info(f"Updated {len(batch)} enrichments for topic {topic_id}")

    def _process_row(self, row: Dict) -> Optional[Dict]:
        """Process a single CSV row"""
        term = row.get('term', '').strip()
        topic_id = row.get('topic_id', '').strip()
        enrichment_data = row.get('enrichment_data', '')

        if not term or not topic_id or not enrichment_data:
            logger.warning(f"Missing required fields in row: term='{term}', topic_id='{topic_id}'")
            return None

        # Get topic_pk
        topic_pk = self._get_topic_pk_from_xml_id(topic_id)
        if not topic_pk:
            self.stats['missing_topics'].add(topic_id)
            logger.warning(f"Topic not found for ID: {topic_id}")
            return None

        # Parse JSON data
        try:
            json_data = json.loads(enrichment_data)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error for term '{term}': {e}")
            return None

        # Extract enrichment data
        return self._extract_enrichment_data(term, topic_pk, json_data)

    def _extract_enrichment_data(self, term: str, topic_pk: int, json_data: Dict) -> Dict:
        """Extract and structure enrichment data from JSON"""
        properties = json_data.get('properties', {})

        # Extract all fields with fallbacks
        enrichment = {
            'word': term,
            'topic_fk': topic_pk,
            'book_fk': self.book_pk,
            'explanation': json_data.get('explanation', ''),
            'urdu_meaning': json_data.get('urdu_meaning', ''),
            'term_type': json_data.get('term_type', ''),
            'example_sentence': json_data.get('example_sentence', ''),
            'key_principle': properties.get('key_principle', ''),
            'real_world_example': (
                properties.get('real_world_example') or
                properties.get('example_of_use', '')
            ),
            'related_concepts': properties.get('related_concepts', []),
            'raw_json': json_data
        }

        # Clean empty strings to None for better database storage
        for key, value in enrichment.items():
            if value == '':
                enrichment[key] = None

        return enrichment

    def _get_topic_pk_from_xml_id(self, topic_xml_id: str) -> Optional[int]:
        """
        Get topic_pk from topic_xml_id with caching
        Handles format: "8.3" -> chapter 8, topic 3
        """
        # Check cache first
        if topic_xml_id in self.topic_cache:
            return self.topic_cache[topic_xml_id]

        # Parse topic_xml_id
        parts = topic_xml_id.split('.')
        if len(parts) < 2:
            logger.error(f"Invalid topic_xml_id format: {topic_xml_id}")
            return None

        chapter_num = parts[0]

        try:
            # Find chapter
            chapter_response = self.supabase.table('chapters').select('chapter_pk').eq(
                'chapter_number_display', chapter_num
            ).eq('book_fk', self.book_pk).single().execute()

            if not chapter_response.data:
                logger.warning(f"Chapter {chapter_num} not found for book {self.book_pk}")
                return None

            chapter_pk = chapter_response.data['chapter_pk']

            # Find topic
            topic_response = self.supabase.table('topics').select('topic_pk').eq(
                'topic_xml_id', topic_xml_id
            ).eq('chapter_fk', chapter_pk).single().execute()

            if topic_response.data:
                topic_pk = topic_response.data['topic_pk']
                self.topic_cache[topic_xml_id] = topic_pk
                return topic_pk

        except Exception as e:
            logger.error(f"Database error looking up topic {topic_xml_id}: {str(e)}")

        return None

    def _process_batch(self, batch: List[Dict], update_existing: bool):
        """Process a batch of enrichments"""
        if not batch:
            return

        try:
            # Check for existing entries
            words = [item['word'] for item in batch]
            topic_fks = list(set(item['topic_fk'] for item in batch))

            existing_response = self.supabase.table('topic_enrichments').select(
                'word, topic_fk'
            ).in_('word', words).in_('topic_fk', topic_fks).execute()

            existing_set = set()
            if existing_response.data:
                existing_set = {(item['word'], item['topic_fk']) for item in existing_response.data}

            # Separate new and existing items
            new_items = []
            update_items = []

            for item in batch:
                key = (item['word'], item['topic_fk'])
                if key in existing_set:
                    if update_existing:
                        update_items.append(item)
                else:
                    new_items.append(item)

            # Insert new items
            if new_items:
                response = self.supabase.table('topic_enrichments').insert(new_items).execute()
                self.stats['successful_inserts'] += len(new_items)
                logger.info(f"Inserted {len(new_items)} new enrichments")

            # Update existing items
            if update_items and update_existing:
                # Update one by one due to composite key
                for item in update_items:
                    try:
                        self.supabase.table('topic_enrichments').update(item).eq(
                            'word', item['word']
                        ).eq('topic_fk', item['topic_fk']).execute()
                        self.stats['updates'] += 1
                    except Exception as e:
                        logger.error(f"Error updating enrichment for '{item['word']}': {str(e)}")
                        self.stats['errors'] += 1

                logger.info(f"Updated {len(update_items)} existing enrichments")

        except Exception as e:
            logger.error(f"Error processing batch: {str(e)}")
            self.stats['errors'] += len(batch)

    def _print_summary(self):
        """Print processing summary"""
        logger.info("=== Enrichment Processing Summary ===")
        logger.info(f"Total rows processed: {self.stats['total_processed']}")
        logger.info(f"Successful inserts: {self.stats['successful_inserts']}")
        logger.info(f"Updates: {self.stats['updates']}")
        logger.info(f"Errors: {self.stats['errors']}")

        if self.stats['missing_topics']:
            logger.warning(f"Missing topics: {sorted(self.stats['missing_topics'])}")

    def get_enrichment_stats(self) -> Dict:
        """Get statistics about enrichments in the database"""
        try:
            # Total enrichments
            total_response = self.supabase.table('topic_enrichments').select(
                'word', count='exact'
            ).eq('book_fk', self.book_pk).execute()

            # Enrichments by topic
            by_topic_response = self.supabase.table('topic_enrichments').select(
                'topic_fk, topics!inner(topic_xml_id, title)'
            ).eq('book_fk', self.book_pk).execute()

            # Group by topic
            topic_counts = {}
            if by_topic_response.data:
                for item in by_topic_response.data:
                    topic_info = item.get('topics', {})
                    topic_id = topic_info.get('topic_xml_id', 'Unknown')
                    topic_title = topic_info.get('title', 'Unknown')
                    key = f"{topic_id}: {topic_title}"
                    topic_counts[key] = topic_counts.get(key, 0) + 1

            # Enrichments by type
            by_type_response = self.supabase.table('topic_enrichments').select(
                'term_type'
            ).eq('book_fk', self.book_pk).execute()

            type_counts = {}
            if by_type_response.data:
                for item in by_type_response.data:
                    term_type = item.get('term_type') or 'unspecified'
                    type_counts[term_type] = type_counts.get(term_type, 0) + 1

            return {
                'total_enrichments': total_response.count if hasattr(total_response, 'count') else 0,
                'enrichments_by_topic': topic_counts,
                'enrichments_by_type': type_counts
            }

        except Exception as e:
            logger.error(f"Error getting enrichment stats: {str(e)}")
            return {}

    def validate_enrichments(self) -> Dict:
        """Validate enrichments data quality"""
        try:
            # Get all enrichments
            response = self.supabase.table('topic_enrichments').select(
                'enrichment_pk, word, explanation, example_sentence, key_principle'
            ).eq('book_fk', self.book_pk).execute()

            issues = {
                'missing_explanation': [],
                'missing_example': [],
                'missing_key_principle': [],
                'short_explanation': []
            }

            if response.data:
                for item in response.data:
                    word = item.get('word', 'Unknown')

                    if not item.get('explanation'):
                        issues['missing_explanation'].append(word)
                    elif len(item.get('explanation', '')) < 50:
                        issues['short_explanation'].append(word)

                    if not item.get('example_sentence'):
                        issues['missing_example'].append(word)

                    if not item.get('key_principle'):
                        issues['missing_key_principle'].append(word)

            return issues

        except Exception as e:
            logger.error(f"Error validating enrichments: {str(e)}")
            return {}


# --- Utility Functions ---
def export_enrichments_to_csv(book_pk: int, output_path: str):
    """Export enrichments back to CSV for backup or editing"""
    try:
        response = supabase.table('topic_enrichments').select(
            'word, topics!inner(topic_xml_id), raw_json'
        ).eq('book_fk', book_pk).execute()

        if response.data:
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=['term', 'topic_id', 'enrichment_data'])
                writer.writeheader()

                for item in response.data:
                    writer.writerow({
                        'term': item['word'],
                        'topic_id': item['topics']['topic_xml_id'],
                        'enrichment_data': json.dumps(item['raw_json'])
                    })

            logger.info(f"Exported {len(response.data)} enrichments to {output_path}")

    except Exception as e:
        logger.error(f"Error exporting enrichments: {str(e)}")


# --- Main Execution ---
if __name__ == "__main__":
    logger.info("=== Starting Enrichment Ingestion Process ===")

    # Initialize ingester
    book_pk = 1  # Your current book
    ingester = EnrichmentIngester(supabase, book_pk)

    # Process full CSV file
    # ingester.process_enrichments_csv('enriched_sample.csv', update_existing=True)

    # Process single enrichment (for real-time updates)
    # sample_enrichment = {
    #     "explanation": "A chemical reaction where...",
    #     "urdu_meaning": "کیمیائی رد عمل",
    #     "term_type": "concept",
    #     "example_sentence": "Combustion is an example of...",
    #     "properties": {
    #         "key_principle": "Oxidation process",
    #         "real_world_example": "Burning of fuel"
    #     }
    # }
    # ingester.process_single_enrichment("combustion", "2.1", sample_enrichment)

    # Update enrichments for a specific topic
    # topic_enrichments = [
    #     {
    #         "term": "atom",
    #         "enrichment_data": {...}
    #     },
    #     {
    #         "term": "molecule",
    #         "enrichment_data": {...}
    #     }
    # ]
    # ingester.update_enrichments_for_topic("1.1", topic_enrichments)

    # Get statistics
    # stats = ingester.get_enrichment_stats()
    # print(json.dumps(stats, indent=2))

    # Validate data quality
    # issues = ingester.validate_enrichments()
    # if issues:
    #     print("Data quality issues found:")
    #     print(json.dumps(issues, indent=2))

    # Export for backup
    # export_enrichments_to_csv(book_pk, 'enrichments_backup.csv')

    logger.info("=== Enrichment Ingestion Process Completed ===")
