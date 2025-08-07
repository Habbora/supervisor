import React, { ReactNode } from "react";

export interface ModernHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    menuItems?: {
        name: string;
        href: string;
    }[];
    children?: ReactNode;
}

export default function ModernHeader({
    title,
    subtitle,
}: ModernHeaderProps) {
    return (
        <div className="flex-col w-full border-2 border-gray-200 bg-gray-100 p-4 rounded-lg">
            <div className="flex flex-col items-start">
                <h1 className="text-2xl font-semibold mb-4">
                    {title}
                </h1>
                <h2 className="text-xl font-semibold ml-2">
                    {subtitle}
                </h2>
            </div>
        </div>
    );
};
