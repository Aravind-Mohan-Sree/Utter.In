import Image from 'next/image';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-transform duration-300 ease-out">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/utter_logo.png"
            width={100}
            height={100}
            alt="Utter.In Logo"
            className="w-10 h-10 animate-bounce"
          />
          <span className="text-2xl font-semibold text-rose-400">Utter.In</span>
        </div>
      </nav>
    </header>
  );
};
