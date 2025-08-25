import React from "react";
import { FiHeart, FiImage, FiMenu, FiX, FiZap } from "react-icons/fi";
import { useLocation } from "react-router";

export default function Header({ onHomeClick }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigation = [
    { name: "Generator", path: "/", icon: FiImage },
    { name: "Omiljene", path: "/favorites", icon: FiHeart },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-purple-700/90 to-pink-700/90 backdrop-blur-md shadow-xl">
      <div className="max-w-7xl mx-auto">
        <div className="py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2 sm:gap-3 text-white font-bold text-lg sm:text-xl"
            title="Povratak na početnu"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg transition-transform hover:scale-105">
              <FiZap className="text-white text-xl sm:text-2xl" />
            </div>
            <span>AI Image Generator</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onHomeClick(item.path);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="sm:hidden py-2 px-2 border-t border-white/10">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onHomeClick(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 last:mb-0 ${
                    isActive(item.path)
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
