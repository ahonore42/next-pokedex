import { useState, ReactNode } from 'react';
import Tabs, { TabItem } from './tabs';
import clsx from 'clsx';

interface TabViewProps {
  tabs: TabItem[];
  initialTab?: string;
  filter?: ReactNode; // Pre-configured SearchBar component
  containerSize?: string;
  className?: string;
}

export default function TabView({
  tabs,
  initialTab,
  filter,
  containerSize = '',
  className = '',
}: TabViewProps) {
  const [selectedTab, setSelectedTab] = useState(
    initialTab || (tabs.length > 0 ? tabs[0].label : ''),
  );

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Header container with tabs and optional search bar */}
      <div className="w-full border-b border-border">
        <div className="flex items-center">
          {/* Tabs container - takes available space and allows scrolling */}
          <div className="flex-1 min-w-0">
            <Tabs
              tabs={tabs}
              activeTab={selectedTab}
              onTabChange={setSelectedTab}
              className="border-b-0"
            />
          </div>

          {/* Filter component - fixed width, no shrinking */}
          {filter && <div className="flex-shrink-0 ml-4">{filter}</div>}
        </div>
      </div>

      {/* Tab content */}
      <div className={clsx('mt-4 ', containerSize && `${containerSize} overflow-scroll`)}>
        {tabs.find((tab) => tab.label === selectedTab)?.content}
      </div>
    </div>
  );
}
