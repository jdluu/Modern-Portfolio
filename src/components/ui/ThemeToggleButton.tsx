import React, { useState, useEffect, useRef } from "react";
import { toggleTheme } from "../../lib/theme-toggle";

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeToggleButton = () => {
  const [isDarkMode, setDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    const darkModeSaved = localStorage.getItem("darkmode");
    if (darkModeSaved === null) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
      localStorage.setItem("darkmode", JSON.stringify(prefersDark));
    } else {
      setDarkMode(JSON.parse(darkModeSaved));
    }
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isDarkMode === null) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    } else {
      toggleTheme();
    }
  }, [isDarkMode]);

  const [isAnimated, setAnimated] = useState(false);

  const handleToggle = () => {
    setDarkMode(!isDarkMode);
    setAnimated(true);
    setTimeout(() => setAnimated(false), 500);
  };

  if (isDarkMode === null) {
    return <div className="w-[3.5rem] h-[2.5rem]" />;
  }

  return (
    <div
      className="btn relative w-[6.5rem] h-[3rem] rounded-full p-[0.25rem] shadow-inner flex items-center cursor-pointer bg-white
		    dark:shadow-[inset_0_8px_60px_rgba(0,0,0,.3),_inset_8px_0_8px_rgba(0,0,0,.3),_inset_0_-4px_4px_rgba(0,0,0,.3)]"
      onClick={handleToggle}
    >
      <div
        className={`btn__indicator w-[2.5rem] h-[2.5rem] rounded-full absolute shadow-md transform transition-transform duration-500 ease-in-out
        ${
          isDarkMode
            ? "translate-x-[3.2rem] bg-gray-800"
            : "translate-x-0 bg-white"
        }`}
      >
        <div className="btn__icon-container w-full h-full flex justify-center items-center">
          {isDarkMode ? (
            <MoonIcon
              className={`btn__icon text-white text-lg ${
                isAnimated ? "animate-spin" : ""
              }`}
            />
          ) : (
            <SunIcon
              className={`btn__icon text-yellow-500 text-lg ${
                isAnimated ? "animate-spin" : ""
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggleButton;
