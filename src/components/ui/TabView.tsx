import { useState } from 'react';
import Tabs, { TabItem } from './tabs';

interface TabViewProps {
  tabs: TabItem[];
  initialTab?: string; // Optional: label of the tab to be selected initially
}

export default function TabView({ tabs, initialTab }: TabViewProps) {
  const [selectedTab, setSelectedTab] = useState(
    initialTab || (tabs.length > 0 ? tabs[0].label : ''),
  );

  return (
    <div className="flex flex-col w-full">
      <Tabs tabs={tabs} activeTab={selectedTab} onTabChange={setSelectedTab} className="" />
      <div className="mt-4">{tabs.find((tab) => tab.label === selectedTab)?.content}</div>
    </div>
  );
}
