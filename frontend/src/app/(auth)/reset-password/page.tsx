'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordInput } from '~components/auth/PasswordInput';
import { ResetPasswordSchema } from '~validations/AuthSchema';
import bgImage from '../../../../public/bg.webp';
import { GoBackBtn } from '~components/auth/GoBackBtn';
import { resetPassword } from '~services/shared/authService';
import { UserType } from '~types/auth/UserType';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';
import Button from '~components/shared/Button';

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('mode');
  const [formData, setFormData] = useState<ResetPasswordData>({
    password: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async () => {
    const newErrors = ResetPasswordSchema.safeParse(
      formData,
    ).error?.issues.reduce<Record<string, string>>((acc, issue) => {
      const fieldName = issue.path[0];

      if (typeof fieldName === 'string' && fieldName && !acc[fieldName]) {
        acc[fieldName] = issue.message;
      }

      return acc;
    }, {});

    const clearedState = Object.keys(errors).reduce<Record<string, string>>(
      (acc, key) => ({ ...acc, [key]: '' }),
      {},
    );

    setErrors((prev) => ({
      ...prev,
      ...clearedState,
      ...newErrors,
    }));

    if (!newErrors) {
      try {
        const res = await resetPassword(userType as UserType, formData);

        utterToast.success(res.message);
      } catch (error) {
        utterToast.error(errorHandler(error));
      } finally {
        router.replace(`/signin?mode=${userType}`);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);
    setErrors((prev) => ({
      ...prev,
      [name]: ResetPasswordSchema.safeParse(updatedFormData).error?.issues.find(
        (ele) => ele.path[0] === name,
      )?.message,
    }));
  };

  const handleGoBack = () => {
    router.push('/signin');
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
                Reset Password
              </h1>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            <form className="space-y-6">
              {/* New Password Input */}
              <PasswordInput
                id="new-password"
                label="New Password"
                name="password"
                placeholder="Enter your new password"
                value={formData.password}
                showPassword={showNewPassword}
                onChange={handleInputChange}
                onToggleShowPassword={() =>
                  setShowNewPassword(!showNewPassword)
                }
                error={errors.password!}
                required={false}
              />

              {/* Confirm Password Input */}
              <PasswordInput
                id="confirm-password"
                label="Confirm New Password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                showPassword={showConfirmPassword}
                onChange={handleInputChange}
                onToggleShowPassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                error={errors.confirmPassword!}
                required={false}
              />

              {/* Reset Password Button */}
              <Button text="Reset" fullWidth={true} onClick={handleSubmit} />
            </form>

            {/* Go back */}
            <GoBackBtn handleGoBack={handleGoBack} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
