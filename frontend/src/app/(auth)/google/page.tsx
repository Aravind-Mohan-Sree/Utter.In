'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signIn } from '~features/authSlice';
import { utterToast } from '~utils/utterToast';

const Google = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const email = searchParams.get('email');
  const role = searchParams.get('role');
  const dispatch = useDispatch();
  const router = useRouter();
  const responseMessage = searchParams.get('responseMessage');

  useEffect(() => {
    if (id && name && email && role) {
      dispatch(signIn({ id, name, email, role }));
    }

    if (responseMessage) utterToast.success(responseMessage);

    router.replace('/');
  }, [dispatch, email, id, name, role, router, responseMessage]);
  return <div>Redirecting...</div>;
};

export default Google;
