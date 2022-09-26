import React from "react";
import "./App.css";
import { SymbolContextProvider } from "./context/SymbolProvider";
import { TabContainer } from "./components/tab-container";

function App() {
  return (
    <SymbolContextProvider>
      <TabContainer />
    </SymbolContextProvider>
  );
}

export default App;
