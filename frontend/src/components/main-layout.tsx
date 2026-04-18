import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import Sidebar from './sidebar/sidebar';
import { Loader } from "@/components/loader/loader";
import { ErrorState } from "@/components/error-state/error-state";
import {
    Puzzle,
    Receipt,
    Boxes,
    Settings,
    LogOut
} from 'lucide-react';
import { SidebarItem } from './sidebar/sidebar-item';
import { useMyTenants } from '@/hooks/use-my-tenants';
import { useTenantStore } from "@/stores/tenant-store";

export default function MainLayout() {
    const isAuthenticated = useIsAuthenticated();
    const { instance } = useMsal();

    const { isLoading, error } = useMyTenants();
    const { currentTenantId } = useTenantStore();

    const handleLogout = () => {
        // On logout, clean the tenants state from zustand
        const { clear } = useTenantStore.getState();
        clear();

        // clear the local storage of the current tenant id
        localStorage.removeItem('currentTenantId');

        // Redirect to the identity provider's logout endpoint
        instance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin,
        }).catch((error) => {
            console.error("Logout failed:", error);
        });
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isDisabled = isLoading || !!error;

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<Boxes />} text="Attributes" to="/attributes" disabled={isDisabled} />
                <SidebarItem icon={<Puzzle />} text="Snippets" to="/snippets" disabled={isDisabled} />
                <SidebarItem icon={<Receipt />} text="Templates" to="/templates" disabled={isDisabled} />
                <hr className="my-3 border-1 border-gray-100" />
                <SidebarItem icon={<Settings />} text="Workspace Settings" to="/workspace" disabled={isDisabled} />
                <SidebarItem icon={<LogOut />} text="Logout" onClick={handleLogout} />
            </Sidebar>
            <main className="flex flex-1 justify-center">
                {isLoading ? (
                    <Loader
                        screenHeader="Loading your workspaces"
                        screenMessage="Please wait till we fetch your workspaces"
                    />
                ) : error ? (
                    <ErrorState
                        title="Failed to load workspaces"
                        description="Please refresh the page or contact support if the issue persists."
                    />
                ) : <Outlet />}

            </main>
        </div>
    )
}