import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Target, Trophy } from "lucide-react";
import { cn } from "../../../utils/cn";

type CommunityTab = "feed" | "challenges" | "ranking";

interface CommunityTabsProps {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
}

const TABS = [
  { id: "feed" as const, label: "Feed", icon: <TrendingUp size={16} /> },
  { id: "challenges" as const, label: "Desafios", icon: <Target size={16} /> },
  { id: "ranking" as const, label: "Ranking", icon: <Trophy size={16} /> },
];

export const CommunityTabs: React.FC<CommunityTabsProps> = ({ activeTab, onTabChange }) => (
  <div className="flex border-b border-white/5 bg-dark-surface/30">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={cn(
          "flex-1 py-4 flex flex-col items-center gap-1 transition-all relative",
          activeTab === tab.id ? "text-brand-red" : "text-white/40 hover:text-white/60",
        )}
      >
        {tab.icon}
        <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
        {activeTab === tab.id && (
          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red" />
        )}
      </button>
    ))}
  </div>
);
