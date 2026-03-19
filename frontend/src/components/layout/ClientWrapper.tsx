'use client';

import '~utils/lang-config';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';
import { ReduxProvider } from 'ReduxProvider';
import { Toaster } from 'sonner';

import Footer from '~components/layout/Footer';
import { Navbar } from '~components/layout/Navbar';
import CallInvitation from '~components/ui/CallInvitation';
import { SocketProvider } from '~contexts/SocketContext';
import TranslateInit from '~utils/translate-init';

declare global {
  interface Window {
    TranslateInit: () => void;
  }
}

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVideoCall = pathname?.includes('/video-call/');

  useEffect(() => {
    window.TranslateInit = TranslateInit;
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=TranslateInit"
        strategy="afterInteractive"
      />

      <ReduxProvider>
        <SocketProvider>
          {!isVideoCall && <Navbar />}
          {children}
          {!isVideoCall && <Footer />}
          <CallInvitation />
        </SocketProvider>
      </ReduxProvider>

      <Toaster
        toastOptions={{
          style: {
            color: '#FFFFFF',
            background: '#FD637D',
          },
        }}
      />
    </>
  );
}
