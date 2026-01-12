'use client';

import bgImage from '../../public/bg.webp';

export default function Home() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    ></div>
  );
}
