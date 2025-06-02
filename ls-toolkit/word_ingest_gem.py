import logging
from supabase import create_client, Client
import json
import csv
import os
from typing import Dict, List, Optional, Any

# Setup logging (same as before)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('word_ingestion_final.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Supabase Setup (same as before)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ntvfjkvlgkpcoroyoyss.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dmZqa3ZsZ2twY29yb3lveXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc2OTM4MiwiZXhwIjoyMDYzMzQ1MzgyfQ.9zSJSMGcct8ZHSiwJIr6cSB9oJF8uVHLkQCWqLS_P8w")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class WordDefinitionIngester:
    def __init__(self, supabase_client: Client, book_pk: int = 1):
        self.supabase = supabase_client
        self.book_pk = book_pk
        self.topic_cache: Dict[str, int] = {}
        self.stats = {
            'csv_rows_processed': 0,
            'words_upserted': 0,
            'topic_word_links_created': 0, # Or processed
            'errors': 0,
            'skipped_rows_missing_data': 0,
            'skipped_rows_missing_topic': set()
        }

    def _get_topic_pk_from_xml_id(self, topic_xml_id_from_csv: str) -> Optional[int]:
        """
        Get topic_pk from topic_xml_id (e.g., "1.5" from CSV) unique within a book.
        Uses chapters.chapter_number_display and topics.topic_xml_id (primary) or topics.order_in_chapter (fallback).
        """
        if not topic_xml_id_from_csv:
            return None
        if topic_xml_id_from_csv in self.topic_cache: # Check cache first
            return self.topic_cache[topic_xml_id_from_csv]

        try:
            parts = topic_xml_id_from_csv.split('.')
            if not parts:
                logger.error(f"Cannot parse chapter number from topic_xml_id_from_csv: '{topic_xml_id_from_csv}'.")
                return None
            chapter_num_display_from_csv = parts[0]

            chapter_res = self.supabase.table('chapters').select('chapter_pk').eq(
                'book_fk', self.book_pk
            ).eq(
                'chapter_number_display', chapter_num_display_from_csv
            ).maybe_single().execute()

            if not chapter_res.data:
                logger.warning(f"Chapter '{chapter_num_display_from_csv}' (from CSV ID '{topic_xml_id_from_csv}') not found for book_pk {self.book_pk}.")
                return None

            chapter_pk_for_scope = chapter_res.data['chapter_pk']

            # Primary attempt: Match topics.topic_xml_id (e.g., "1.5") within the found chapter
            topic_res = self.supabase.table('topics').select('topic_pk').eq(
                'chapter_fk', chapter_pk_for_scope
            ).eq(
                'topic_xml_id', topic_xml_id_from_csv
            ).maybe_single().execute()

            if topic_res.data:
                topic_pk_val = topic_res.data['topic_pk']
                self.topic_cache[topic_xml_id_from_csv] = topic_pk_val
                logger.debug(f"Found topic_pk {topic_pk_val} for CSV ID '{topic_xml_id_from_csv}' via topics.topic_xml_id (Book: {self.book_pk}, Chapter PK: {chapter_pk_for_scope}).")
                return topic_pk_val

            # Fallback attempt: Use order_in_chapter if topics.topic_xml_id didn't match or isn't populated
            if len(parts) == 2:
                try:
                    topic_order_int = int(parts[1])
                    fallback_topic_res = self.supabase.table('topics').select('topic_pk').eq(
                        'chapter_fk', chapter_pk_for_scope
                    ).eq(
                        'order_in_chapter', topic_order_int
                    ).maybe_single().execute()

                    if fallback_topic_res.data:
                        topic_pk_val = fallback_topic_res.data['topic_pk']
                        self.topic_cache[topic_xml_id_from_csv] = topic_pk_val
                        logger.info(f"Found topic_pk {topic_pk_val} for CSV ID '{topic_xml_id_from_csv}' via fallback (order_in_chapter for Chapter PK {chapter_pk_for_scope}).")
                        return topic_pk_val
                except ValueError:
                    logger.warning(f"Invalid topic order in CSV ID for fallback: '{topic_xml_id_from_csv}'.")

            logger.warning(f"Topic with CSV ID '{topic_xml_id_from_csv}' not found in Chapter PK {chapter_pk_for_scope} (Book PK {self.book_pk}).")
            return None

        except Exception as e:
            logger.error(f"DB error looking up topic for CSV ID '{topic_xml_id_from_csv}': {e}", exc_info=True)
            return None

    def _extract_row_data(self, csv_row: Dict) -> Optional[Dict]:
        """Extracts data for a single word entry from a CSV row."""
        term = csv_row.get('term', '').strip()
        topic_id_str = csv_row.get('topic_id', '').strip()
        enrichment_json_str = csv_row.get('enrichment_data', '')

        if not term or not topic_id_str or not enrichment_json_str:
            logger.warning(f"Missing required fields in CSV row: term='{term}', topic_id='{topic_id_str}'")
            self.stats['skipped_rows_missing_data'] += 1
            return None

        try:
            enrichment_data = json.loads(enrichment_json_str)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in enrichment_data for term '{term}', topic_id '{topic_id_str}'")
            self.stats['errors'] += 1
            return None

        topic_pk = self._get_topic_pk_from_xml_id(topic_id_str)
        if not topic_pk:
            logger.warning(f"Topic_pk not found for topic_id '{topic_id_str}' (term: '{term}')")
            self.stats['skipped_rows_missing_topic'].add(topic_id_str)
            return None

        normalized_word_text = term.lower()
        meaning_from_json = enrichment_data.get('explanation', '')
        explanation_from_json = enrichment_data.get('example_sentence', '')
        urdu_meaning_from_json = enrichment_data.get('urdu_meaning', '')
        term_type_from_json = enrichment_data.get('term_type') # Allow None if missing
        additional_props_from_json = enrichment_data.get('properties', {})

        return {
            'normalized_word_text': normalized_word_text,
            'meaning': meaning_from_json,
            'explanation_detail': explanation_from_json,
            'urdu_meaning': urdu_meaning_from_json,
            'term_type': term_type_from_json,
            'properties': additional_props_from_json,
            'topic_pk': topic_pk,
            'book_fk': self.book_pk
        }

    def _process_batch(self, batch: List[Dict]):
        if not batch:
            return

        words_to_upsert_dict: Dict[str, Dict] = {}
        for item in batch:
            norm_word = item['normalized_word_text']
            # For duplicates within the same batch, the last one's details will be used for the 'words' table
            words_to_upsert_dict[norm_word] = {
                'word_text': norm_word,
                'meaning': item['meaning'],
                'explanation': item['explanation_detail'],
                'urdu_meaning': item['urdu_meaning'],
                'term_type': item['term_type'],
                'properties': item['properties'],
                'book_fk': item['book_fk']
            }

        words_for_db = list(words_to_upsert_dict.values())

        if words_for_db:
            try:
                response = self.supabase.table('words').upsert(
                    words_for_db,
                    # IMPORTANT CHANGE HERE:
                    on_conflict='word_text, book_fk' # Target the composite unique key
                ).execute()
                self.stats['words_upserted'] += len(words_for_db) # Still an approximation
                logger.info(f"Upserted {len(words_for_db)} records into 'words' table (or updated existing for same book).")
            except Exception as e:
                logger.error(f"Error upserting into 'words' table: {e}", exc_info=True)
                self.stats['errors'] += len(words_for_db)
                return

        all_norm_words_in_batch = list(words_to_upsert_dict.keys())
        word_pk_map: Dict[str, int] = {}
        if all_norm_words_in_batch:
            try:
                # IMPORTANT CHANGE HERE: Filter by self.book_pk
                pk_response = self.supabase.table('words').select('word_text, word_pk').eq(
                    'book_fk', self.book_pk # Ensure we get word_pks for the current book context
                ).in_(
                    'word_text', all_norm_words_in_batch
                ).execute()

                if pk_response.data:
                    for record in pk_response.data:
                        word_pk_map[record['word_text']] = record['word_pk']
            except Exception as e:
                logger.error(f"Error fetching word_pks for book {self.book_pk}: {e}", exc_info=True)
                return

        topic_word_links_to_create: List[Dict] = []
        processed_topic_word_pairs = set()
        for item in batch:
            norm_word = item['normalized_word_text']
            topic_pk = item['topic_pk']
            word_pk = word_pk_map.get(norm_word)

            if word_pk:
                if (topic_pk, word_pk) not in processed_topic_word_pairs:
                    topic_word_links_to_create.append({'topic_fk': topic_pk, 'word_fk': word_pk})
                    processed_topic_word_pairs.add((topic_pk, word_pk))
            else:
                logger.warning(f"Skipping topic_words link for '{norm_word}' as its word_pk was not found.")

        if topic_word_links_to_create:
            try:
                # ON CONFLICT (topic_fk, word_fk) DO NOTHING behavior
                # Supabase Python client's upsert will UPDATE on conflict.
                # To truly DO NOTHING, we must filter existing links first.

                # Fetch existing links for the topics and words in this batch to avoid re-inserting
                current_topic_fks = list(set(link['topic_fk'] for link in topic_word_links_to_create))
                current_word_fks = list(set(link['word_fk'] for link in topic_word_links_to_create))

                if current_topic_fks and current_word_fks:
                    existing_links_res = self.supabase.table('topic_words').select('topic_fk, word_fk').in_('topic_fk', current_topic_fks).in_('word_fk', current_word_fks).execute()
                    existing_pairs = set()
                    if existing_links_res.data:
                        existing_pairs = set((link['topic_fk'], link['word_fk']) for link in existing_links_res.data)

                    actual_new_links = [link for link in topic_word_links_to_create if (link['topic_fk'], link['word_fk']) not in existing_pairs]

                    if actual_new_links:
                        response = self.supabase.table('topic_words').insert(actual_new_links).execute()
                        self.stats['topic_word_links_created'] += len(actual_new_links)
                        logger.info(f"Inserted {len(actual_new_links)} new links into 'topic_words' table.")
                    else:
                        logger.info("No new topic_word links to create for this batch (all existing).")
                else:
                    logger.info("No valid topic_fks or word_fks to create links for in this batch.")

            except Exception as e:
                logger.error(f"Error inserting into 'topic_words' table: {e}", exc_info=True)
                self.stats['errors'] += len(topic_word_links_to_create)


    def ingest_from_csv(self, csv_path: str, batch_size: int = 50):
        logger.info(f"Starting word definition ingestion from: {csv_path}")
        try:
            with open(csv_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                batch: List[Dict] = []
                for row_num, csv_row in enumerate(reader, start=1):
                    self.stats['csv_rows_processed'] += 1
                    extracted_data = self._extract_row_data(csv_row)
                    if extracted_data:
                        batch.append(extracted_data)

                    if len(batch) >= batch_size:
                        self._process_batch(batch)
                        batch = []
                        logger.info(f"Processed batch of {batch_size} rows. Current row: {row_num}")
                if batch:
                    self._process_batch(batch)
                    logger.info(f"Processed final batch of {len(batch)} rows.")
            self._print_summary()
        except FileNotFoundError:
            logger.error(f"CSV file not found: {csv_path}")
            self.stats['errors'] +=1
        except Exception as e:
            logger.critical(f"Critical error during CSV ingestion: {e}", exc_info=True)
            self.stats['errors'] +=1

    def _print_summary(self): # (same as before)
        logger.info("=== Word Definition Ingestion Summary ===")
        logger.info(f"CSV Rows Processed: {self.stats['csv_rows_processed']}")
        logger.info(f"Words Upserted (to 'words' table): {self.stats['words_upserted']}")
        logger.info(f"Topic-Word Links Created (in 'topic_words'): {self.stats['topic_word_links_created']}")
        logger.info(f"Skipped Rows (Missing Data): {self.stats['skipped_rows_missing_data']}")
        if self.stats['skipped_rows_missing_topic']:
            logger.warning(f"Skipped Rows (Missing Topic ID in DB): {len(self.stats['skipped_rows_missing_topic'])}")
            logger.warning(f"Missing Topic IDs encountered: {sorted(list(self.stats['skipped_rows_missing_topic']))}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info("==========================================")

if __name__ == "__main__":
    logger.info("--- Starting Word Definition Ingestion Script ---")
    # DB Schema reminder (same as before)
    # CREATE TABLE words (
    #   word_pk SERIAL PRIMARY KEY,
    #   word_text TEXT NOT NULL UNIQUE,
    #   meaning TEXT,
    #   explanation TEXT,
    #   urdu_meaning TEXT,
    #   term_type VARCHAR(50),
    #   book_fk INTEGER NOT NULL REFERENCES books(book_pk) DEFAULT 1,
    #   properties JSONB,
    #   created_at TIMESTAMPTZ DEFAULT NOW(),
    #   updated_at TIMESTAMPTZ DEFAULT NOW()
    # );
    # CREATE UNIQUE INDEX idx_words_word_text_book_fk ON words(word_text, book_fk); -- If word_text can be same in different books
    # -- For now, word_text is globally UNIQUE as per earlier discussion for simplicity.

    # CREATE TABLE topic_words (
    #   topic_word_pk SERIAL PRIMARY KEY,
    #   topic_fk INTEGER NOT NULL REFERENCES topics(topic_pk) ON DELETE CASCADE,
    #   word_fk INTEGER NOT NULL REFERENCES words(word_pk) ON DELETE CASCADE,
    #   created_at TIMESTAMPTZ DEFAULT NOW(),
    #   CONSTRAINT topic_words_topic_fk_word_fk_key UNIQUE (topic_fk, word_fk)
    # );
    # -- Ensure `topics` table has `topic_xml_id` (TEXT, e.g., "1.5") and `order_in_chapter` (INT)
    # -- Ensure `chapters` table has `chapter_number_display` (TEXT, e.g., "1")

    # For Chemistry book (assuming its book_pk is 1)
    # chemistry_ingester = WordDefinitionIngester(supabase_client=supabase, book_pk=1)
    # chemistry_ingester.ingest_from_csv('chemistry_words.csv')

    # For Physics book (assuming its book_pk is 2 - you'd get this from your 'books' table)
    # physics_book_pk = 2 # Example
    # physics_ingester = WordDefinitionIngester(supabase_client=supabase, book_pk=physics_book_pk)
    # physics_ingester.ingest_from_csv('physics_words.csv')

    ingester = WordDefinitionIngester(supabase_client=supabase, book_pk=1)
    csv_file_path = 'enriched_chemistry_terms.csv' # <--- !!! UPDATE THIS PATH !!!

    if os.path.exists(csv_file_path):
        ingester.ingest_from_csv(csv_file_path, batch_size=50)
    else:
        logger.error(f"CSV file for ingestion not found at: {csv_file_path}")
    logger.info("--- Word Definition Ingestion Script Finished ---")
