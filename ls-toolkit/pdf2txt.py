# Extract text from a PDF file and save it to a text file.
#!/usr/bin/env python3

import sys
import fitz  # PyMuPDF
from pathlib import Path

def extract_text_from_pdf(pdf_path: str, output_path: str):
    try:
        doc = fitz.open(pdf_path)
        full_text = ""

        for page in doc:
            full_text += page.get_text() + "\n"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_text)

        print(f"✅ Extracted text saved to: {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf_text.py <input.pdf>")
        return

    input_path = Path(sys.argv[1])

    if not input_path.exists() or input_path.suffix.lower() != '.pdf':
        print(f"❌ Invalid PDF file: {input_path}")
        return

    output_path = input_path.with_suffix(".txt")
    extract_text_from_pdf(str(input_path), str(output_path))

if __name__ == "__main__":
    main()
