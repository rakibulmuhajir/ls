import logging
from supa_ingestv2 import process_xml # Imports the main function from your script

# --- Configuration for the Physics Grade 9 Book ---
# You can change these details if they are incorrect.
# This dictionary tells the script what book to look for in the database,
# or to create it if it doesn't exist.
PHYSICS_BOOK_DETAILS = {
    "title": "Physics",
    "board_name" : "Punjab Textbook Board",
    "board_id": "1",
    "grade_name": "Grade 9",
    "subject": "Physics",
    "author": "PTB Authors",
    "publication_year": 2025,
    "isbn": "978-PTB-PHY-G9-01", # Using a placeholder ISBN
    "edition": "2025 Edition",
    "description": "Official Physics Book for Grade 9 by the Punjab Textbook Board, covering fundamental concepts of mechanics, thermal properties, and magnetism.",
    "language": "English",
    "country": "Pakistan",

    # --- Conflict and Auto-Generation Settings ---
    # 'replace': Deletes old sections of the same type before adding new ones. Good for a clean re-import.
    # 'append': Keeps old sections and adds new ones. Good for adding content incrementally.
    # 'skip': If a section of a certain type already exists, it will not be added.
    "default_conflict_behavior": "replace",

    # 'True': Automatically creates a "Question Bank" topic at the end of each chapter if one doesn't exist.
    "auto_generate_question_bank": False
}

if __name__ == "__main__":
    logging.info("--- Starting Full Book Ingestion ---")

    # Define the path to your complete book XML file
    xml_file_path = "../physics/phy-IX-clean-chap-1.xml"

    try:
        # This is the main function call.
        # It tells the script to process the specified XML file as a "full" book,
        # using the details defined above.
        book_pk = process_xml(
            xml_file_path,
            PHYSICS_BOOK_DETAILS,
            process_type="full"
        )

        if book_pk:
            logging.info(f"--- Successfully processed '{xml_file_path}' for book_pk: {book_pk} ---")
        else:
            logging.error("--- Ingestion process failed to return a book_pk. ---")

    except Exception as e:
        logging.critical(f"--- A critical error occurred during the ingestion process: {e} ---")

# ### How to Run This Command:

# 1.  **Save the Code:** Save the code above into a new file named `run_ingestion.py` in the **same directory** where your `supa_ingestv2.py` and `phy-IX-clean.xml` files are located.
# 2.  **Open Your Terminal:** Open a command prompt or terminal.
# 3.  **Navigate to the Directory:** Use the `cd` command to navigate to the folder where you saved the files.
# 4.  **Run the Script:** Execute the following command in your terminal:

#     ```bash
#     python run_ingestion.py
#     ```

# This will start the process. The script will log its progress to your terminal and also create an `ingestion.log` file, which is very helpful for reviewing the process or debugging any issu
