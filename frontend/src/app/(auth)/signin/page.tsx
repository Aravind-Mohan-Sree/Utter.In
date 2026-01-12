'use client';

import React, { useEffect, useState } from 'react';
import { AuthFooter } from '~components/auth/AuthFooter';
import { Divider } from '~components/auth/Divider';
import { InputField } from '~components/auth/InputField';
import { FormOptions } from '~components/auth/FormOptions';
import { PasswordInput } from '~components/auth/PasswordInput';
import { UserTypeToggle } from '~components/auth/UserTypeToggle';
import { UserType } from '~types/auth/UserType';
import { useRouter, useSearchParams } from 'next/navigation';
import { SigninSchema } from '~validations/AuthSchema';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import bgImage from '../../../../public/bg.webp';
import { signin } from '~services/shared/authService';
import { useDispatch } from 'react-redux';
import { signIn } from '~features/authSlice';
import Button from '~components/shared/Button';
import { FaGoogle } from 'react-icons/fa6';

interface SigninData {
  email: string;
  password: string;
}

const INITIAL_ERROR_STATE = {
  email: '',
  password: '',
};

const INITIAL_FORM_DATA: SigninData = {
  email: '',
  password: '',
};

const SignIn: React.FC = () => {
  const searchParams = useSearchParams();
  const USER_TYPE = searchParams.get('mode');
  const tutorEmail = searchParams.get('email');
  const [userType, setUserType] = useState<UserType>(
    (USER_TYPE as UserType) || 'user',
  );
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [error, setError] = useState(INITIAL_ERROR_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    (() => {
      setFormData(INITIAL_FORM_DATA);
      setError(INITIAL_ERROR_STATE);
      setShowPassword(false);
    })();
  }, [userType]);

  useEffect(() => {
    (() => {
      const responseMessage = searchParams.get('responseMessage');

      if (responseMessage) {
        if (responseMessage.startsWith('Account under verification')) {
          return router.push('/verification-pending');
        } else if (responseMessage.startsWith('Account verification failed')) {
          return router.push(
            `/signup?mode=${userType}&email=${encodeURIComponent(
              tutorEmail as string,
            )}`,
          );
        }

        utterToast.info(responseMessage);
        router.replace('/signin');
      }
    })();
  }, [router, searchParams, userType, tutorEmail]);

  const handleSubmit = async () => {
    const newErrors = SigninSchema.safeParse(formData).error?.issues.reduce<
      Record<string, string>
    >((acc, issue) => {
      const fieldName = issue.path[0];

      if (typeof fieldName === 'string' && fieldName && !acc[fieldName]) {
        acc[fieldName] = issue.message;
      }

      return acc;
    }, {});

    const clearedState = Object.keys(error).reduce<Record<string, string>>(
      (acc, key) => ({ ...acc, [key]: '' }),
      {},
    );

    setError((prev) => ({
      ...prev,
      ...clearedState,
      ...newErrors,
    }));

    if (!newErrors) {
      try {
        const res = await signin(userType, formData);
        const data = res.user ? res.user : res.tutor;

        dispatch(
          signIn({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          }),
        );
        utterToast.success(res.message);
        router.replace('/');
      } catch (error) {
        const message: string = errorHandler(error);

        if (message.startsWith('Account under verification')) {
          return router.push('/verification-pending');
        } else if (message.startsWith('Account verification failed')) {
          return router.push(
            `/signup?mode=${userType}&email=${encodeURIComponent(
              formData.email,
            )}`,
          );
        }

        setError((prev) => ({ ...prev, ['password']: message }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);
    setError((prev) => ({
      ...prev,
      [name]: SigninSchema.safeParse(updatedFormData).error?.issues.find(
        (ele) => ele.path[0] === name,
      )?.message,
    }));
  };

  const onGoogleSignIn = async () => {
    try {
      window.location.href =
        userType === 'user'
          ? process.env.NEXT_PUBLIC_GOOGLE_USER_URL!
          : process.env.NEXT_PUBLIC_GOOGLE_TUTOR_URL!;
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const subtitle =
    userType === 'user'
      ? 'Sign in to connect and practice together'
      : 'Sign in to help others learn and grow';

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      {/* Main Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/20 border border-gray-100">
            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* User Type Toggle */}
              <UserTypeToggle userType={userType} onChange={setUserType} />

              {/* Login Form */}
              <form className="space-y-6">
                {/* Email Input */}
                <InputField
                  id="email"
                  label="Email Address"
                  type="text"
                  name="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={error.email}
                  required={false}
                />

                {/* Password Input */}
                <PasswordInput
                  id="password"
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  showPassword={showPassword}
                  onChange={handleInputChange}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                  error={error.password}
                  required={false}
                />

                {/* Forgot Password */}
                <FormOptions userType={userType} />

                {/* Sign In Button */}
                <Button
                  text="Sign In"
                  fullWidth={true}
                  onClick={handleSubmit}
                />

                {/* Divider */}
                <Divider text="Or" />
              </form>

              {/* Google Login Button */}
              <Button
                text="Continue with Google"
                icon={<FaGoogle />}
                fullWidth={true}
                onClick={onGoogleSignIn}
              />
            </div>

            {/* Footer */}
            <AuthFooter
              text="New here?"
              linkText="Create an account"
              userType={userType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
