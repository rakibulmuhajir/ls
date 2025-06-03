from supa_ingestv2 import process_xml
import logging

# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO)

# Your book details (modify as needed)
book_details = {
    "title": "Chemistry Grade 9 (Punjab Board)",  # Match your existing book
    "board_name": "Punjab Textbook Board",
    "grade_name": "Grade 9",
    "subject": "Chemistry",
    "author": "PTB Authors",
    "publication_year": 2023,
    "isbn": "978-PTB-CHEM-G9-01",  # Important: Use same ISBN as existing book
    "edition": "2023 Edition",
    "description": "Official Chemistry Book for Grade 9 by Punjab Textbook Board.",
    "language": "English",
    "country": "Pakistan",
    "current_chapter_order": 1,
    "default_conflict_behavior": "replace",  # This will REPLACE existing sections
    "auto_generate_question_bank": False    # Set to True if you want auto QB
}

# Process your modified chapter
try:
    result = process_xml(
        xml_file_path="content_tagged.xml",  # Your new XML file
        book_details=book_details,
        process_type="full"
    )

    if result:
        print(f"✅ Successfully processed modified Chapter 1!")
        print(f"📚 Book PK: {result}")
    else:
        print("❌ Failed to process chapter")

except Exception as e:
    print(f"💥 Error: {str(e)}")
