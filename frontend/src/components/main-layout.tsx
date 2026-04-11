import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import Sidebar from './sidebar/sidebar';
import {
    Puzzle,
    Receipt,
    Boxes,
    Settings,
    LogOut
} from 'lucide-react';
import { SidebarItem } from './sidebar/sidebar-item';

export default function MainLayout() {
    const isAuthenticated = useIsAuthenticated();
    const { instance } = useMsal();

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: window.location.origin,
        }).catch((error) => {
            console.error("Logout failed:", error);
        });
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<Boxes />} text="Attributes" to="/attributes" />
                <SidebarItem icon={<Puzzle />} text="Snippets" to="/snippets" />
                <SidebarItem icon={<Receipt />} text="Templates" to="/templates" />
                <hr className="my-3 border-1 border-gray-100" />
                <SidebarItem icon={<Settings />} text="Settings" to="/settings" />
                <SidebarItem icon={<LogOut />} text="Logout" onClick={handleLogout} />
            </Sidebar>
            <main className="flex flex-1 justify-center">
                <Outlet />
            </main>
        </div>
    )
}