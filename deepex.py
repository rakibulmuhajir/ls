#!/usr/bin/env python3
"""
XML Book Processor with DeepSeek API
Extracts specialized chemistry educational words/phrases from each topic in an XML book.
"""

import json
import requests
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Set
import time # For potential rate limiting

# --- Configuration ---
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
# IMPORTANT: Replace with your actual API key or use an environment variable
# It's best to set this as an environment variable: DEEPSEEK_API_KEY
# DEEPSEEK_API_KEY = "sk-your-api-key-here" # Loaded from args or env
OUTPUT_FILE = "extracted_chemistry_terms.txt"

# --- Comprehensive Exclusion List ---
# This list is used for POST-PROCESSING after LLM extraction.
COMMON_WORDS_TO_EXCLUDE_POST_LLM: Set[str] = {
    # Original user list (some might be redundant with broader categories below)
    "table", "home", "route", "cup", "movie", "ocean",
    # "salt", "sugar", # Keep these as they can be specific substances
    "example", "book", "pen", "chair", "door",

    # General words from previous analysis
    "material", # "properties", "composition", "structure", "substances", "changes", "matter", "laws", "principles",
    "behavior", "arrangement", "sample", "release", "specialized", "laboratory", "distinct", "forms", "distances",
    "primary", "mass", "space", "fixed", "positions", "definite", "shape", "volume", "container", "close", "random",
    "movement", "expand", "partially", "intermediate", # "building blocks", "pure", "reactions", "ratio", "individual",
    "combination", "separation", "physical", "methods", "network", "single", "layer", "strongest",
    "means", "system", "map", # "formula",
    "performance", "difficulty", "hierarchy", "relationships", # "particle",
    "size", "settle", "filter", "paper", "residue", "nature", # "water", # Keep water
    "effects", "products", "sunbeams", "medicine",
    "spectrum", "ranges", "progression", "devices", "naked eye", "activities", "test", "results", "technology",
    "components", "room", "visibility", "pool", "party", "sisters", "examples", "mystery", "liquid", "observe",
    "appearance", "shine", "light", "try", "sit", "virtual", "lab", "mix", "detective", "badges", "identification",
    "accuracy", "selection", "skills", "maximum", "amount", "capacity", "excess", "bottom", "check-in", "check-out",
    "consistent", "dose", "administered", "controlled", "strength", "effect", "process", "point", # "kinetic",
    "thermal", "shift", "life", "shock",

    # General academic/process words
    "analysis", "application", "concept", "method", "technique", "design", "experiment", "introduction", "conclusion",
    "summary", "overview", "chapter", "topic", "section", "content", "information", "data", "figure", "image",
    "illustrate", "describe", "explain", "define", "compare", "contrast", "evaluate", "purpose", "objective",
    "goal", "scope", "benefit", "advantage", "disadvantage", "challenge", "solution", "approach", "strategy",
    "function", "role", "impact", "factor", "variable", "parameter", "result", "outcome", "finding", "evidence",
    "theory", "model", "hypothesis", "assumption", "observation", "study", "research", "review", "survey",
    "page", "text", "word", "sentence", "paragraph", "list", "item",

    # Learning strategy words
    "kinesthetic elements", "spatial memory", "visual mnemonics", "story method", "memory palace", "concept map",
    "musical encoding", "acronyms", "rhymes", "rhythms", "practice", "recall", "assessment", "quiz", "exam",

    # Common English words (pronouns, articles, prepositions, conjunctions, common verbs/adjectives/adverbs)
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "can't", "cannot",
    "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few",
    "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll",
    "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most",
    "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
    "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
    "through", "to", "too", "under", "until", "up", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
    "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves",

    "get", "make", "go", "see", "say", "take", "come", "use", "find", "give", "tell", "work", "call",
    "ask", "need", "feel", "become", "leave", "put", "mean", "keep", "let", "begin", "seem", "help", "talk", "turn",
    "start", "show", "hear", "play", "run", "move", "like", "live", "believe", "hold", "bring", "happen", "write",
    "provide", "stand", "lose", "pay", "meet", "include", "continue", "set", "learn", "lead", "understand",
    "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win",
    "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect", "build",
    "stay", "fall", "cut", "reach", "kill", "remain", "suggest", "raise", "pass", "sell", "require", "report",
    "decide", "pull",

    "very", "really", "much", "also", "often", "always", "sometimes", "never", "just", "even", "however",
    "therefore", "otherwise", "instead", "mainly", "generally", "specifically", "especially", "usually",
    "actually", "important", "significant", "key", "main", "major", "minor", "basic", "advanced", "fundamental",
    "essential", "common", "typical", "general", "specific", "various", "different", "similar", "related",
    "certain", "particular", "overall", "first", "second", "third", "next", "last", "final", "new", "old",
    "current", "previous", "following", "good", "bad", "better", "best", "worse", "worst", "large", "small",
    "big", "little", "high", "low", "long", "short", "wide", "narrow", "deep", "shallow", "early", "late",
    "quick", "slow", "easy", "hard", "difficult", "simple", "complex", "true", "false", "correct", "incorrect",
    "accurate", "inaccurate", "possible", "impossible", "likely", "unlikely", "able", "unable", "available",
    "unavailable", "another", "other", "many", "several", "various", "different", "same", "every", "each",
    "well", "truly", "indeed"
}
# You might want to refine COMMON_WORDS_TO_EXCLUDE_POST_LLM, e.g. some terms like "properties", "composition",
# "structure", "matter", "elements", "compounds", "mixtures" ARE actually key chemistry terms.
# The goal of this list is to remove *truly* generic fluff, not borderline chemistry terms.
# For this run, I've commented out some that are borderline or definitely chemistry terms.

