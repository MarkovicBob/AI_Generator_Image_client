import "react-toastify/dist/ReactToastify.css";
import "../App.css";
import Footer from "../components/Footer";
import QuickPromptsPopup from "../components/QuickPromptsPopup";
import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import {
  FiDownload,
  FiImage,
  FiLoader,
  FiSettings,
  FiZap,
  FiHeart,
  FiShare2,
  FiMaximize2,
  FiX,
  FiCoffee,
} from "react-icons/fi";

function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/images");
        if (Array.isArray(res.data)) {
          const images = res.data.reverse(); // newest first
          setImageHistory(images);

          // Extract favorites from the loaded images
          const favImages = images.filter((img) => img.isFavorite);
          setFavorites(favImages);
        }
      } catch (e) {
        console.warn("Could not load images from backend", e.message);
        // Fallback to localStorage for favorites
        try {
          const stored = localStorage.getItem("favorites");
          if (stored) setFavorites(JSON.parse(stored));
        } catch (err) {
          console.warn("Could not read favorites from localStorage", err);
        }
      }
    };
    loadData();
  }, []);

  const [keepPrompt, setKeepPrompt] = useState(false); // opcija da zadrži stari prompt

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Molim unesite opis slike");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/generate-image",
        {
          prompt: prompt.trim(),
          size,
          quality,
        }
      );

      const newImage = {
        ...response.data,
        id: response.data.id || Date.now(),
        timestamp: new Date().toLocaleString(),
      };

      setGeneratedImage(newImage);
      setImageHistory((prev) => [newImage, ...prev.slice(0, 19)]);
      toast.success("Slika je uspešno generirana!");

      if (!keepPrompt) {
        setPrompt("");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "Greška pri generiranju slike: " +
          (error.response?.data?.details || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (imageUrl, prompt) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-image-${prompt
        .substring(0, 30)
        .replace(/[^a-z0-9]/gi, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Slika je preuzeta!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Greška pri preuzimanju slike");
    }
  };

  const toggleFavorite = async (image) => {
    try {
      const imageId = image._id || image.id;
      const response = await axios.post(
        `http://localhost:3000/images/${imageId}/favorite`
      );

      if (response.data.success) {
        // Update local favorites state
        setFavorites((prev) => {
          const isFavorite = response.data.isFavorite;
          if (isFavorite) {
            toast.success("Dodato u omiljene!");
            // Add to favorites if not already there
            const exists = prev.some((fav) => (fav._id || fav.id) === imageId);
            return exists ? prev : [...prev, { ...image, isFavorite: true }];
          } else {
            toast.info("Uklonjeno iz omiljenih");
            return prev.filter((fav) => (fav._id || fav.id) !== imageId);
          }
        });

        // Update image history state to reflect favorite status
        setImageHistory((prev) =>
          prev.map((img) =>
            (img._id || img.id) === imageId
              ? { ...img, isFavorite: response.data.isFavorite }
              : img
          )
        );

        // Update generated image if it matches
        if (
          generatedImage &&
          (generatedImage._id || generatedImage.id) === imageId
        ) {
          setGeneratedImage({
            ...generatedImage,
            isFavorite: response.data.isFavorite,
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Greška pri promeni omiljenih");
    }
  };

  const shareImage = async (image) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Image",
          text: `Pogledajte ovu AI generiranu sliku: "${image.prompt}"`,
          url: image.imageUrl,
        });
      } catch (error) {
        console.log("Sharing failed:", error);
        copyToClipboard(image.imageUrl);
      }
    } else {
      copyToClipboard(image.imageUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link kopiran u clipboard!");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Main container (offset for fixed header) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-10 flex-1">
        {/* Quick Prompts Button */}
        <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8 flex justify-center">
          <button
            onClick={() => setShowQuickPrompts(true)}
            className="group px-5 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-3"
          >
            <FiCoffee className="text-xl text-purple-400 group-hover:text-purple-300" />
            <span className="text-white/90 group-hover:text-white">
              Inspiracija za promptove
            </span>
          </button>
        </div>

        {/* Quick Prompts Popup */}
        <QuickPromptsPopup
          isOpen={showQuickPrompts}
          onClose={() => setShowQuickPrompts(false)}
          onSelectPrompt={(selectedPrompt) => setPrompt(selectedPrompt)}
        />

        {/* Main Input Card */}
        <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
            <div className="space-y-4 sm:space-y-6">
              {/* Prompt Input */}
              <div>
                <div className="flex flex-row justify-between items-center">
                  <label className="flex flex-row text-white text-base sm:text-lg font-semibold mb-2 sm:mb-3 items-center gap-2">
                    <FiImage className="text-blue-400" />
                    Opišite vašu viziju:
                  </label>

                  {/* Settings Toggle + Keep prompt toggle */}
                  <div className="flex items-center justify-between gap-4 flex-wrap py-3">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <FiSettings className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Advanced Settings */}
                {showSettings && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-white text-sm font-medium mb-3">
                        Veličina slike:
                      </label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        disabled={isLoading}
                      >
                        <option className="text-black/50" value="1024x1024">
                          Kvadrat (1024×1024)
                        </option>
                        <option className="text-black/50" value="1024x1792">
                          Portret (1024×1792)
                        </option>
                        <option className="text-black/50" value="1792x1024">
                          Pejzaž (1792×1024)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-3">
                        Kvalitet:
                      </label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={isLoading}
                      >
                        <option className="text-black/50" value="standard">
                          Standardni
                        </option>
                        <option className="text-black/50" value="hd">
                          HD (premium)
                        </option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TEXTAREA */}
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Unesite detaljan opis slike koju želite... Budite kreativni!"
                  className="w-full p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-white/10 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-sm sm:text-base lg:text-lg transition-all duration-200"
                  rows="4"
                  disabled={isLoading}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateImage}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 sm:py-4 lg:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 disabled:cursor-not-allowed text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin text-lg sm:text-xl" />
                    <span className="hidden sm:inline">Kreiram magiju...</span>
                    <span className="sm:hidden">Kreiram...</span>
                  </>
                ) : (
                  <>
                    <FiZap className="text-lg sm:text-xl" />
                    <span>Generiraj sliku</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <FiImage className="text-purple-400" />
                  Generirana slika
                </h2>
                <button
                  onClick={() => {
                    setGeneratedImage(null);
                    setPrompt("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-white text-sm sm:text-base transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
                >
                  <FiX className="text-lg sm:text-xl" />
                  <span className="hidden sm:inline">Povratak na početnu</span>
                  <span className="sm:hidden">Nazad</span>
                </button>
              </div>
              <div className="space-y-6">
                <div className="relative group overflow-hidden rounded-2xl">
                  <img
                    src={generatedImage.imageUrl}
                    alt={generatedImage.prompt}
                    className="w-full rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setFullscreenImage(generatedImage)}
                  />

                  {/* Image overlay controls - always visible on mobile, hover on desktop */}
                  <div className="absolute inset-0 bg-black/50 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={() =>
                        downloadImage(
                          generatedImage.imageUrl,
                          generatedImage.prompt
                        )
                      }
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition-all transform hover:scale-110"
                      title="Preuzmi sliku"
                    >
                      <FiDownload className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(generatedImage)}
                      className={`backdrop-blur-sm text-white p-3 rounded-xl transition-all transform hover:scale-110 ${
                        generatedImage.isFavorite
                          ? "bg-blue-500/80 hover:bg-blue-600/80"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                      title={
                        generatedImage.isFavorite
                          ? "Ukloni iz omiljenih"
                          : "Dodaj u omiljene"
                      }
                    >
                      <FiHeart
                        className={`w-6 h-6 ${
                          generatedImage.isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => shareImage(generatedImage)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition-all transform hover:scale-110"
                      title="Podeli sliku"
                    >
                      <FiShare2 className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setFullscreenImage(generatedImage)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition-all transform hover:scale-110"
                      title="Fullscreen"
                    >
                      <FiMaximize2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-white/5 rounded-2xl">
                  <div>
                    <span className="text-purple-400 font-semibold text-lg">
                      Vaš prompt:{" "}
                    </span>
                    <p className="text-white mt-1">{generatedImage.prompt}</p>
                  </div>
                  {generatedImage.revisedPrompt &&
                    generatedImage.revisedPrompt !== generatedImage.prompt && (
                      <div>
                        <span className="text-pink-400 font-semibold">
                          AI poboljšan prompt:{" "}
                        </span>
                        <p className="text-gray-300 text-sm mt-1">
                          {generatedImage.revisedPrompt}
                        </p>
                      </div>
                    )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>📅 {generatedImage.timestamp}</span>
                    <span>📐 {size}</span>
                    <span>⚡ {quality.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section
        {favorites.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <FiHeart className="text-red-400" />
                Omiljene slike ({favorites.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((image) => (
                  <div
                    key={`fav-${image._id || image.id}`}
                    className="relative group"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-48 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg"
                      onClick={() => setGeneratedImage(image)}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(image);
                        }}
                        className="bg-red-500/80 hover:bg-red-600/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
                        title="Ukloni iz omiljenih"
                      >
                        <FiHeart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 rounded-b-xl">
                      <p className="text-xs truncate font-medium">
                        {image.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        {/* Image History */}
        {imageHistory.length > 1 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <FiImage className="text-blue-400" />
                Prethodne slike ({imageHistory.length - 1})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {imageHistory.slice(1).map((image) => (
                  <div key={image._id || image.id} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-48 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg"
                      onClick={() => setGeneratedImage(image)}
                    />
                    {/* Favorite indicator */}
                    {image.isFavorite && (
                      <div className="absolute top-2 right-2">
                        <div className="p-1.5 rounded-full bg-blue-500/90 backdrop-blur-sm">
                          <FiHeart className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`absolute top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        image.isFavorite ? "left-2" : "right-2"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image.imageUrl, image.prompt);
                        }}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
                        title="Preuzmi sliku"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(image);
                        }}
                        className={`text-white p-2 rounded-lg backdrop-blur-sm transition-all ${
                          image.isFavorite
                            ? "bg-blue-500/80 hover:bg-blue-600/80"
                            : "bg-black/50 hover:bg-black/70"
                        }`}
                        title={
                          image.isFavorite
                            ? "Ukloni iz omiljenih"
                            : "Dodaj u omiljene"
                        }
                      >
                        <FiHeart
                          className={`w-4 h-4 ${
                            image.isFavorite ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 rounded-b-xl">
                      <p className="text-xs truncate font-medium">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {image.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full">
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-xl backdrop-blur-sm transition-all z-10"
              >
                <FiX className="w-6 h-6" />
              </button>
              <img
                src={fullscreenImage.imageUrl}
                alt={fullscreenImage.prompt}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-xl">
                <p className="font-medium">{fullscreenImage.prompt}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                  <span>📅 {fullscreenImage.timestamp}</span>
                  <button
                    onClick={() =>
                      downloadImage(
                        fullscreenImage.imageUrl,
                        fullscreenImage.prompt
                      )
                    }
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    Preuzmi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="mt-16"
      />
    </div>
  );
}

export default Home;
