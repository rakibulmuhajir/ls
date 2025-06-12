import xml.etree.ElementTree as ET
from pathlib import Path

INPUT_XML = 'chem_IX.xml'
OUTPUT_HTML = 'chem_IX.html'

# Map tag to heading level
tag_to_heading = {
    'chapter': 'h2',
    'topic': 'h3',
    'section': 'h4',
    'analogy': 'h5',
    'example': 'h5',
    'interactive_prompt': 'h5',
    'connection_item': 'h5',
    'fun_fact': 'h5',
    'mnemonic': 'h5',
    'acronym': 'h5',
    'exercise': 'h5',
    'story_title': 'h5',
    'story_method': 'h5',
    'association': 'h5',
    'rhyme': 'h5',
    'rank': 'h5',
}

def render_element(el):
    html = ''
    tag = el.tag
    # Heading for known tags with title attribute
    if tag in tag_to_heading and 'title' in el.attrib:
        heading = tag_to_heading[tag]
        html += f'<{heading}>{el.attrib["title"]}</{heading}>\n'
    # For elements with id but no title (like fun_fact, exercise, etc.)
    elif tag in tag_to_heading and 'id' in el.attrib:
        heading = tag_to_heading[tag]
        html += f'<{heading}>{tag.capitalize()} {el.attrib["id"]}</{heading}>\n'
    # For <paragraph> and <point> and similar text nodes
    if tag in ['paragraph', 'point', 'breakdown', 'context_sentence', 'memory_tip', 'concept', 'visual_scene', 'memory_trigger', 'recall_cue', 'narrative', 'character_map', 'plot_connection', 'content_coverage', 'rhythm_pattern', 'performance_tip', 'walking_route', 'sensory_details', 'memory_sentence', 'visual_bridge', 'keyword_link', 'scientific_term', 'location_theme', 'pairing_reason', 'place', 'concept_coverage', 'schedule', 'method', 'issue', 'interactive_element', 'gamification', 'social_sharing', 'progress_tracking']:
        html += f'<p>{el.text.strip() if el.text else ""}</p>\n'
    # For <list> and <key_points>
    if tag == 'list' or tag == 'key_points':
        html += '<ul>\n'
        for item in el:
            html += f'<li>{item.text.strip() if item.text else ""}</li>\n'
        html += '</ul>\n'
    # For <exercise_block>
    if tag == 'exercise_block':
        html += '<div class="exercise-block">\n'
        for item in el:
            html += render_element(item)
        html += '</div>\n'
    # Recursively render children
    for child in el:
        html += render_element(child)
    return html

def main():
    tree = ET.parse(INPUT_XML)
    root = tree.getroot()
    html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Chemistry IX</title>\n<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n'
    html += render_element(root)
    html += '\n</body>\n</html>'
    Path(OUTPUT_HTML).write_text(html, encoding='utf-8')
    print(f'Wrote {OUTPUT_HTML}')

if __name__ == '__main__':
    main()
