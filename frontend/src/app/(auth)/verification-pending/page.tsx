'use client';

import { useRouter } from 'next/navigation';
import { FaCircleCheck } from 'react-icons/fa6';
import Button from '~components/shared/Button';
import { FiArrowLeft } from 'react-icons/fi';

const VerificationPending: React.FC = () => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <div className="relative flex min-h-screen items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/20 border border-gray-100">
            {/* Verification Content */}
            <div className="text-center px-2 sm:px-4">
              {/* Animated Icon */}
              <FaCircleCheck className="size-20 mx-auto mb-6 text-rose-400 animate-pulse bg-white rounded-full" />

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                Verification in Progress
              </h1>

              {/* Message */}
              <div className="space-y-4 mb-8">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Thank you for registering as a tutor! Your account is
                  currently under verification.
                </p>

                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
                  <p className="text-rose-600 font-semibold text-sm sm:text-base">
                    You can login once verification is done within 24 hours.
                  </p>
                </div>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  We&apos;ll notify you via email once your account verification
                  is complete.
                </p>
              </div>

              {/* Login Button */}
              <Button
                variant="outline"
                size={0}
                fontSize={14}
                icon={<FiArrowLeft />}
                text="Go Back"
                className="text-gray-700! hover:text-black! transition-colors mx-auto mt-4"
                onClick={() => router.push('/signin?mode=tutor')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