def load_xml_book(xml_path: str) -> Dict[str, str]:
    """Extracts topics from XML book, handling files with trailing junk."""
    try:
        # First attempt standard parsing
        tree = ET.parse(xml_path)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"Standard parse failed: {e}. Attempting recovery...")
        try:
            # Use iterparse to extract content until root element ends
            context = ET.iterparse(xml_path, events=('start', 'end'))
            root = None

            for event, elem in context:
                if event == 'start' and root is None:
                    root = elem  # Capture root element
                if event == 'end' and root is not None and elem == root:
                    break  # Stop after root element ends

            if root is None:
                print("Recovery failed: No root element found")
                return {}

        except ET.ParseError as e2:
            print(f"Recovery failed: {e2}")
            return {}
        except Exception as e2:
            print(f"Unexpected error during recovery: {e2}")
            return {}
    except FileNotFoundError:
        print(f"Error: XML file '{xml_path}' not found.")
        return {}
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {}

    # Process topics from the root element
    topics = {}
    for topic_element in root.iter('topic'):
        topic_id = topic_element.get('id')
        topic_text_parts = [text.strip() for text in topic_element.itertext() if text and text.strip()]
        topic_text = ' '.join(topic_text_parts).strip()

        if topic_id and topic_text:
            topics[topic_id] = topic_text
        elif not topic_id:
            print(f"Warning: Found topic without 'id' attribute")
        elif not topic_text:
            print(f"Warning: Topic {topic_id} has no text content")
    return topics


def extract_specialized_chemistry_terms(api_key: str, topic_id: str, topic_text: str) -> List[str]:
    """
    Extracts specialized chemistry educational words/phrases using the DeepSeek API,
    emphasizing literal extraction.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Instructions for exclusion are now more conceptual for the LLM prompt
    prompt = f"""
ANALYSIS TASK:
Your *sole* task is to identify and extract specialized educational terminology relevant to CHEMISTRY that is *LITERALLY PRESENT* in the provided 'TOPIC TEXT'.
this content is from a chemistry textbook grade 9. i want to help students provide meanings of some important words from the content. extract words which are hard to understand from the provided textbook. These are often terms they might click on for a definition if this were an interactive textbook. do not make up any terms, do not infer, do not paraphrase, do not generate new terms. Only extract terms that are explicitly written in the text.

