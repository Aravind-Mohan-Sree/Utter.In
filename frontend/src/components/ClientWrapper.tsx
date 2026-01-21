'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { ReduxProvider } from 'ReduxProvider';
import { Toaster } from 'sonner';
import { Navbar } from '~components/layout/Navbar';
import Footer from '~components/layout/Footer';
import TranslateInit from '~utils/translation';
import '~utils/lang-config';

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
        <Navbar />
        {children}
        <Footer />
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
