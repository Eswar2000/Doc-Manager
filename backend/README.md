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

### 4. Run Server

```bash
uv run uvicorn src.main:app --reload --port 8000
```

Server will start in `http://localhost:8000`

### 5. Deactivate Virtual Environment

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