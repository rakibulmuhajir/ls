from supabase import create_client
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import re

# --- Supabase Setup ---
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ntvfjkvlgkpcoroyoyss.supabase.co")
# IMPORTANT: Use your actual Supabase key. The one from the previous script is an anon key.
# For backend scripts that modify data, a SERVICE_ROLE_KEY is often safer as it bypasses RLS.
# Ensure this key has the necessary permissions.
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dmZqa3ZsZ2twY29yb3lveXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc2OTM4MiwiZXhwIjoyMDYzMzQ1MzgyfQ.9zSJSMGcct8ZHSiwJIr6cSB9oJF8uVHLkQCWqLS_P8w")

if SUPABASE_KEY == "YOUR_SUPABASE_SERVICE_ROLE_OR_ANON_KEY" or not SUPABASE_KEY:
    print("CRITICAL ERROR: Supabase key is not set correctly. Please set the SUPABASE_KEY environment variable or replace the placeholder in the script.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Attempting to connect to Supabase URL: {SUPABASE_URL}")


# --- Helpers ---
def insert_and_return_pk(table_name, data, pk_column_name):
    # print(f"Inserting into {table_name}: {data} (expecting PK: {pk_column_name})") # Debug
    response = supabase.table(table_name).insert(data).execute()

    # Safely access error and data
    response_error = getattr(response, 'error', None)
    response_data = getattr(response, 'data', None)

    if response_error or not response_data:
        error_message = "Unknown error during insert."
        if response_error:
            # Try to get a more specific message from the error object
            error_message = f"Code: {getattr(response_error, 'code', 'N/A')}, Message: {getattr(response_error, 'message', str(response_error))}"
        elif not response_data:
            error_message = "No data returned from insert operation (expected one row)."

        raise Exception(f"Insert failed for table {table_name} with data {data}. Error: {error_message}, Full Response: {response}")

    if not isinstance(response_data, list) or len(response_data) == 0:
        raise Exception(f"Insert into {table_name} did not return expected data format. Response Data: {response_data}")

    return response_data[0][pk_column_name]

def get_or_create_id(table_name, search_column, search_value, pk_column_name, extra_data={}):
    # print(f"Getting or creating in {table_name} by {search_column}='{search_value}' (expecting PK: {pk_column_name})") # Debug
    response = supabase.table(table_name).select(pk_column_name).eq(search_column, search_value).execute()

    # --- DEBUG ---
    # print(f"DEBUG get_or_create_id: Type of response for table {table_name}: {type(response)}")
    # print(f"DEBUG get_or_create_id: Attributes of response: {dir(response)}")
    # print(f"DEBUG get_or_create_id: Response object: {response}")
    # --- END DEBUG ---

    # Safely access error and data
    response_error = getattr(response, 'error', None)
    response_data = getattr(response, 'data', None)

    if response_error:
        error_message = f"Code: {getattr(response_error, 'code', 'N/A')}, Message: {getattr(response_error, 'message', str(response_error))}"
        raise Exception(f"Select failed for table {table_name} searching {search_column}='{search_value}'. Error: {error_message}, Full Response: {response}")

    if response_data: # If data exists (list is not empty)
        if isinstance(response_data, list) and len(response_data) > 0:
            return response_data[0][pk_column_name]
        else: # Should not happen if query is correct and data exists, but good to check
            raise Exception(f"Select for {table_name} returned data in unexpected format: {response_data}")
    else:
        # No data found, proceed to create
        insert_data = {search_column: search_value, **extra_data}
        return insert_and_return_pk(table_name, insert_data, pk_column_name)

def get_formatted_text(element_xml):
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
        elif tag == 'list':
            continue
        else:
            text_parts.append(get_formatted_text(child))
        if child.tail:
            text_parts.append(child.tail.strip())
    return " ".join(filter(None, text_parts)).strip()

