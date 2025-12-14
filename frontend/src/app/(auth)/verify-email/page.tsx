'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '~components/layout/Navbar';
import { SubmitButton } from '~components/auth/SubmitButton';
import {
  resendOtp,
  forgotPasswordOtpVerify,
  verifyOtp,
} from '~services/user/authService';
import { UserType } from '~types/auth/UserType';
import { errorHandler } from '~utils/errorHandler';
import { GoBackBtn } from '~components/auth/GoBackBtn';
import { utterToast } from '~utils/utterToast';
import bgImage from '../../../../public/bg.webp';
import { getCookie } from '~utils/getCookie';

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const userType = searchParams.get('mode');
  const email = searchParams.get('email');

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    (async () => {
      const now = new Date().getTime();
      const cookie = await getCookie('otp');
      const then = parseInt(cookie?.value as string);
      const coolDownSec = 60;
      const timeDifferenceSec = Math.round((now - then) / 1000);

      if (timeDifferenceSec < coolDownSec) {
        setTimer(coolDownSec - timeDifferenceSec);
      } else {
        setTimer(0);
      }
    })();
  }, []);

  const handleGoBack = () => {
    router.push(`/signin?mode=${userType} `);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow only numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    if (!newOtp.includes('')) setError('');
    else setError('Please enter 6 digits');
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Move to previous input on backspace
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    // Move to next input on arrow right or previous on arrow left
    if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (!/^\d{6}$/.test(pastedData)) return;

    const pastedDigits = pastedData.split('');
    const newOtp = [...otp];

    // Fill OTP fields with pasted digits
    for (let i = 0; i < Math.min(6, pastedDigits.length); i++) {
      newOtp[i] = pastedDigits[i];
    }

    setOtp(newOtp);

    // Focus on the last input
    const lastFilledIndex = Math.min(5, pastedDigits.length - 1);
    if (inputRefs.current[lastFilledIndex]) {
      inputRefs.current[lastFilledIndex]?.focus();
    }

    if (!newOtp.includes('')) setError('');
    else setError('Please enter 6 digits');
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);

    try {
      const res = await resendOtp(userType as UserType, { email });

      utterToast.success(res.message);

      setTimer(60);
      setCanResend(false);
    } catch (error) {
      utterToast.error(errorHandler(error));

      if (errorHandler(error).startsWith('OTP expired'))
        router.push(`/signin?mode=${userType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      return setError('Please enter 6 digits');
    }

    setIsLoading(true);

    try {
      let res;

      if (page) {
        res = await forgotPasswordOtpVerify(userType as UserType, {
          email,
          otp: otpCode,
        });
      } else {
        res = await verifyOtp(userType as UserType, { email, otp: otpCode });
      }

      utterToast.success(res.message);

      if (page) {
        router.push(`/reset-password?mode=${userType} `);
      } else {
        router.push(`/signin?mode=${userType} `);
      }
    } catch (error) {
      utterToast.error(errorHandler(error));

      if (errorHandler(error).startsWith('OTP expired'))
        router.push(`/signin?mode=${userType}`);

      setOtp(['', '', '', '', '', '']);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <Navbar />

      <div className="relative flex min-h-screen items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/20 border border-gray-100">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Verify Your Email
              </h1>
              <p className="text-gray-600">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* OTP Input Fields */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-rose-400 transition-all duration-300 bg-gray-50/50 text-gray-700"
                      required={false}
                      autoComplete="off"
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {error && (
                  <span className="text-sm text-red-500 wrap-break-word">
                    {error}
                  </span>
                )}
              </div>

              {/* Timer and Resend */}
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  {!canResend ? (
                    <p className="p-0.5 text-sm text-gray-600">
                      Resend code in{' '}
                      <span className="font-semibold text-rose-500">
                        {timer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={!canResend || isLoading}
                      className={`text-sm font-medium rounded-lg transition-all duration-300 ${
                        canResend && !isLoading
                          ? 'text-rose-500 hover:text-rose-700 cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </div>
              </div>

              {/* Verify Button */}
              <SubmitButton text="Verify Code" isLoading={isLoading} />
            </form>

            {/* Go back */}
            <GoBackBtn handleGoBack={handleGoBack} />

            {/* Help Text */}
            <div className="pt-5 text-center text-sm text-gray-500">
              <p>
                Didn&apos;t receive the code? Check your spam folder or request
                a new one
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
