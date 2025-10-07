import React, { ReactNode } from "react";

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
}) => {
  return (
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
    </div>
  );
};

export default DashboardTopMenu;
