# Frontend (React + Vite)

This is the frontend for the **Template Manager** application. It provides the UI for managing palceholders and templates.

---

## ⚙️ Prerequisites

- Node.js (v18+ recommended)
- npm

---

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies defined in `package.json`.

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌱 Environment Variables

Create a `.env.local` file in the `frontend/` directory and define the required variables:

```env
VITE_API_BASE_URL=http://localhost:8000/
VITE_AZURE_CLIENT_ID=...
VITE_AZURE_TENANT_ID=...
```

`AZURE_CLIENT_ID` AND `AZURE_TENANT_ID` can be obtained from the Microsoft Entra ID app registration. The repository owner will be able to share this information.

---

## Development Notes

- Ensure backend server is running before using the UI
- Hot reload is enabled by default
- TailwindCSS is used for styling
- UI components are built using `shadcn/ui`