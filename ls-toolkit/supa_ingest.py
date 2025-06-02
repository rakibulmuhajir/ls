from supabase import create_client
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import re
import logging

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

# --- Helper Functions ---
def insert_and_return_pk(table_name, data, pk_column_name):
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

def get_or_create_id(table_name, search_column, search_value, pk_column_name, extra_data={}):
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

def get_formatted_text(element_xml):
    """Enhanced to handle animation references"""
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
            # Handle animation reference with validation
            animation_ref = child.get('ref') or child.get('name') or child.get('id')
            animation_height = child.get('height', '300')

            if animation_ref:
                validated_type = validate_animation_reference(animation_ref)
                if validated_type:
                    text_parts.append(f"[ANIMATION:{validated_type}:{animation_height}]")
                    logger.info(f"Added animation reference: {animation_ref} -> {validated_type}")
                else:
                    # Keep as placeholder for future implementation
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

# --- XML Processing ---
def process_xml(xml_file_path, book_details):
    try:
        logger.info(f"Starting XML processing for: {xml_file_path}")

        with open(xml_file_path, 'r', encoding='utf-8') as f:
            xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&', f.read())

        root = ET.fromstring(xml_str)
        logger.info(f"Successfully parsed XML file: {xml_file_path}")

        # Create/get board
        board_pk = get_or_create_id(
            "boards",
            "board_name",
            book_details["board_name"],
            "board_pk",
            extra_data={"country": book_details.get("country")}
        )
        logger.info(f"Board PK: {board_pk}")

        # Create/get grade
        grade_pk = get_or_create_id(
            "grades",
            "grade_name",
            book_details["grade_name"],
            "grade_pk"
        )
        logger.info(f"Grade PK: {grade_pk}")

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
        logger.info(f"Created Book - PK: {book_pk}, Title: '{book_details['title']}'")

        # Validate root element
        if root.tag.lower() not in ['chapter', 'chpter']:
            logger.warning(f"Root tag is <{root.tag}>, expected <chapter>")

        # Create chapter
        chapter_data = {
            "book_fk": book_pk,
            "title": root.get("title"),
            "chapter_number_display": root.get("id"),
            "chapter_order": book_details.get("current_chapter_order", 1)
        }
        chapter_pk = insert_and_return_pk("chapters", chapter_data, "chapter_pk")
        logger.info(f"Created Chapter - PK: {chapter_pk}, Title: '{chapter_data['title']}'")

        # Process topics
        topics_processed = 0
        for topic_idx, topic_elem in enumerate(root.findall("topic"), start=1):
            try:
                topic_data = {
                    "chapter_fk": chapter_pk,
                    "topic_xml_id": topic_elem.get("id"),
                    "title": topic_elem.get("title"),
                    "order_in_chapter": topic_idx
                }
                topic_pk = insert_and_return_pk("topics", topic_data, "topic_pk")
                logger.info(f"Created Topic - PK: {topic_pk}, Title: '{topic_data['title']}'")

                # Process sections (including memory techniques if present)
                sections_processed = 0
                for section_idx, section_elem in enumerate(topic_elem.findall("section"), start=1):
                    try:
                        section_data = {
                            "topic_fk": topic_pk,
                            "section_type_xml": section_elem.get("type"),
                            "title": section_elem.get("title"),
                            "order_in_topic": section_idx
                        }
                        section_pk = insert_and_return_pk("sections", section_data, "section_pk")
                        logger.info(f"Created Section - PK: {section_pk}, Type: '{section_data['section_type_xml']}'")

                        # Process section content
                        elements_processed = insert_section_content(section_elem, section_pk)
                        logger.debug(f"Processed {elements_processed} elements in section {section_pk}")
                        sections_processed += 1

                    except Exception as e:
                        logger.error(f"Error processing section {section_idx} in topic {topic_pk}: {str(e)}")
                        continue

                logger.info(f"Topic {topic_pk} completed: {sections_processed} sections processed")
                topics_processed += 1

            except Exception as e:
                logger.error(f"Error processing topic {topic_idx}: {str(e)}")
                continue

        logger.info(f"XML processing completed: {topics_processed} topics processed")

    except Exception as e:
        logger.error(f"Critical error in process_xml: {str(e)}")
        raise

