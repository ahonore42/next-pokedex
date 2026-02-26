import { useState, ReactNode } from 'react';
import Tabs, { TabItem } from './tabs';

interface TabViewProps {
  tabs: TabItem[];
  initialTab?: string;
  filter?: ReactNode; // Pre-configured SearchBar component
  containerHeight?: string;
  className?: string;
}

export default function TabView({
  tabs,
  initialTab,
  filter,
  containerHeight = 'h-96',
  className = '',
}: TabViewProps) {
  const [selectedTab, setSelectedTab] = useState(
    initialTab || (tabs.length > 0 ? tabs[0].label : ''),
  );

  return (
    <div className={`flex flex-col w-full gap-4 ${className}`}>
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
      <div className={containerHeight ? `${containerHeight} overflow-y-auto` : undefined}>
        {tabs.find((tab) => tab.label === selectedTab)?.content}
      </div>
    </div>
  );
}
