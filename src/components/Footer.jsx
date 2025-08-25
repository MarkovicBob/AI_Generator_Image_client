import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-4 sm:py-6 px-4 sm:px-6 bg-gradient-to-r from-purple-900 to-pink-900 text-center text-white text-xs sm:text-sm mt-6 sm:mt-8 rounded-t-xl sm:rounded-t-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>Bob</span>
        <span className="hidden sm:inline">•</span>
        <span>Kontakt: bob@example.com</span>
      </div>
      <div className="text-xs opacity-80 mt-1">
        © {new Date().getFullYear()} Bob. Sva prava zadržana.
      </div>
    </footer>
  );
}