# --- XML Processing ---
def process_xml(xml_file_path, book_details):
    with open(xml_file_path, 'r', encoding='utf-8') as f:
        xml_str = re.sub(r'&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&', f.read())

    root = ET.fromstring(xml_str)

    board_pk = get_or_create_id(
        "boards",
        "board_name",
        book_details["board_name"],
        "board_pk",
        extra_data={"country": book_details.get("country")}
    )
    print(f"  Retrieved/Created Board PK: {board_pk}")

    grade_pk = get_or_create_id(
        "grades",
        "grade_name",
        book_details["grade_name"],
        "grade_pk"
    )
    print(f"  Retrieved/Created Grade PK: {grade_pk}")

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
    print(f"Inserted Book: PK={book_pk}, Title='{book_details['title']}'")

    if root.tag.lower() not in ['chapter', 'chpter']:
        print(f"Warning: Root tag is <{root.tag}>, expected <chapter>. Processing might be incorrect.")

    chapter_data = {
        "book_fk": book_pk,
        "title": root.get("title"),
        "chapter_number_display": root.get("id"),
        "chapter_order": book_details.get("current_chapter_order", 1)
    }
    chapter_pk = insert_and_return_pk("chapters", chapter_data, "chapter_pk")
    print(f"  Inserted Chapter: PK={chapter_pk}, Title='{chapter_data['title']}'")

    for topic_idx, topic_elem in enumerate(root.findall("topic"), start=1):
        topic_data = {
            "chapter_fk": chapter_pk,
            "topic_xml_id": topic_elem.get("id"),
            "title": topic_elem.get("title"),
            "order_in_chapter": topic_idx
        }
        topic_pk = insert_and_return_pk("topics", topic_data, "topic_pk")
        print(f"    Inserted Topic: PK={topic_pk}, Title='{topic_data['title']}'")

        for section_idx, section_elem in enumerate(topic_elem.findall("section"), start=1):
            section_data = {
                "topic_fk": topic_pk,
                "section_type_xml": section_elem.get("type"),
                "title": section_elem.get("title"),
                "order_in_topic": section_idx
            }
            section_pk = insert_and_return_pk("sections", section_data, "section_pk")
            print(f"      Inserted Section: PK={section_pk}, Type='{section_data['section_type_xml']}'")
            insert_section_content(section_elem, section_pk)

def insert_section_content(section_element_xml, section_fk):
    order_counter = 1
    for child_xml in section_element_xml:
        tag_name = child_xml.tag.lower()
        title_attr = child_xml.get('title')
        xml_id_attr = child_xml.get('id')
        level_attr = child_xml.get('level')
        type_attr = child_xml.get('type')

        if tag_name in ['definition_content', 'explanation_content']:
            for para_xml in child_xml.findall('paragraph'):
                text = get_formatted_text(para_xml)
                insert_content(section_fk, "PARAGRAPH", order_counter, "element_pk", text_content=text)
                order_counter += 1

        elif tag_name in ['analogy', 'example', 'connection_item', 'fun_fact', 'interactive_prompt']:
            container_ce_pk = insert_content(section_fk, tag_name.upper(), order_counter, "element_pk",
                                             xml_id_attribute=xml_id_attr, title_attribute=title_attr,
                                             attribute_level=level_attr, attribute_type=type_attr)
            order_counter += 1
            items_to_insert_for_container = []
            for inner_child_xml in child_xml:
                inner_tag_name = inner_child_xml.tag.lower()
                if inner_tag_name == 'paragraph':
                    text = get_formatted_text(inner_child_xml)
                    insert_content(section_fk, 'PARAGRAPH', order_counter, "element_pk", text_content=text)
                    order_counter += 1
                elif inner_tag_name == 'list':
                    for item_idx, item_xml in enumerate(inner_child_xml.findall('item'), start=1): # Or other item tags
                        item_text = get_formatted_text(item_xml)
                        items_to_insert_for_container.append({
                            "parent_content_element_fk": container_ce_pk,
                            "item_text": item_text,
                            "order_in_list": item_idx
                        })
            if items_to_insert_for_container:
                supabase.table("list_items").insert(items_to_insert_for_container).execute()
                print(f"        Inserted {len(items_to_insert_for_container)} list items for CE PK={container_ce_pk}")

        elif tag_name == 'key_points':
            kp_container_pk = insert_content(section_fk, 'KEY_POINTS_CONTAINER', order_counter, "element_pk",
                                             title_attribute=title_attr, attribute_type=type_attr)
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
                print(f"        Inserted {len(points_to_insert)} key points for CE PK={kp_container_pk}")

        elif tag_name == 'exercise_block':
            for ex_xml in child_xml.findall('exercise'):
                ex_id = ex_xml.get('id')
                ex_level = ex_xml.get('level')
                ex_title_attr = ex_xml.get('title')
                exercise_display_title = ex_title_attr if ex_title_attr else f"Exercise {ex_id if ex_id else ''} ({ex_level if ex_level else 'N/A'})".strip()

                insert_content(section_fk, 'EXERCISE_HEADER', order_counter, "element_pk",
                               xml_id_attribute=ex_id, title_attribute=exercise_display_title,
                               attribute_level=ex_level)
                order_counter += 1

                q_xml = ex_xml.find('question')
                if q_xml:
                    q_text = get_formatted_text(q_xml)
                    question_ce_pk = insert_content(section_fk, 'QUESTION', order_counter, "element_pk", text_content=q_text)
                    order_counter += 1
                    question_list_items = []
                    for list_in_q_xml in q_xml.findall('list'):
                        list_items_xml_nodes = list_in_q_xml.findall('item') # or other specific item tags
                        for item_idx, item_xml in enumerate(list_items_xml_nodes, start=1):
                            item_text = get_formatted_text(item_xml)
                            question_list_items.append({
                                "parent_content_element_fk": question_ce_pk,
                                "item_text": item_text,
                                "order_in_list": item_idx
                            })
                    if question_list_items:
                        supabase.table("list_items").insert(question_list_items).execute()
                        print(f"        Inserted {len(question_list_items)} list items for Question CE PK={question_ce_pk}")

                ans_xml = ex_xml.find('answer')
                if ans_xml:
                    ans_text = get_formatted_text(ans_xml)
                    insert_content(section_fk, 'ANSWER', order_counter, "element_pk", text_content=ans_text)
                    order_counter += 1

                ans_fw_xml = ex_xml.find('answer_framework')
                if ans_fw_xml:
                    ans_fw_text = get_formatted_text(ans_fw_xml)
                    insert_content(section_fk, 'ANSWER_FRAMEWORK', order_counter, "element_pk", text_content=ans_fw_text)
                    order_counter += 1

        elif tag_name == 'paragraph':
            text = get_formatted_text(child_xml)
            insert_content(section_fk, 'PARAGRAPH', order_counter, "element_pk",
                           text_content=text, attribute_type=type_attr)
            order_counter += 1

        elif tag_name == 'list':
            list_type_from_xml = child_xml.get('type', 'unordered').upper()
            list_container_pk = insert_content(section_fk, f'LIST_{list_type_from_xml}_CONTAINER', order_counter, "element_pk",
                                               title_attribute=title_attr, attribute_type=child_xml.get('type', 'unordered'))
            order_counter +=1
            list_items_to_insert = []
            items_xml_nodes = child_xml.findall('item') # Adjust if other item tags are used
            for item_idx, item_xml in enumerate(items_xml_nodes, start=1):
                item_text = get_formatted_text(item_xml)
                list_items_to_insert.append({
                    "parent_content_element_fk": list_container_pk,
                    "item_text": item_text,
                    "order_in_list": item_idx
                })
            if list_items_to_insert:
                supabase.table("list_items").insert(list_items_to_insert).execute()
                print(f"        Inserted {len(list_items_to_insert)} list items for List Container CE PK={list_container_pk}")

        else:
            print(f"      Unhandled direct child tag in section_content: <{tag_name}>. Trying generic processing.")
            text = get_formatted_text(child_xml)
            if text or title_attr or xml_id_attr:
                 insert_content(section_fk, tag_name.upper(), order_counter, "element_pk",
                                text_content=text, xml_id_attribute=xml_id_attr, title_attribute=title_attr,
                                attribute_level=level_attr, attribute_type=type_attr)
                 order_counter += 1

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
    # print(f"        Inserted CE: PK={element_pk}, Type='{element_type}', Order={order_in_section}, Title='{title_attribute if title_attribute else ''}'") # Reduced verbosity
    return element_pk

