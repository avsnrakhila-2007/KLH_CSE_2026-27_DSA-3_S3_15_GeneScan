# GeneScan

GeneScan compares real Java implementations of Boyer–Moore and Naive DNA motif search. It accepts pasted DNA/text and TXT, FASTA-style text, PDF, DOC, and DOCX files. Uploaded files are read in memory, limited to 10 MB, and are not stored.

## Requirements

- Java 17 or newer
- Apache Maven 3.9 or newer
- Node.js 20.19+ or 22.12+
- Python 3 for the API smoke test

Maven downloads PDFBox and Apache POI dependencies from `pom.xml`.

## Run

In one terminal, from the project directory:

```powershell
mvn clean compile exec:java
```

In a second terminal:

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the second terminal. The Java API listens on `http://localhost:8081`; Vite proxies `/api` to it.
The dashboard is `/`; the persistent analysis workspace is `/analysis` with dedicated `/analysis/boyer-moore`, `/analysis/naive`, and `/analysis/comparison` screens.

## Test

With both servers running, from the project directory:

```powershell
python .\test_upload.py
```

The test uploads a FASTA-style file, submits the same multiline DNA to each algorithm, and asserts identical match positions.

Sample DNA:

```text
ATGCGTACGTA
GCTAGCTAGCTAGCTAGCTA
```

Motif: `GCTAGCTA`

Expected positions: `[11, 15, 19, 23]` (0-indexed). Comparison counts and execution times are measured by the Java algorithms and may vary by run.

## API

- `GET /api/health`
- `POST /api/extract` with JSON field `text`
- `POST /api/extract-file` with multipart field `file`
- `POST /api/analyze` with JSON fields `sequence`, `motif`, and `algorithm` (`boyerMoore` or `naive`)
- `POST /api/analyze-file` with multipart fields `file`, `motif`, and `algorithm`
