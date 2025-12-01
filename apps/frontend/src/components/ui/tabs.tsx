'use client';

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Tab {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="border-b-2 border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                className={cn(
                  "relative px-4 py-3 font-medium text-sm transition-all duration-200 whitespace-nowrap",
                  "border-b-2 -mb-[2px]",
                  "hover:text-amber-600",
                  isActive
                    ? "text-amber-600 border-amber-500"
                    : "text-gray-600 border-transparent hover:border-gray-300"
                )}
              >
                <span className="flex items-center gap-2">
                  {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                        isActive
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
