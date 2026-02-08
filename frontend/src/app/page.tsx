'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Button from '~components/shared/Button';
import { RootState } from '~store/rootReducer';

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role as 'user' | 'tutor';
  const router = useRouter();

  const content = {
    guest: {
      title: 'Master Any Language, Your Way',
      subtitle:
        'Whether you want to learn from native speakers or share your own expertise with the world, Utter is your gateway to global communication.',
      buttonText: 'Join the Community',
    },
    user: {
      title: 'Connect Through Languages',
      subtitle:
        'Practice with native speakers, learn new languages, and build meaningful connections with people from around the world.',
      buttonText: 'Start Learning',
    },
    tutor: {
      title: 'Share Your Knowledge',
      subtitle:
        'Share your native language expertise with eager learners worldwide. Build your teaching career while helping others achieve their language goals.',
      buttonText: 'Start Teaching',
    },
  };

  const { title, subtitle, buttonText } = content[role] || content.guest;

  const handleHeroClick = () => {
    const path =
      role === 'user'
        ? '/tutors'
        : role === 'tutor'
          ? '/create-sessions'
          : '/signin';

    router.push(path);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/hero-bg.webp')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 flex items-center justify-center min-h-screen">
        <div className="max-w-3xl w-full text-center bg-white/10 backdrop-blur-md p-8 md:p-16 rounded-[2rem] border border-white/20 shadow-2xl">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-md">
            {title}
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button text={buttonText} onClick={handleHeroClick} />
          </div>
        </div>
      </section>
    </main>
  );
}
