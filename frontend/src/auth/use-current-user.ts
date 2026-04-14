import { useMsal } from "@azure/msal-react";
import { useMemo } from "react";
import type { CurrentUser } from "@/types/index";

export const useCurrentUser = (): CurrentUser | null => {
    const { accounts } = useMsal();

    return useMemo(() => {
        const account = accounts[0];

        if (!account) return null;

        const name = account.name || "Unknown User";
        const email = account.username || ""; // username in MSAL usually holds the email / UPN

        const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        const userId = (account.idTokenClaims as any)?.oid || (account.idTokenClaims as any)?.sub;

        return {
            name,
            email,
            initials: initials || "U",
            userId: userId as string | undefined,
        };
    }, [accounts]);
};