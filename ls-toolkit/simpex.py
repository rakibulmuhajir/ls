#!/usr/bin/env python3
"""
Simple Educational Word Extractor using Ollama
Extracts meaningful words from a topic and gets bilingual definitions
"""

import json
import re
import asyncio
import aiohttp
import argparse

# Sample topic - replace with your content
SAMPLE_TOPIC = """
    <topic id="1.1" title="What is Chemistry?">
        <section type="CORE_DEFINITION" title="CORE DEFINITION">
            <definition_content>
                <paragraph>Chemistry is the branch of science that deals with the properties, composition, and structure of substances, as well as the physical and chemical changes in matter and the laws or principles that govern these changes.</paragraph>
            </definition_content>
        </section>
    </topic>
"""

async def extract_words_with_model(topic: str, model_name: str, ollama_host: str):
    """Extract words and meanings using Ollama model"""
    prompt = f"""
You are an expert educational content processor. Extract important educational words from this topic:

{topic}

For each word:
1. Must be educationally relevant (skip common words like 'the', 'is', etc.)
2. Skip formulas, numbers, and references (like H2O, Fig 1.1)
3. Provide these details in JSON format:
   - "word": the extracted word
   - "type": part of speech (noun, verb, etc.)
   - "definition": simple English definition
   - "urdu_meaning": meaning in Urdu (اردو میں معنی)
   - "example": example sentence in English
   - "urdu_example": example sentence in Urdu

Output ONLY valid JSON in this format:
{{
  "words": [
    {{
      "word": "chemistry",
      "type": "noun",
      "definition": "The scientific study of matter and its properties",
      "urdu_meaning": "مادہ اور اس کی خصوصیات کا سائنسی مطالعہ",
      "example": "She is studying chemistry at university.",
      "urdu_example": "وہ یونیورسٹی میں کیمسٹری پڑھ رہی ہے۔"
    }},
    // ... more words
  ]
}}
"""

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{ollama_host}/api/generate",
                json={
                    "model": model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "num_predict": 1000
                    }
                },
                timeout=aiohttp.ClientTimeout(total=120)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result.get('response', '').strip()

                    # Try to extract JSON
                    try:
                        json_match = re.search(r'\{.*\}', content, re.DOTALL)
                        if json_match:
                            return json.loads(json_match.group())
                    except json.JSONDecodeError:
                        print("Failed to parse JSON response")
                        print("Raw response:")
                        print(content)
                        return None
    except Exception as e:
        print(f"API Error: {e}")
        return None

def display_results(word_data):
    """Display word information in terminal"""
    if not word_data or 'words' not in word_data:
        print("No words extracted")
        return

    print("\n📚 Extracted Educational Vocabulary:")
    print("=" * 60)

    for word_info in word_data['words']:
        print(f"\n🔍 {word_info['word'].upper()} ({word_info.get('type', 'N/A')})")
        print(f"   English: {word_info['definition']}")
        print(f"   اردو: {word_info['urdu_meaning']}")
        print(f"\n   Example: {word_info['example']}")
        print(f"   مثال: {word_info['urdu_example']}")
        print("-" * 60)

async def main():
    parser = argparse.ArgumentParser(description='Simple Educational Word Extractor using Ollama')
    parser.add_argument('--model', '-m', default='llama3.2:latest', help='Ollama model name')
    parser.add_argument('--host', default='http://localhost:11434', help='Ollama host URL')
    parser.add_argument('--topic', help='Topic text to analyze (optional)')

    args = parser.parse_args()

    # Use provided topic or sample
    topic = args.topic if args.topic else SAMPLE_TOPIC

    print(f"🧪 Using model: {args.model}")
    print(f"📝 Analyzing topic...")
    print("=" * 60)
    print(topic.strip())
    print("=" * 60)

    print("\n⏳ Processing... (this may take 1-2 minutes)")
    word_data = await extract_words_with_model(topic, args.model, args.host)

    if word_data:
        display_results(word_data)
    else:
        print("❌ Failed to extract words")

if __name__ == "__main__":
    asyncio.run(main())

