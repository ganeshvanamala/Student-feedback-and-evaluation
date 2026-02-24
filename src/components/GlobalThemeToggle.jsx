import React, { useEffect, useState } from "react";

const THEME_EVENT = "site-theme-change";

function GlobalThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("homeTheme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event?.detail === "light" || event?.detail === "dark") {
        setTheme(event.detail);
      } else {
        setTheme(localStorage.getItem("homeTheme") || "light");
      }
    };

    const handleStorage = (event) => {
      if (event.key === "homeTheme") {
        setTheme(event.newValue || "light");
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("homeTheme", nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }));
  };

  return (
    <button className="global-theme-toggle" onClick={toggleTheme}>
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}

export default GlobalThemeToggle;
