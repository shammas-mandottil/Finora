
import { useState } from "react";
import Home from "./src/pages/Home";
import Dashboard from "./src/pages/Dashboard";

type Page = "home" | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  if (page === "dashboard") {
    return <Dashboard logout={() => setPage("home")} />;
  }

  return <Home goLogin={() => setPage("dashboard")} />;
}
