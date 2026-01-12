'use client';

import React, { useState } from 'react';
import { InputField } from '~components/auth/InputField';
import { PasswordInput } from '~components/auth/PasswordInput';
import { useRouter } from 'next/navigation';
import { SigninSchema } from '~validations/AuthSchema';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import bgImage from '../../../../../public/bg.webp';
import { signin } from '~services/admin/authService';
import { useDispatch } from 'react-redux';
import { signIn } from '~features/authSlice';
import Button from '~components/shared/Button';

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
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [error, setError] = useState(INITIAL_ERROR_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

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
        const res = await signin(formData);
        const data = res.admin;

        dispatch(
          signIn({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          }),
        );
        utterToast.success(res.message);
        router.replace('/admin');
      } catch (error) {
        const message: string = errorHandler(error);

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
                Admin Portal
              </h1>
              <p className="text-gray-600">Sign in to access admin dashboard</p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Login Form */}
              <form className="space-y-6">
                {/* Email Input */}
                <InputField
                  id="email"
                  label="Email Address"
                  type="text"
                  name="email"
                  placeholder="admin@example.com"
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

                {/* Sign In Button */}
                <Button
                  text="Sign In"
                  fullWidth={true}
                  onClick={handleSubmit}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
