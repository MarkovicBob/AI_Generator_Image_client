import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full py-4 sm:py-6 px-4 sm:px-6 bg-gradient-to-r from-purple-900 to-blue-900 text-center text-white text-xs sm:text-sm">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <a
          href="https://github.com/MarkovicBob"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-3xl text-white rounded-lg"
        >
          <FaGithub />
        </a>
      </div>
      <div className="text-xs opacity-80 mt-1">
        © {new Date().getFullYear()} Bob. All right reserved.
      </div>
    </footer>
  );
}
