import React from "react";
import { FiX, FiZap } from "react-icons/fi";

export default function QuickPromptsPopup({ isOpen, onClose, onSelectPrompt }) {
  const quickPrompts = [
    "Fantastična planinska scena sa duginim bojama na nebu",
    "Futuristička varoš sa lebdećim automobilima",
    "Mačka astronaut u svemiru, digital art",
    "Apstraktna slika sa živim bojama i geometrijskim oblicima",
    "Mirno jezero u šumi tokom zalaska sunca",
    "Cyberpunk ninja u neonskim ulicama",
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-6 max-w-2xl w-full backdrop-blur-xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FiZap className="text-yellow-400" />
            Brzi predlozi
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectPrompt(prompt);
                onClose();
              }}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-left transition-all duration-200 hover:border-purple-400/50 group"
            >
              <span className="text-sm line-clamp-2 group-hover:text-purple-200">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
