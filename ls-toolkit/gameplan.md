# 📚 Book Content Pipeline - Internal Gameplan

## 🛠️ Tools & Scripts Inventory

### 1. PDF Preparation with OCRmyPDF

**Purpose**: Convert scanned PDFs to searchable text-enabled PDFs

**Installation Steps**:
```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install tesseract
choco install ghostscript
choco install ocrmypdf
```

**Alternative Python Installation**:
```bash
pip install ocrmypdf
```

**Usage**:
```bash
ocrmypdf input.pdf output.pdf
```

---

### 2. Text Extraction

**Purpose**: Extract raw text from OCRed PDFs for processing

**Script**:
```python
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text() for page in doc])
    return text

# Usage
raw_text = extract_text_from_pdf("your-book.pdf")
```

**Output**: Raw text file containing all extracted content

---

### 3. OCR Error Cleaning

**Purpose**: Clean OCR errors and unwanted text using LLM processing

**Process**:
- Remove artifacts from illustrations, diagrams, headers, footers
- Fix common OCR misreads
- Preserve educational content structure

**Tool**: LLM-based text cleaning

---

### 4. Content Conversion

**Purpose**: Convert cleaned textbook text to structured app content format

**Process**:
- Transform raw text into chapter/topic/section hierarchy
- Apply consistent formatting
- Structure content for mobile app consumption

**Tool**: LLM-based content structuring

---

### 5. Word Extraction

**Purpose**: Extract key vocabulary words for meaning enrichment

**Process**:
- Identify important terms and concepts
- Prepare words for definition lookup
- Create vocabulary enhancement data

**Tool**: LLM-based word extraction

---

### 6. Content Translation & Database Management

**Scripts Overview**:

#### `xml-words-tagging.py`
**Purpose**: Enriches XML content with vocabulary tags
- **Input**: XML file with textbook data + CSV with word enrichment data
- **Output**: XML with rich word tags embedded
- **Dependencies**: Word enrichment CSV data

#### `multi-sect-single-file.py`
**Purpose**: Adds new textbook sections to database
- **Input**: XML file with new textbook sections
- **Process**: Batch section insertion
- **Dependencies**: `supa-ingestv2.py`

#### `word_ingest_gem.py`
**Purpose**: Ingests vocabulary enrichment data
- **Input**: CSV with words enrichment data
- **Target**: Words table + topic-words junction tables
- **Process**: Vocabulary data population

#### `replace-db-content.py`
**Purpose**: Updates existing book content in database
- **Input**: XML with updated content
- **Process**: Content replacement/update
- **Dependencies**: `supa-ingestv2.py`

---

## 📋 Content Processing Workflow

### Standard Pipeline for New Books:

1. **Prepare PDF**: `ocrmypdf input.pdf output.pdf`
2. **Extract Text**: Use PyMuPDF extraction script
3. **Clean Text**: LLM-based OCR error correction
4. **Structure Content**: LLM-based content conversion
5. **Extract Vocabulary**: LLM-based word extraction
6. **Enrich Content**: Run `xml-words-tagging.py`
7. **Database Ingestion**: Run `multi-sect-single-file.py`
8. **Vocabulary Setup**: Run `word_ingest_gem.py`

### For Content Updates:
- Use `replace-db-content.py` for existing book updates

---

## 🔢 Numbering Convention

**Chapter Structure**:
- Main topics: `2.1`, `3.4` (chapter.topic)
- Sub-sections: `2.0`, `4.0` (for question banks and additional resources)

**Database Schema**:
- Pre-dot digit = Chapter number
- Post-dot digit = Topic/Section number

---

## 📝 Notes

- All scripts are designed for batch processing
- Dependencies between scripts should be maintained
- XML format is the intermediate format for structured content
- Translation features are section-level, not chapter/topic level
- Question banks use `.0` numbering for easy identification
