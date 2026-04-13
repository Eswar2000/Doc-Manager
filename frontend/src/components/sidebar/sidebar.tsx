import { ChevronFirst, ChevronLast } from "lucide-react";
import { useState, createContext } from "react";
import type { SidebarChildrenProps, SidebarContextType } from "../../types/index";
import SidebarUserProfile from "./sidebar-user-profile";
import logo from "../../assets/brand-logo.svg";

export const SidebarContext = createContext<SidebarContextType>({ expanded: true });
export default function Sidebar({ children }: SidebarChildrenProps) {
    const [expanded, setExpanded] = useState(true);
    return (
        <aside className="h-screen">
            <nav className="h-full flex flex-col bg-white border-r border-gray-50 shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src={logo}
                        alt=""
                        className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"
                            }`} />
                    <button onClick={() => setExpanded(curr => !curr)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>
                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3">
                        {children}
                    </ul>
                </SidebarContext.Provider>
                <div className="border-t border-gray-100 p-4 mt-auto">
                    <SidebarUserProfile expanded={expanded} />
                </div>
            </nav>
        </aside>
    )
}