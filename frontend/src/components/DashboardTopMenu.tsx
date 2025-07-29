"use client";

import React, { ReactNode } from "react";
import DashboardCard from "./DashboardCard";
import { useRouter } from "next/navigation";

export interface DashboardTopMenuProps {
  title: string;
  icon?: React.ElementType;
  menuItems?: {
    name: string;
    href: string;
  }[];
  children?: ReactNode;
}

const DashboardTopMenu: React.FC<DashboardTopMenuProps> = ({
  title,
  icon,
  menuItems,
  children,
}) => {
  const router = useRouter();

  return (
    <>
      <DashboardCard>
        <div className="flex-col gap-4">
          <h1
            className="text-3xl font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            <div className="flex items-center">
              {icon &&
                React.createElement(icon, { className: "mr-2" })}
              {title}
            </div>
          </h1>

          <div className="flex flex-wrap gap-2">
            {menuItems &&
              menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(item.href)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  {item.name}
                </button>
              ))}
          </div>
          {children}
        </div>
      </DashboardCard>
    </>
  );
};

export default DashboardTopMenu;
