'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoBackBtn } from '~components/auth/GoBackBtn';
import { InputField } from '~components/auth/InputField';
import { ForgotPasswordSchema } from '~validations/AuthSchema';
import bgImage from '../../../../public/bg.webp';
import { verifyEmail } from '~services/shared/authService';
import { UserType } from '~types/auth/UserType';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';
import Button from '~components/shared/Button';

interface ForgotPasswordData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordData>({ email: '' });
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();
  const userType = searchParams.get('mode');

  const handleSubmit = async () => {
    setError('');

    try {
      const error =
        ForgotPasswordSchema.safeParse(formData).error?.issues[0].message;

      if (error) return setError(error);

      const res = await verifyEmail(userType as UserType, formData);

      utterToast.success(res.message);
      router.push(
        `/verify-otp?page=resetPasswordEmailVerify&mode=${userType}&email=${encodeURIComponent(
          formData.email,
        )}`,
      );
    } catch (error) {
      setError(errorHandler(error));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);
    setError(
      ForgotPasswordSchema.safeParse(updatedFormData).error?.issues[0]
        .message ?? '',
    );
  };

  const handleGoBack = () => {
    router.push(`/signin?mode=${userType} `);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <div className="relative flex min-h-screen items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/20 border border-gray-100">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-600">
                Enter your email address and we&apos;ll send you an OTP to reset
                password
              </p>
            </div>

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
                error={error}
                required={false}
              />

              {/* Send Reset Link Button */}
              <Button text="Send OTP" fullWidth={true} onClick={handleSubmit} />
            </form>

            {/* Back to Login Link */}
            <GoBackBtn handleGoBack={handleGoBack} />

            {/* Additional Help Text */}
            <div className="pt-5 border-gray-100">
              <div className="text-center text-sm text-gray-500 space-y-2">
                <p>
                  Didn&apos;t receive the email? Check your spam folder or try
                  again
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
