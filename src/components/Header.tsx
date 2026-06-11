import LanguageSwitcher
from "./LanguageSwitcher";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 border-b border-white/10">
      <Link
        to="/"
        className="text-xl font-bold hover:text-yellow-400 transition"
      >
        OsonTrack Academy
      </Link>

      <LanguageSwitcher />
    </header>
  );
}
