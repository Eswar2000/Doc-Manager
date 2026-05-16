import { EventType, type AuthenticationResult } from "@azure/msal-browser";
import { msalInstance } from "./msal-instance";
import { useState, useEffect, type ReactNode } from "react";
import { MsalProvider } from "@azure/msal-react";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // 1. Handle redirect response (critical for loginRedirect flow)
        msalInstance.handleRedirectPromise()
            .then((response: AuthenticationResult | null) => {
                if (response?.account && isMounted) {
                    msalInstance.setActiveAccount(response.account);
                }
            })
            .catch((error) => {
                console.error("MSAL Redirect Error:", error);
            });

        // 2. Set active account on page refresh
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
            msalInstance.setActiveAccount(accounts[0]);
        }

        // 3. Listen for future login events
        const callbackId = msalInstance.addEventCallback((event) => {
            if (event.eventType === EventType.LOGIN_SUCCESS) {
                const account = (event.payload as AuthenticationResult)?.account;
                if (account) {
                    msalInstance.setActiveAccount(account);
                }
            }
        });

        // Mark initialization as complete
        setIsInitialized(true);

        // Cleanup
        return () => {
            isMounted = false;
            if (callbackId) {
                msalInstance.removeEventCallback(callbackId);
            }
        };
    }, [])

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-indigo-200 text-lg font-medium">Please wait...</p>
                </div>
            </div>
        );
    }

    return <MsalProvider instance={msalInstance}>
        {children}
    </MsalProvider>
}

export function useAuthProvider() {
    return { AuthProvider }
}