##add multiple sections from a single XML file to multiple topics in a book
from supa_ingestv2 import add_multiple_sections_from_single_file
import logging

logging.basicConfig(level=logging.INFO)

# Add memory techniques to all topics in chapter 1
results = add_multiple_sections_from_single_file(
    xml_file_path="mem-tech.xml",
    book_pk=1,
    chapter_number="1",
    conflict_behavior="replace"
)

print(f"✅ Memory techniques added to: {len(results['successful'])} topics")
print(f"❌ Failed: {len(results['failed'])} topics")

# Show results
for item in results['successful']:
    print(f"  ✓ {item['topic_xml_id']} → Section {item['section_pk']}")

for item in results['failed']:
    print(f"  ✗ {item['topic_xml_id']} → {item['error']}")
