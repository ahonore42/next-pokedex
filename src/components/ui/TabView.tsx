import React, { useState } from 'react';
import clsx from 'clsx';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabViewProps {
  tabs: Tab[];
  initialTab?: string; // Optional: label of the tab to be selected initially
}

export default function TabView({ tabs, initialTab }: TabViewProps) {
  const [selectedTab, setSelectedTab] = useState(initialTab || (tabs.length > 0 ? tabs[0].label : ''));

  return (
    <div className="flex flex-col w-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={clsx(
              'px-4 py-2 text-sm font-medium focus:outline-none',
              selectedTab === tab.label
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
            )}
            onClick={() => setSelectedTab(tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.label === selectedTab)?.content}
      </div>
    </div>
  );
}
