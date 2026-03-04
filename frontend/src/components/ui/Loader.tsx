import Image from 'next/image';
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden outline-none focus:outline-none">
      <div
        className="fixed inset-0 bg-rose-100/30 backdrop-blur-md pointer-events-auto"
        aria-hidden="true"
      ></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-[150px] lg:h-[150px]">
          <Image
            src="/utter_logo.png"
            alt="utterLogo"
            fill
            className="object-contain animate-bounce"
            priority
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 150px"
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
