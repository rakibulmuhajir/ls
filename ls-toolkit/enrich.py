#!/usr/bin/env python3
"""
Educational Terms Enrichment Script (JSON Format)
Processes extracted educational terms, enriches them with DeepSeek API,
and saves to a CSV with a single JSON column containing all enrichment data.
"""

import csv
import json
import os
import re
import time
import argparse
import requests
from typing import Dict, List, Optional

# Configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
OUTPUT_CSV = "enriched_chemistry_terms.csv"

def parse_extracted_terms(input_file: str) -> Dict[str, List[str]]:
    """Parses the output file from the extraction script to get terms by topic"""
    terms_by_topic = {}
    current_topic = None

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()

                # Detect topic headers
                if line.startswith('[') and line.endswith(']'):
                    current_topic = line[1:-1].replace('Topic ', '').strip()
                    terms_by_topic[current_topic] = []
                elif current_topic and line:
                    # Split comma-separated terms
                    terms = [term.strip() for term in line.split(',') if term.strip()]
                    terms_by_topic[current_topic].extend(terms)

        print(f"Parsed terms from {len(terms_by_topic)} topics")
        return terms_by_topic
    except Exception as e:
        print(f"Error parsing input file: {e}")
        return {}

def get_term_enrichment(api_key: str, term: str) -> Optional[dict]:
    """
    Gets comprehensive term enrichment from DeepSeek API.
    Returns a dictionary with all enrichment data.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are a chemistry expert and multilingual educator. For the term "{term}", provide comprehensive information in JSON format with these keys:

REQUIRED KEYS:
1. explanation: Concise educational explanation (1-2 sentences)
2. urdu_meaning: Urdu translation if available (e.g., "مفروضہ - مفروضہ")
3. term_type: Classification (element, compound, concept, process, property, unit, other)
4. example_sentence: Example usage in a chemistry context
5. properties: Nested object with type-specific properties

PROPERTIES STRUCTURE:
- For ELEMENTS:
    "symbol": "Chemical symbol",
    "atomic_number": number,
    "category": "metal/nonmetal/metalloid",
    "state_room_temp": "gas/liquid/solid",
    "common_uses": [list of uses]

- For COMPOUNDS:
    "formula": "Chemical formula",
    "molar_mass": "g/mol",
    "state_room_temp": "gas/liquid/solid",
    "hazards": [list of hazards]

- For CONCEPTS/PROCESSES:
    "key_principle": "Brief principle",
    "related_concepts": [list of related terms],
    "real_world_example": "Specific application"

OUTPUT FORMAT (JSON ONLY):
{{
    "explanation": "...",
    "urdu_meaning": "...",
    "term_type": "...",
    "example_sentence": "...",
    "properties": {{ ... }}
}}

EXAMPLE FOR "COVALENT BOND":
{{
    "explanation": "A chemical bond formed by the sharing of electron pairs between atoms",
    "urdu_meaning": "سالماتی ربط - ایٹموں کے درمیان الیکٹران کی شرکت سے بننے والا کیمیائی بندھن",
    "term_type": "concept",
    "example_sentence": "Water molecules are formed through covalent bonds between oxygen and hydrogen atoms.",
    "properties": {{
        "key_principle": "Electron sharing",
        "related_concepts": ["ionic bond", "molecule", "electron pair"],
        "real_world_example": "Formation of DNA double helix structure"
    }}
}}

Now analyze: "{term}"
"""

    payload = {
        "model": "deepseek-reasoner",
        "messages": [
            {"role": "system", "content": "You are a chemistry expert and multilingual educational assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1000,
    }

    try:
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        content = response.json()

        if 'choices' in content and content['choices']:
            raw_output = content['choices'][0]['message']['content'].strip()

            # Extract JSON from response
            json_match = re.search(r'\{.*\}', raw_output, re.DOTALL)
            if not json_match:
                print(f"[WARN] JSON not found for '{term}'. Full response:\n{raw_output[:500]}...")
                return None
            if json_match:
                return json.loads(json_match.group(0))
            else:
                print(f"JSON not found in response for '{term}': {raw_output}")
                return None
        else:
            print(f"No 'choices' in API response for '{term}'")
            return None

    except requests.exceptions.RequestException as e:
        print(f"API Request Error for '{term}': {e}")
        return None
    except json.JSONDecodeError:
        print(f"JSON decode error for '{term}' response")
        return None

def save_to_csv(results: List[Dict], output_path: str):
    """Saves enriched terms to CSV file with a single JSON column"""
    if not results:
        print("No results to save")
        return

    fieldnames = ['term', 'topic_id', 'enrichment_data']

    try:
        with open(output_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for row in results:
                # Convert enrichment data to JSON string
                writer.writerow({
                    'term': row['term'],
                    'topic_id': row['topic_id'],
                    'enrichment_data': json.dumps(row['enrichment_data'], ensure_ascii=False)
                })

        print(f"✅ Saved {len(results)} enriched terms to {output_path}")
    except IOError as e:
        print(f"Error writing to CSV: {e}")

def main():
    parser = argparse.ArgumentParser(
        description='Enriches extracted chemistry terms with DeepSeek API and saves to CSV with JSON data'
    )
    parser.add_argument('input_file', help='Path to the extracted terms file')
    parser.add_argument(
        '--output', '-o', default=OUTPUT_CSV,
        help=f'Output CSV file path (default: {OUTPUT_CSV})'
    )
    parser.add_argument(
        '--apikey',
        help='DeepSeek API Key. Can also set DEEPSEEK_API_KEY environment variable.'
    )
    parser.add_argument(
        '--delay', type=float, default=1.5,
        help='Delay between API calls in seconds (default: 1.5)'
    )
    parser.add_argument(
        '--max-terms', type=int, default=0,
        help='Maximum number of terms to process (0 for all)'
    )
    parser.add_argument(
    '--skip-existing', action='store_true',
    help='Skip terms already present in the output CSV'
    )


    args = parser.parse_args()

    # Get API key
    api_key = args.apikey or os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        print("Error: API key required. Use --apikey or set DEEPSEEK_API_KEY environment variable.")
        return

    # Parse input file
    terms_by_topic = parse_extracted_terms(args.input_file)
    if not terms_by_topic:
        print("No terms found. Exiting.")
        return

    # Process terms
    enriched_terms = []
    seen_terms = set()
    if args.skip_existing and os.path.exists(args.output):
        try:
            with open(args.output, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    seen_terms.add(row['term'].lower())
            print(f"🔁 Skipping {len(seen_terms)} terms already in {args.output}")
        except Exception as e:
            print(f"⚠️ Failed to read existing output CSV: {e}")

    term_count = 0

    for topic_id, terms in terms_by_topic.items():
        print(f"\n📚 Processing Topic {topic_id} ({len(terms)} terms)")

        for term in terms:
            # Skip duplicates
            term_lower = term.lower()
            if term_lower in seen_terms:
                continue

            # Limit processing if requested
            if args.max_terms > 0 and term_count >= args.max_terms:
                print(f"Reached maximum term limit ({args.max_terms})")
                break

            print(f"  🔍 Enriching: {term}")
            enrichment = get_term_enrichment(api_key, term)
            time.sleep(args.delay)

            if enrichment:
                enriched_terms.append({
                    'term': term,
                    'topic_id': topic_id,
                    'enrichment_data': enrichment
                })
                seen_terms.add(term_lower)
                term_count += 1
                print(f"    ✅ Enriched")
            else:
                print(f"    ❌ Failed to enrich")

        if args.max_terms > 0 and term_count >= args.max_terms:
            break

    # Save results
    save_to_csv(enriched_terms, args.output)

    # Print summary
    print("\n" + "=" * 50)
    print(f"Total terms processed: {term_count}")
    print(f"Unique terms enriched: {len(enriched_terms)}")
    print(f"Output saved to: {args.output}")

if __name__ == "__main__":
    main()
