import React, { useState } from "react";
import "./App.css";
import { ExportTab } from "./export-tab";
import { CreateTab } from "./create-tab";

type Tab = {
  name: "Export" | "Create";
  active: boolean;
};

function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { name: "Export", active: true },
    { name: "Create", active: false },
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
            Create: <CreateTab />,
          }[activeTab]
        }
      </section>
    </main>
  );
}

export default App;
