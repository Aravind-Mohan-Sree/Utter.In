'use client';

import { useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '~store/rootReducer';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const responseMessage = searchParams.get('responseMessage');

  useLayoutEffect(() => {
    if (responseMessage) {
      return;
    }

    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
      } else {
        router.push('/admin');
      }
    }
  }, [responseMessage, router, user]);

  if (user && !responseMessage) {
    return null;
  }

  return <>{children}</>;
};

export default AuthLayout;
