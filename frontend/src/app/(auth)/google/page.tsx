'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signIn } from '~features/authSlice';
import { utterToast } from '~utils/utterToast';

const Google = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const name = searchParams.get('name') as string;
  const email = searchParams.get('email') as string;
  const role = searchParams.get('role') as string;
  const dispatch = useDispatch();
  const router = useRouter();
  const responseMessage = searchParams.get('responseMessage');

  useEffect(() => {
    if (responseMessage) {
      utterToast.success(responseMessage);
      dispatch(signIn({ id, name, email, role }));
    }

    router.replace('/');
  }, [dispatch, id, name, email, role, router, responseMessage]);
  return <div>Redirecting...</div>;
};

export default Google;
