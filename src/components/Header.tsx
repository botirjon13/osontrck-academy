import LanguageSwitcher
from "./LanguageSwitcher";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 border-b border-white/10">
      <h1 className="text-xl font-bold">
        OsonTrack Academy
      </h1>

      <LanguageSwitcher />
    </header>
  );
}
