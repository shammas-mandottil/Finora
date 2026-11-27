
import { useState } from "react";
import Home from "./src/pages/Home";
import Login from "./src/pages/Login";
import Dashboard from "./src/pages/Dashboard";

export default function App() {
  const [page, setPage] = useState<
    "home" | "login" | "dashboard"
  >("home");

  if (page === "login") {
    return (
      <Login
        onSuccess={() => setPage("dashboard")}
        goHome={() => setPage("home")}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <Dashboard
        logout={() => setPage("home")}
      />
    );
  }

  return (
    <Home
      goLogin={() => setPage("login")}
    />
  );
}

