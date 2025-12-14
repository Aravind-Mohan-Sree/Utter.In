'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signin } from '~features/authSlice';
import { utterToast } from '~utils/utterToast';

const Google = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const name = searchParams.get('name') as string;
  const email = searchParams.get('email') as string;
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(signin({ id, name, email }));
    utterToast.success('Signin successful');
    router.replace('/');
  }, [dispatch, id, name, email, router]);
  return <div>Redirecting...</div>;
};

export default Google;