def insert_section_content(section_element_xml, section_fk):
    """Process section content and return count of elements processed"""
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

            # Handle Memory Technique sections
            elif tag_name in ['visual_mnemonics', 'acronyms_acrostics', 'story_method', 'memory_palace',
                              'keyword_associations', 'rhymes_rhythms', 'number_shape_associations']:
                memory_elements = process_memory_technique_section(child_xml, section_fk, order_counter, tag_name)
                elements_processed += memory_elements['elements']
                order_counter += memory_elements['order_increment']

            else:
                logger.debug(f"Generic processing for tag: {tag_name}")
                text = get_formatted_text(child_xml)
                if text or title_attr or xml_id_attr:
                    insert_content(section_fk, tag_name.upper(), order_counter, "element_pk",
                                   text_content=text, xml_id_attribute=xml_id_attr, title_attribute=title_attr,
                                   attribute_level=level_attr, attribute_type=type_attr)
                    elements_processed += 1
                    order_counter += 1

        logger.debug(f"Section {section_fk} processing completed: {elements_processed} elements")
        return elements_processed

    except Exception as e:
        logger.error(f"Error processing section content for section {section_fk}: {str(e)}")
        return elements_processed

def process_memory_technique_section(section_xml, section_fk, start_order, section_type):
    """Process memory technique sections like visual_mnemonics, acronyms, etc."""
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

        logger.info(f"Processed memory technique section: {section_type}, {elements_processed-1} items")
        return {'elements': elements_processed, 'order_increment': order_counter - start_order}

    except Exception as e:
        logger.error(f"Error processing memory technique section {section_type}: {str(e)}")
        return {'elements': elements_processed, 'order_increment': order_counter - start_order}

def process_list_items(list_xml, parent_element_pk):
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

def process_list_container(list_xml, section_fk, order_counter, title_attr):
    """Process list container and its items"""
    list_type_from_xml = list_xml.get('type', 'unordered').upper()
    list_container_pk = insert_content(section_fk, f'LIST_{list_type_from_xml}_CONTAINER', order_counter, "element_pk",
                                       title_attribute=title_attr, attribute_type=list_xml.get('type', 'unordered'))

    list_items_to_insert = process_list_items(list_xml, list_container_pk)
    if list_items_to_insert:
        supabase.table("list_items").insert(list_items_to_insert).execute()
        logger.debug(f"Inserted {len(list_items_to_insert)} list items")

    return list_container_pk

def process_exercise_block(exercise_block_xml, section_fk, start_order):
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

def insert_content(section_fk, element_type, order_in_section, pk_column_name,
                   text_content=None, xml_id_attribute=None, title_attribute=None,
                   attribute_level=None, attribute_type=None, formula_type=None):
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

# --- Main Execution ---
if __name__ == "__main__":
    logger.info("=== Starting XML Ingestion Process ===")

    current_book_details = {
        "title": "Chemistry Grade 9 (Punjab Board)",
        "board_name": "Punjab Textbook Board",
        "grade_name": "Grade 9",
        "subject": "Chemistry",
        "author": "PTB Authors",
        "publication_year": 2023,
        "isbn": "978-PTB-CHEM-G9-01",
        "edition": "2023 Edition",
        "description": "Official Chemistry Book for Grade 9 by Punjab Textbook Board.",
        "language": "English",
        "country": "Pakistan",
        "current_chapter_order": 1
    }

    xml_file_to_process = "app-chapter1.xml"

    try:
        logger.info(f"Processing XML file: {xml_file_to_process}")
        logger.info(f"Book details: {current_book_details['title']}")

        if not os.path.exists(xml_file_to_process):
            logger.error(f"XML file '{xml_file_to_process}' not found")
            exit(1)

        process_xml(xml_file_to_process, current_book_details)
        logger.info("✅ XML processing completed successfully")

    except FileNotFoundError:
        logger.error(f"Error: XML file '{xml_file_to_process}' not found")
    except Exception as e:
        logger.error(f"Critical error during XML processing: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

    logger.info("=== XML Ingestion Process Completed ===")
