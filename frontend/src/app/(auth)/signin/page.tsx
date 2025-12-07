'use client';

import React, { useEffect, useState } from 'react';
import { AuthFooter } from '~components/auth/AuthFooter';
import { Divider } from '~components/auth/Divider';
import { InputField } from '~components/auth/InputField';
import { FormOptions } from '~components/auth/FormOptions';
import { Navbar } from '~components/layout/Navbar';
import { PasswordInput } from '~components/auth/PasswordInput';
import { UserTypeToggle } from '~components/auth/UserTypeToggle';
import { UserType } from '~types/auth/UserType';
import { GoogleAuthButton } from '~components/auth/GoogleAuthButton';
import SignButton from '~components/auth/SignButton';
import { useSearchParams } from 'next/navigation';
import { SigninSchema } from '~validations/AuthSchema';

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
  const mode = searchParams.get('mode');
  const [userType, setUserType] = useState<UserType>(mode as UserType);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [error, setError] = useState(INITIAL_ERROR_STATE);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (() => {
      setFormData(INITIAL_FORM_DATA);
      setError(INITIAL_ERROR_STATE);
    })();
  }, [userType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
      console.log('Sign in data:', formData);
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

  const onGoogleSignIn = () => {};

  const subtitle =
    userType === 'user'
      ? 'Sign in to connect and practice together'
      : 'Sign in to help others learn and grow';

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: `url('/bg.webp')` }}
    >
      {/* Navbar */}
      <Navbar />

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
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                <SignButton text="Sign In" />

                {/* Divider */}
                <Divider text="Or" />

                {/* Google Login Button */}
                <GoogleAuthButton onClick={onGoogleSignIn} />
              </form>
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
