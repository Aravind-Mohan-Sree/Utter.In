import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ReduxProvider } from 'ReduxProvider';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Utter.In',
  description: 'A language sharing platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ReduxProvider>{children}</ReduxProvider>
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
