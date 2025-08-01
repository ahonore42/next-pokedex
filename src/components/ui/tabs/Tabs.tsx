import Tab, { TabItem } from './Tab';

export type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (label: string) => void;
  className?: string;
};

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`w-full border-b border-border ${className}`}>
      <div role="tablist" className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            tab={tab}
            isActive={activeTab === tab.label}
            onClick={() => onTabChange(tab.label)}
          />
        ))}
      </div>
    </div>
  );
}

// Display name for debugging
Tabs.displayName = 'Tabs';
