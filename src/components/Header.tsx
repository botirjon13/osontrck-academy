import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 border-b border-white/10">
      <Link
        to="/"
        className="flex items-center gap-2 text-xl font-bold transition hover:text-yellow-400"
      >
        <img
          src="/images/osontrack-certificate-emblem.png"
          alt=""
          aria-hidden="true"
          className="h-7 w-8 object-contain"
        />
        OsonTrack Academy
      </Link>

      <LanguageSwitcher />
    </header>
  );
}
