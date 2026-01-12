import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ReduxProvider } from 'ReduxProvider';
import Script from 'next/script';
import { Navbar } from '~components/layout/Navbar';
import Footer from '~components/layout/Footer';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Utter',
  description: 'A language sharing platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/assets/lang-config.js" strategy="beforeInteractive" />
        <Script src="/assets/translation.js" strategy="beforeInteractive" />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <div id="google_translate_element"></div>
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
      </body>
    </html>
  );
}
