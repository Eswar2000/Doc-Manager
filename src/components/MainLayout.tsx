import Sidebar from './sidebar/Sidebar';
import {
    Puzzle,
    Receipt,
    Boxes,
    Settings
} from 'lucide-react';
import { SidebarItem } from './sidebar/SidebarItem';

export default function MainLayout({ }) {
    return (
        <div className="flex h-screen">
            <Sidebar>
                <SidebarItem icon={<Boxes />} text="Attributes" />
                <SidebarItem icon={<Puzzle />} text="Snippets" />
                <SidebarItem icon={<Receipt />} text="Templates" />
                <hr className="my-3 border-1 border-gray-100" />
                <SidebarItem icon={<Settings />} text="Settings" />
            </Sidebar>
        </div>
    )
}