# --- Run Script ---
if __name__ == "__main__":
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
    xml_file_to_process = "chapter1.xml"

    if not os.path.exists(xml_file_to_process):
        print(f"Warning: XML file '{xml_file_to_process}' not found. Creating a dummy file for testing.")
        sample_xml_content = """<?xml version="1.0" encoding="UTF-8"?>
<chapter id="C1" title="Introduction to Chemistry">
  <topic id="T1.1" title="What is Chemistry?">
      <section type="CORE_DEFINITION" title="Core Definition">
          <definition_content>
              <paragraph>Chemistry is the study of matter and its properties.</paragraph>
          </definition_content>
      </section>
      <section type="EXAMPLES" title="Examples in Daily Life">
            <example title="Rusting" id="ex_rust">
                <paragraph>Iron rusting is a chemical process called oxidation.</paragraph>
                <list type="bulleted">
                    <item>Requires oxygen</item>
                    <item>Requires moisture</item>
                </list>
            </example>
      </section>
  </topic>
</chapter>"""
        with open(xml_file_to_process, "w", encoding="utf-8") as f:
            f.write(sample_xml_content)
        print(f"Dummy file '{xml_file_to_process}' created.")

    try:
        print(f"\n--- Processing XML: {xml_file_to_process} for Book: {current_book_details['title']} ---")
        process_xml(xml_file_to_process, current_book_details)
        print("\n✅ XML processing complete. Data should be in Supabase.")
    except FileNotFoundError:
        print(f"Error: XML file '{xml_file_to_process}' not found.")
    except Exception as e:
        print(f"An error occurred during XML processing: {e}")
        import traceback
        traceback.print_exc()
