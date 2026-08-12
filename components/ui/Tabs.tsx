import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex border-b overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 min-h-[44px] font-medium transition whitespace-nowrap active:scale-95
              ${isActive 
                ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {Icon && <Icon size={18} />}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
