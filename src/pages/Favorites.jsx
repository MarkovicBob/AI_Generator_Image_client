import React from "react";
import axios from "axios";
import { FiDownload, FiHeart, FiMaximize2, FiShare2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export default function Favorites() {
  const [favorites, setFavorites] = React.useState([]);
  const [fullscreenImage, setFullscreenImage] = React.useState(null);
  const navigate = useNavigate();

  // Učitaj favorite iz backend-a
  React.useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get("http://localhost:3000/images");
        if (Array.isArray(res.data)) {
          const favImages = res.data.filter((img) => img.isFavorite);
          setFavorites(favImages);
        }
      } catch (e) {
        toast.error("Greška pri učitavanju omiljenih slika");
      }
    };
    fetchFavorites();
  }, []);

  // Ukloni iz favorita preko backend-a
  const removeFromFavorites = async (image) => {
    try {
      const imageId = image._id || image.id;
      const response = await axios.post(
        `http://localhost:3000/images/${imageId}/favorite`
      );
      if (response.data.success && !response.data.isFavorite) {
        setFavorites((prev) =>
          prev.filter((fav) => (fav._id || fav.id) !== imageId)
        );
        toast.success("Uklonjeno iz omiljenih");
      } else {
        toast.error("Greška pri uklanjanju iz omiljenih");
      }
    } catch (e) {
      toast.error("Greška pri komunikaciji sa serverom");
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

  if (favorites.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 sm:pb-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-pink-500/10 mb-4">
            <FiHeart className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Nema omiljenih slika
          </h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Kada pronađete slike koje vam se sviđaju, dodajte ih u omiljene
            klikom na ikonicu srca.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 gap-2"
          >
            Kreiraj nove slike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 sm:pb-10">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <FiHeart className="text-pink-500" />
          Omiljene slike ({favorites.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {favorites.map((image) => (
          <div
            key={image._id || image.id}
            className="group relative bg-white/5 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                onClick={() => setFullscreenImage(image)}
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => downloadImage(image.imageUrl, image.prompt)}
                className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                title="Preuzmi sliku"
              >
                <FiDownload className="w-4 h-4" />
              </button>
              <button
                onClick={() => shareImage(image)}
                className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                title="Podeli"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeFromFavorites(image)}
                className="p-2 rounded-lg bg-pink-600/90 hover:bg-pink-700/90 text-white backdrop-blur-sm transition-colors"
                title="Ukloni iz omiljenih"
              >
                <FiHeart className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <p className="text-sm text-gray-300 line-clamp-2">
                {image.prompt}
              </p>
              <p className="text-xs text-gray-400 mt-2">{image.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={() =>
                  downloadImage(
                    fullscreenImage.imageUrl,
                    fullscreenImage.prompt
                  )
                }
                className="p-3 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                title="Preuzmi sliku"
              >
                <FiDownload className="w-5 h-5" />
              </button>
              <button
                onClick={() => shareImage(fullscreenImage)}
                className="p-3 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                title="Podeli"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setFullscreenImage(null)}
                className="p-3 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                title="Zatvori"
              >
                <FiMaximize2 className="w-5 h-5" />
              </button>
            </div>
            <img
              src={fullscreenImage.imageUrl}
              alt={fullscreenImage.prompt}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-xl">
              <p className="font-medium text-sm sm:text-base">
                {fullscreenImage.prompt}
              </p>
              <p className="text-xs text-gray-300 mt-2">
                {fullscreenImage.timestamp}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
