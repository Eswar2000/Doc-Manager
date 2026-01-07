import { Outlet } from "react-router-dom";
import Sidebar from './sidebar/sidebar';
import {
    Puzzle,
    Receipt,
    Boxes,
    Settings
} from 'lucide-react';
import { SidebarItem } from './sidebar/sidebar-item';
import AttributesPage from './pages/attributes-page';
import EditorPage from './pages/editor-page';

export default function MainLayout({ }) {
    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<Boxes />} text="Attributes" to="/attributes" />
                <SidebarItem icon={<Puzzle />} text="Snippets" to="/snippets" />
                <SidebarItem icon={<Receipt />} text="Templates" to="/templates" />
                <hr className="my-3 border-1 border-gray-100" />
                <SidebarItem icon={<Settings />} text="Settings" to="/settings" />
            </Sidebar>
            <main className="flex flex-1 justify-center">
                <Outlet />
            </main>
        </div>
    )
}
