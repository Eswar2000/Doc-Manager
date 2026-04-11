# Backend Setup (Python FastAPI)

This service powers the **Template Manager** backend, handling placehoder management, template management, versioning, and document generation.

---

## ⚙️ Prerequisites

- Python 3.10+
- Pip
- Azure CLI (installed globally, not on venv)

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
COSMOS_DATABASE_NAME=your_database_name
COSMOS_ENDPOINT=https://<your_database_account>.documents.azure.com:443/
```

---

## 🔐 Azure Setup (for Cosmos DB Access)

This project uses **Azure Cosmos DB with Azure AD (RBAC-based authentication)** for secure access. No database credentials are stored in code.

### Prerequisites (for developers only)

Before running the backend locally, ensure you have:
- Azure CLI [installed](https://aka.ms/InstallAzureCLI)
- An active Azure account with access to the subscription
- Logged into Azure CLI

### 1. Login to Azure

```bash
az login
```

If your organization requires it:

```bash
az login --tenant <TENANT_ID>
```

Verify login:

```bash
az account show
```

### 2. Get Your Azure Principal ID

Each developer must share their Azure Object ID (Principal ID) with the repository owner.
Run:

```bash
az ad signed-in-user show --query id -o tsv
```

This returns:

```bash
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

This is your principle ID.

### 3. Share Your Details

Send the following to the repository owner:

```bash
Name:
Email:
Principal ID:
```

### 4. Access Grant (Admin Setup - Done by Repository Owner)

Once your Principal ID is received, the repository owner will grant Cosmos DB access using:

```bash
az cosmosdb sql role assignment create \
  --account-name <cosmos-account-name> \
  --resource-group <resource-group-name> \
  --role-definition-id "00000000-0000-0000-0000-000000000002" \
  --principal-id <developer-principal-id> \
  --scope "/"
```

### 5. Required Role

This project uses **Cosmos DB Built-in Data Contributor** role.

It allows:
- ✔ Read documents
- ✔ Create documents
- ✔ Update documents
- ✔ Delete documents
- ✔ Query containers

This does **NOT** allow:
- ❌ Deleting Cosmos DB account
- ❌ Creating/deleting databases
- ❌ Changing infrastructure (RU/s, firewall, networking)
- ❌ Subscription-level changes

### 6. Verify Access

After access is granted:

```bash
az account show
```

Then start the backend. Cosmos DB access will work automatically using Azure AD authentication.