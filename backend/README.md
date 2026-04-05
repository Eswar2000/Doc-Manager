# Backend Setup (Python FastAPI)

This service powers the **Template Manager** backend, handling placehoder management, template management, versioning, and document generation.

---

## ⚙️ Prerequisites

- Python 3.10+
- pip

---

## 🚀 Setup

### 1. Create Virtual Environment (only first time)

```bash
python -m venv .venv
```

### 2. Activate Virtual Environment

#### For Windows
```bash
.venv\Scripts\activate
```

### 3. Install Dependencies (only first time)

```bash
pip install -r requirements.txt
```

### 4. Install Playwright Chromium Browser (only first time)

```bash
python -m playwright install chromium
```

### 5. Run Server

```bash
uv run uvicorn src.main:app --reload --port 8000
```

Server will start in `http://localhost:8000`. Since we are running async playwright to generate PDF from HTML content, avoid using `--reload` as it forces a `SelectorEventLoop` which will throw when generating documents.

### 6. Deactivate Virtual Environment

```bash
deactivate
```

---

## 🌱 Environment Variables

Create a `.env` file in the `backend/src/` directory and define the required variables:

```env
COSMOS_DATABASE_NAME=your_database_url
COSMOS_CONNECTION_STRING=your_database_connection_string
```