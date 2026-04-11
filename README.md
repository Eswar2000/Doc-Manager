# Template Manager
A web-based document templating system designed to create, manage, and generate dynamic contract-like documents with version control, conditional logic, and reusable components.

---

## 🚀 Overview

**Template Manager** enables users to define document templates as blueprints and generate finalized documents by filling structured inputs.

It supports:
- Dynamic placeholders
- Conditional content rendering
- Template versioning
- Document generation
- Reusable snippets (upcoming)
- AI assisted template creation

---

## ✨ Features

### 1. Placeholder Management
- Create and edit placeholders (e.g., `name`, `occupation`, etc.)

### 2. Template Management
- Create and edit document templates
- Structured template storage

### 3. Conditional Rendering
- Add logic-based rules to control content visibility  
- Example:
  - Render Clause A if `salary > 100000`
  - Render Clause B if `employment_type == "contract"`

### 4. Versioning
- Every update to a template creates a new version
- Latest version is marked as **active**
- Older versions are **archived** for traceability

### 5. Placeholder System
- Strongly structured input fields
- Supports multiple data types (string, number, boolean, etc.)
- Drives both rendering and validation

### 6. Document Generation
- Generate final documents by filling placeholder values
- Form-driven input system
- Currently supporting PDF export

---

## 🧩 Upcoming Features

### Snippet Management
- Define reusable content blocks (e.g., disclaimers, terms)
- Centralized updates across templates
- Plug-and-play integration within templates

### AI Driven Template Creation
- Share as many final documents (as PDFs)
- The system detects patterns across the documents to generate 1 template
- Detection of placeholders, rules and reusable blocks with help of AI

---

## ⚙️ Core Concepts

| Concept        | Description |
|----------------|------------|
| Template       | Blueprint for generating documents |
| Placeholder    | Dynamic variable replaced at runtime |
| Condition Rule | Logic controlling content rendering |
| Version        | Immutable snapshot of template state |
| Snippet        | Reusable content block (upcoming) |

---

## 🛠️ Tech Stack

- Frontend: React + Vite
- Backend: Python
- Database: CosmosDB
- Editor: Tiptap Editor

---

## 🧑‍💻 Development Setup

For local development, refer to the service-specific setup guides:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

### Quick Flow

1. Start the backend server
2. Start the frontend server
3. Open `http://localhost:5173` in your browser