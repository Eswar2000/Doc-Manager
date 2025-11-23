export interface SidebarItemProps {
    icon: any;
    text: string;
    active?: boolean;
    alert?: boolean;
}

export interface SidebarChildrenProps {
    children?: any;
}

export interface SidebarContextType {
    expanded: boolean;
}