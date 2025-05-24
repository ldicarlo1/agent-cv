# Agent CV Generator

This is a simple AI agent that generates tailored CVs based on a job description and your personal information stored in a RAG database.

## Setup

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Add your OpenAI API key in `.env`:
   ```ini
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Ingest personal information into the RAG index:
   ```bash
   python ingest.py
   ```

5. Run the Flask application:
   ```bash
   python app.py
   ```

6. Open your browser at `http://localhost:5000`, paste a job description, and generate your tailored CV.
