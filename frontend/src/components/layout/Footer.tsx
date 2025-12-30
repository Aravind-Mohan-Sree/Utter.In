import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-white text-rose-400 pt-10 pb-8 border-t border-rose-200">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        {/* Brand Logo and Name */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image
            src="/utter_logo.png"
            alt="utterLogo"
            width={40}
            height={40}
            className="animate-bounce"
          />
          <span className="text-[1.25rem] font-semibold">Utter.In</span>
        </div>

        {/* Description */}
        <p className="text-rose-400 mb-8 pb-7 border-b border-gray-400/30">
          Connecting the world through language learning
        </p>

        {/* Copyright */}
        <div className="text-[#6b7280] text-xs">
          © {new Date().getFullYear()} Utter.In. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
