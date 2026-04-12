# Authentication Setup

This application uses **OAuth 2.0 (Authorization Code Flow with PKCE)** via **Microsoft Entra ID** for secure user authentication.

---

## 🔐 Microsoft Entra ID Setup

### 1. Azure App Registration

Create an app registration in Azure:
1. Go to **Azure Portal** &rarr; **Microsoft Entra ID** &rarr; **App Registrations**.
2. Add new registration.
    1. Name: `<your-app-name>`.
    2. Supported account types: Accounts in any organizational directory + personal Microsoft accounts.
    3. Redirect URI (Single Page Application)
        - `http://localhost:5173` (for frontend app)
        - `http://localhost:5173/redirect.html` (for frontend oauth redirection)
        - `http://localhost:8000/oauth2-redirect` (for backend swagger oauth redirection)

MSAL recommends having a [redirection html page](../frontend/redirect.html) and configuring the same into [MSAL config](../frontend//src/auth/msal-config.ts).

### 2. Collect Required IDs

From the app registration:
- Application or Client ID
- Directory or Tenant ID

Add these to backend and frontend .env files.

### 3. Scope Creation

1. Go to **App Registration** &rarr; **<your-app-name>** &rarr; **Expose an API**.
2. Setup application ID URI.
```bash
api://<your-client-id>
```
3. Create a scope.
    1. Scope name: `access_as_user`
    2. Who can consent: admin and users
    3. Admin consent display name: Access API as user
    4. Admin consent description: Allows the app to use backend APIs
    5. User consent display name: Access API
    6. User consent description: Allow app to access APIs on your behalf
    7. Enabled: true

This is a delegated permission to allow our frontend (client application) to call our backend (downstream applications) on behalf of signed-in user.

### 4. MSAL flow (frontend)

The frontend uses the following packages to carry out authentication.
- `@azure/msal-browser`
- `@azure/msal-react`

The authentication flow (from a frontend perspective are as follows):
**Login page** &rarr; **Microsoft login redirect** &rarr; **Access token issue** &rarr; **Token attached to API requests**

#### ⚠️ Important Notes

- MSAL handles token caching and renewal.
- Login page follows redirection flow (not the popup flow).
- Token is silently acquired post login.
- Active account is set (handled internally) on `Auth-Provider`. Use of *Singleton msal instance creation* followed as practice.
- API calls are blocked until authentication is ready.
- Tokens are attached to every API request with help of Axios interceptors.
- No secrets are stored or maintained in frontend.

### 5. MSAL flow (backend)

The backend uses the following packages to valdiate access tokens issued by **Microsoft Entra ID**.
- `fastapi`
- `fastapi-azure-auth`

1. The backend uses `MultiTenantAzureAuthorizationCodeBearer` to support request from any tenant (not restricted to one) with following configurations:
    1. App Client ID
    2. Scope: `access_as_user`
    3. Issuer validation: `validate_iss` set to false. But, in production, it can be made to allow only selective tenants.
    4. Guest user support: set to true.
2. All API routes (except health checks) are made as protected routes using:

```python
Depends(azure_scheme)
```

#### ⚠️ Important Notes
- No database credentials are stored for authentication.
- Uses Azure AD as identity provider (for MVP scope).
- Backend only validates access tokens, they do not issue tokens.
- By default made to support mutiple tenants.

---
