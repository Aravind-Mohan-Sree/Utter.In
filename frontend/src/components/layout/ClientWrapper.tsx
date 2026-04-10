'use client';

import { usePathname } from 'next/navigation';
import { ReduxProvider } from 'ReduxProvider';
import { Toaster } from 'sonner';

import Footer from '~components/layout/Footer';
import { Navbar } from '~components/layout/Navbar';
import CallInvitation from '~components/ui/CallInvitation';
import { SocketProvider } from '~contexts/SocketContext';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVideoCall = pathname?.includes('/video-call/');

  return (
    <>
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
