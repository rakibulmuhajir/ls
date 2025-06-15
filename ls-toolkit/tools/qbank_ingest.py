import logging
import os
import json
from supabase import create_client, Client
from typing import Dict, Any, Optional

# --- Basic Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('qbank_ingestion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --- Supabase Connection ---
# It's recommended to use environment variables for these in a real project
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ntvfjkvlgkpcoroyoyss.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dmZqa3ZsZ2twY29yb3lveXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc2OTM4MiwiZXhwIjoyMDYzMzQ1MzgyfQ.9zSJSMGcct8ZHSiwJIr6cSB9oJF8uVHLkQCWqLS_P8w")

if not SUPABASE_KEY or SUPABASE_KEY == "YOUR_SUPABASE_SERVICE_ROLE_OR_ANON_KEY":
    logger.critical("Supabase key is not set correctly. Please check your environment variables.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info(f"Connected to Supabase project at {SUPABASE_URL}")

# --- Helper Functions ---

def get_lookup_tables(supabase_client: Client) -> Dict[str, Dict[str, int]]:
    """
    Fetches all lookup tables (Question_Types, Cognitive_Levels, Difficulty_Levels)
    and caches them in a dictionary for performance.
    """
    cache = {}
    lookup_map = {
        'question_types': ('Question_Types', 'type_code', 'question_type_pk'),
        'cognitive_levels': ('Cognitive_Levels', 'level_code', 'cognitive_level_pk'),
        'difficulty_levels': ('Difficulty_Levels', 'difficulty_code', 'difficulty_pk'),
    }

    logger.info("Caching lookup tables...")
    for key, (table_name, code_col, pk_col) in lookup_map.items():
        try:
            response = supabase_client.table(table_name).select(f"{code_col}, {pk_col}").execute()
            if response.data:
                cache[key] = {item[code_col]: item[pk_col] for item in response.data}
                logger.info(f"Successfully cached {len(cache[key])} items from {table_name}")
            else:
                logger.warning(f"No data found in lookup table: {table_name}")
                cache[key] = {}
        except Exception as e:
            logger.error(f"Failed to fetch lookup table {table_name}: {e}")
            raise
    return cache

def get_topic_pk(supabase_client: Client, book_title: str, chapter_num: str, topic_num: str) -> Optional[int]:
    """
    Finds the primary key of a topic based on book title, chapter, and topic number.
    """
    logger.info(f"Finding topic_pk for Book: '{book_title}', Chapter: {chapter_num}, Topic: {topic_num}")
    try:
        # Step 1: Find the book_pk from the title
        book_response = supabase_client.table('books').select('book_pk').eq('title', book_title).execute()
        if not book_response.data:
            logger.error(f"Book with title '{book_title}' not found.")
            return None
        book_pk = book_response.data[0]['book_pk']

        # Step 2: Find the chapter_pk using the book_pk and chapter number
        chapter_response = supabase_client.table('chapters').select('chapter_pk').eq('book_fk', book_pk).eq('chapter_number_display', chapter_num).execute()
        if not chapter_response.data:
            logger.error(f"Chapter '{chapter_num}' for book '{book_title}' not found.")
            return None
        chapter_pk = chapter_response.data[0]['chapter_pk']

        # Step 3: Find the topic_pk using the chapter_pk and topic number
        topic_response = supabase_client.table('topics').select('topic_pk').eq('chapter_fk', chapter_pk).eq('topic_xml_id', topic_num).execute()
        if not topic_response.data:
            logger.error(f"Topic '{topic_num}' for chapter '{chapter_num}' not found.")
            return None
        topic_pk = topic_response.data[0]['topic_pk']

        logger.info(f"Found topic_pk: {topic_pk}")
        return topic_pk

    except Exception as e:
        logger.error(f"An error occurred while finding the topic_pk: {e}")
        return None

# --- Main Ingestion Logic ---

def process_qbank_json(file_path: str):
    """
    Processes a given JSON question bank file and ingests it into the new SQL schema.
    """
    logger.info(f"Starting ingestion for file: {file_path}")

    # Load and parse the JSON file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            qbank_data = json.load(f)
    except FileNotFoundError:
        logger.critical(f"File not found: {file_path}")
        return
    except json.JSONDecodeError as e:
        logger.critical(f"Invalid JSON in file {file_path}: {e}")
        return

    meta = qbank_data.get('meta', {})
    questions = qbank_data.get('qs', [])

    if not meta or not questions:
        logger.error("JSON file is missing 'meta' or 'qs' block. Aborting.")
        return

    # Get the Topic ID to link all questions
    topic_pk = get_topic_pk(
        supabase,
        meta.get('book'),
        str(meta.get('chap_num')),
        meta.get('topic_num')
    )
    if not topic_pk:
        logger.error("Could not find the target topic in the database. Aborting ingestion.")
        return

    # Pre-fetch lookup tables for efficiency
    try:
        lookups = get_lookup_tables(supabase)
    except Exception:
        logger.critical("Failed to load lookup tables from database. Aborting.")
        return

    # Process each question
    questions_processed = 0
    for q in questions:
        try:
            # 1. Prepare data for the `Questions` table
            question_data = {
                'topic_fk': topic_pk,
                'question_type_fk': lookups['question_types'].get(q.get('q_type')),
                'cognitive_level_fk': lookups['cognitive_levels'].get(q.get('cog_lvl')),
                'difficulty_fk': lookups['difficulty_levels'].get(q.get('diff')),
                'question_text': q.get('q_txt'),
                'marks': q.get('marks'),
                'tags': q.get('tags'),
                'keywords': q.get('keywords'),
                'year_appeared': q.get('yr_app'),
                'exam_references': q.get('exam_ref'),
                'is_important_for_exam': q.get('is_imp', False),
                'is_frequently_asked': q.get('is_freq', False),
            }

            # Insert question and get its new primary key
            response = supabase.table('Questions').insert(question_data).execute()
            if not response.data:
                logger.error(f"Failed to insert question: {q.get('q_txt')[:50]}...")
                logger.error(f"Error details: {response.error}")
                continue

            question_pk = response.data[0]['question_pk']
            logger.info(f"Inserted question with PK: {question_pk}")

            # 2. Handle answers and options based on question type
            if q.get('q_type') == 'MCQ':
                # Insert options into `MCQ_Options`
                options_to_insert = []
                for i, opt in enumerate(q.get('opts', [])):
                    option_letter = chr(ord('A') + i)
                    options_to_insert.append({
                        'question_fk': question_pk,
                        'option_letter': option_letter,
                        'option_text': opt.get('txt'),
                        'is_correct': opt.get('correct', False),
                        'explanation_if_wrong': q.get('ans_exp') if not opt.get('correct') else None
                    })
                if options_to_insert:
                    supabase.table('MCQ_Options').insert(options_to_insert).execute()

            elif q.get('q_type') in ['LONG', 'SHORT', 'NUMERICAL']:
                # Insert detailed answer into `Question_Answers`
                ans_detail = q.get('ans_detail', {})
                answer_data = {
                    'question_fk': question_pk,
                    'answer_text': ans_detail.get('txt'),
                    'explanation': ans_detail.get('exp'),
                    'total_marks': q.get('marks'),
                    # You can expand this to handle JSON fields like 'answer_points'
                }
                supabase.table('Question_Answers').insert(answer_data).execute()

            questions_processed += 1

        except Exception as e:
            logger.error(f"Failed to process a question ({q.get('q_txt', 'N/A')[:50]}...): {e}")

    logger.info(f"--- Ingestion complete for {file_path}. ---")
    logger.info(f"Successfully processed {questions_processed} out of {len(questions)} questions.")


# --- Main Execution Block ---
if __name__ == "__main__":
    # The JSON file to be processed.
    # Make sure this file is in the same directory as the script.
    qbank_file = "qbank.json"
    process_qbank_json(qbank_file)
