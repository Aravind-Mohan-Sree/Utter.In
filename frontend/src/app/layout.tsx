import { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import ClientWrapper from '~components/ClientWrapper';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Utter',
  description: `Practice with native speakers, learn new languages, and build
meaningful connections with people from around the world.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