TOPIC TEXT:
---
{topic_text}
---

STRICT REQUIREMENTS FOR EXTRACTION:
1.  EXTRACT ONLY TERMS LITERALLY PRESENT:
    *   You *must not* invent, infer, paraphrase, or generate any terms, concepts, or phrases that are not explicitly written in the 'TOPIC TEXT'.
    *   If a term is conceptually related but not written verbatim, DO NOT include it.
    *   Extract the term *exactly as it appears* in the text regarding case for multi-word phrases if important, though output will be lowercased. If case is not important, extract as lowercase.
2.  TYPES OF TERMS TO EXTRACT (IF LITERALLY PRESENT):
    *   Key chemistry concepts and principles (e.g., 'stoichiometry', 'thermodynamics').
    *   Specific chemical substance names (e.g., 'methane', 'sulfuric acid', 'glucose', 'sodium chloride').
    *   Names of important chemical elements when they are discussed in a specific chemical context (e.g., 'carbon' in organic chemistry, 'oxygen' as an oxidizer, 'technetium' as a specific element). Do not extract elements if used very generically (e.g., "air contains oxygen" unless "oxygen" is a focus).
    *   Established scientific phrases and named laws/effects (e.g., 'chemical bond', 'atomic structure', 'reaction rate', 'Bose-Einstein condensate', 'Tyndall effect', 'Le Chatelier's Principle', 'Van der Waals forces').
3.  PRIORITIZE: Nouns and noun phrases. Include key verbs if they represent a specific chemical process or action and are literally present (e.g., 'ionize', 'oxidize', 'polymerize').
4.  EXCLUDE THE FOLLOWING (even if present in text, unless a core chemistry term):
    *   Extremely common English words that do not carry specific chemical meaning in the context (e.g., "the", "is", "and", "study", "chapter", "important", "example", "properties", "composition", "structure", "substances", "changes", "matter", "laws", "principles").
    *   General academic, instructional, or descriptive words not specific to chemistry (e.g., "method", "analysis", "results", "beautiful", "difficult", "page", "section", "exercise").
    *   Numbers, standalone acronyms (unless they are standard chemical terms like 'DNA', 'RNA', 'ATP' if relevant and used as such).
    *   Chemical formulas (e.g., H2O, CO2) – extract the name of the compound/molecule instead IF IT IS PRESENT (e.g., if "H2O (water)" is in text, extract "water"). If only "H2O" is present, do not extract "water" unless "water" is also separately in the text.
    *   Most standalone adjectives and adverbs, unless they are part of an established chemical term (e.g., 'covalent' in 'covalent bond', 'aqueous' in 'aqueous solution', 'endothermic' if it's a key term discussed).

OUTPUT FORMAT:
Return ONLY a comma-separated list of the extracted words/phrases. Each term should be distinct.
The list should only contain terms found *literally* in the 'TOPIC TEXT'.
Example: "stoichiometry,chemical reaction,mole concept,methane,carbon,ionization,covalent bond,Le Chatelier's Principle"
(This example list is illustrative; your output MUST be derived strictly from the provided 'TOPIC TEXT'.)

Now, meticulously extract the specialized chemistry terms that are LITERALLY PRESENT in the 'TOPIC TEXT' provided above.
"""

    payload = {
        "model": "deepseek-reasoner",
        "messages": [
            {"role": "system", "content": "You are a highly precise scientific content extraction assistant. Your primary function is to identify and list terms that are *literally present* in the provided text, following all constraints meticulously. You do not infer, add, or invent information."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.0, # Set to 0.0 for maximum determinism and adherence to literal extraction
        "max_tokens": 2000, # Increased slightly just in case, but output should be concise
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=120) # Increased timeout
            response.raise_for_status()

            content = response.json()
            if 'choices' in content and content['choices']:
                raw_output = content['choices'][0]['message']['content'].strip()

                # Clean, split, make unique, and filter out common words post-LLM
                # Also filter out single characters unless specifically desired
                llm_extracted_terms = [
                    word.strip().lower() for word in raw_output.split(",")
                    if word.strip() and len(word.strip()) > 1 # Basic check for empty strings and single chars
                ]

                # Post-processing filter
                # This is a more robust way to handle common words than overloading the prompt
                final_terms = sorted(list(set(
                    term for term in llm_extracted_terms
                    if term not in COMMON_WORDS_TO_EXCLUDE_POST_LLM and len(term) > 2 # exclude very short, likely common words
                )))
                return final_terms
            else:
                print(f"Warning: No 'choices' in API response for topic {topic_id} (Attempt {attempt+1}). Response: {content}")
                if attempt == max_retries - 1: return []
                time.sleep(5 * (attempt + 1)) # Exponential backoff

        except requests.exceptions.RequestException as e:
            print(f"API Request Error for topic {topic_id} (Attempt {attempt+1}): {e}")
            if attempt == max_retries - 1: return []
            time.sleep(5 * (attempt + 1))
        except Exception as e:
            print(f"An unexpected error occurred for topic {topic_id} (Attempt {attempt+1}): {e}")
            if attempt == max_retries - 1: return []
            time.sleep(5 * (attempt + 1))
    return []


def save_results(results: Dict[str, List[str]], output_path: str):
    """Saves the extracted terms to the output file, organized by topic."""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            for topic_id, words in results.items():
                f.write(f"[Topic {topic_id}]\n")
                if words:
                    f.write(",".join(words) + "\n\n")
                else:
                    f.write("No specialized terms extracted or all filtered out for this topic.\n\n")
        print(f"\n✅ Results saved to {output_path}")
    except IOError as e:
        print(f"Error writing to output file '{output_path}': {e}")

def main():
    parser = argparse.ArgumentParser(
        description='Extracts specialized chemistry terms from topics in an XML book using DeepSeek API.'
    )
    parser.add_argument('xml_file', help='Path to the XML book file.')
    parser.add_argument(
        '--output', '-o', default=OUTPUT_FILE,
        help=f'Output file path for extracted terms (default: {OUTPUT_FILE})'
    )
    parser.add_argument(
        '--apikey',
        help='DeepSeek API Key. Best to set as DEEPSEEK_API_KEY environment variable.'
    )

    args = parser.parse_args()

    # Determine API Key
    api_key_to_use = args.apikey
    if not api_key_to_use:
        import os
        api_key_to_use = os.getenv("DEEPSEEK_API_KEY")

    if not api_key_to_use:
        print("Error: DeepSeek API Key is not set. Please provide via --apikey argument or set DEEPSEEK_API_KEY environment variable.")
        return

    print(f"📖 Processing XML book: {args.xml_file}")
    print(f"💾 Output will be saved to: {args.output}")
    print("=" * 80)

    topics = load_xml_book(args.xml_file)
    if not topics:
        print("No topics found or could not load the XML file. Exiting.")
        return

    all_extracted_terms = {}
    total_topics = len(topics)
    for i, (topic_id, topic_text) in enumerate(topics.items()):
        print(f"\n⏳ Processing Topic {i+1}/{total_topics}: {topic_id}...")
        # Make sure topic_text is not excessively long for the API context window.
        # If it is, you might need to chunk it or summarize, but that complicates "literal extraction".
        # DeepSeek's context window is large, so this is usually not an issue for typical topic lengths.
        if len(topic_text.split()) > 25000: # Heuristic: ~30k tokens is DeepSeek's limit
             print(f"Warning: Topic {topic_id} is very long ({len(topic_text.split())} words) and might exceed context limits.")

        extracted_words = extract_specialized_chemistry_terms(api_key_to_use, topic_id, topic_text)
        all_extracted_terms[topic_id] = extracted_words
        print(f"   Extracted {len(extracted_words)} specialized term(s) after filtering.")

    save_results(all_extracted_terms, args.output)

if __name__ == "__main__":
    main()
