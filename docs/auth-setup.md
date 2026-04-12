# Authentication Setup

This application uses **OAuth 2.0 (Authorization Code Flow with PKCE)** via **Microsoft Entra ID** for secure user authentication.

---

## 🔐 Microsoft Entra ID Setup

### 1. Azure App Registration

Create an app registration in Azure:
1. Go to **Azure Portal** &rarr; **Microsoft Entra ID** &rarr; **App Registrations**.
2. Add new registration.
    1. Name: <your-app-name>.
    2. Supported account types: Accounts in any organizational directory + personal Microsoft accounts.
    3. Redirect URI (Single Page Application)
        - http://localhost:5173 (for frontend app)
        - http://localhost:5173/redirect.html (for frontend oauth redirection)
        - http://localhost:8000/oauth2-redirect (for backend swagger oauth redirection)

MSAL recommends having a [redirection html page](../frontend/redirect.html) and configuring the same in [MSAL config](../frontend//src/auth/msal-config.ts).

### 2. Collect Required IDs

From the app registration:
- Application or Client ID
- Directory or Tenant ID

Add these to backend and frontend .env files.
