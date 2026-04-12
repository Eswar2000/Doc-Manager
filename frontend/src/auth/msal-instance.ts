import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msal-config";

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize singleton and use it across the app
msalInstance.initialize().catch((err) => console.error("MSAL init failed", err));

export default msalInstance;