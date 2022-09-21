import React, { useEffect, useRef, useState } from "react";
import "./TabContainer.css";
import { ExportTab } from "../export-tab";
import { TemplateTab } from "../template-tab";

type Tab = {
  name: "Export" | "Fill Rule" | "Templates";
  active: boolean;
};

export function TabContainer() {
  const [tabs, setTabs] = useState<Tab[]>([
    { name: "Export", active: true },
    { name: "Fill Rule", active: false },
    { name: "Templates", active: false },
  ]);

  const [activeTab, setActiveTab] = useState<Tab["name"]>("Export");

  const onNavBtnClick = (tab: Tab) => {
    const updatedTabs = [...tabs];
    updatedTabs.forEach((t) => (t.active = tab.name === t.name));
    setTabs(updatedTabs);
    setActiveTab(tab.name);
  };

  return (
    <main>
      <nav>
        {tabs.map((tab) => {
          return (
            <button
              className={tab.active ? "nav active" : "nav"}
              onClick={() => onNavBtnClick(tab)}>
              {tab.name}
            </button>
          );
        })}
      </nav>
      <section>
        {
          {
            Export: <ExportTab />,
            "Fill Rule": <p>Full rule editor</p>,
            Templates: <TemplateTab />,
          }[activeTab]
        }
      </section>
    </main>
  );
}
