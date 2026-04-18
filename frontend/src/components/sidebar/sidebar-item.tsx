import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { SidebarContext } from "./sidebar";
import type { SidebarItemProps } from "../../types/index";

export function SidebarItem({ icon, text, active, alert, to, onClick, disabled }: SidebarItemProps) {
    const { expanded } = useContext(SidebarContext);

    const baseClasses = `
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md
        transition-colors group text-left
    `;
    const enabledClasses = `cursor-pointer text-gray-600 hover:bg-indigo-50`;
    const disabledClasses = `text-gray-500 cursor-not-allowed pointer-events-none`;

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={`
          ${baseClasses}
          ${disabled ? disabledClasses : enabledClasses}
        `}
            >
                {icon}

                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                    {text}
                </span>

                {/* Tooltip when collapsed */}
                {!expanded && (
                    <div
                        className={`absolute left-full rounded-md px-2 py-1 ml-6 
                            bg-indigo-100 text-indigo-800 text-sm 
                            invisible opacity-20 -translate-x-3 transition-all 
                            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
                    >
                        {text}
                    </div>
                )}
            </button>
        )
    } else {
        return (
            <NavLink
                to={to!}
                end
                className={({ isActive }) => {
                    const isItemActive = active ?? isActive;
                    return `
          ${baseClasses}
          ${disabled
                            ? disabledClasses
                            : isItemActive
                                ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                                : enabledClasses
                        }
        `;
                }}
            >
                {icon}
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                    {text}
                </span>
                {alert && (
                    <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`} />
                )}
                {!expanded && (
                    <div
                        className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm 
            invisible opacity-20 -translate-x-3 transition-all 
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
                    >
                        {text}
                    </div>
                )}
            </NavLink>
        )
    }

}