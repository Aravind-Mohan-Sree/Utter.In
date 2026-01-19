'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaFileVideo, FaRegFilePdf } from 'react-icons/fa6';
import { AuthFooter } from '~components/auth/AuthFooter';
import { FileUpload } from '~components/auth/FileUpload';
import { InputField } from '~components/auth/InputField';
import { LanguagesInput } from '~components/auth/LanguagesInput';
import { PasswordInput } from '~components/auth/PasswordInput';
import { UserTypeToggle } from '~components/auth/UserTypeToggle';
import { finishSignup, register } from '~services/shared/authService';
import { UserType } from '~types/auth/UserType';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import {
  TutorFinishSignupSchema,
  TutorSignupSchema,
  UserFinishSignupSchema,
  UserSignupSchema,
} from '~validations/AuthSchema';
import bgImage from '../../../../public/bg.webp';
import { validateVideoDuration } from '~validations/validateVideoDuration';
import { ExperienceSelector } from '~components/auth/ExperienceSelector';
import Button from '~components/shared/Button';
import { Divider } from '~components/auth/Divider';
import { FaGoogle } from 'react-icons/fa';
import { useSubmitForm } from '~hooks/useSubmitForm';
import { FiArrowLeft } from 'react-icons/fi';
import { utterAlert } from '~utils/utterAlert';

type ExperienceLevel = '0-1' | '1-2' | '2-3' | '3-5' | '5-10' | '10+' | '';

interface SignUpData {
  name: string;
  email: string;
  languages: string[];
  experience: ExperienceLevel;
  password: string;
  confirmPassword: string;
  introVideo?: File | null;
  certificate?: File | null;
}

const INITIAL_ERROR_STATE = {
  name: '',
  email: '',
  languages: '',
  experience: '',
  password: '',
  confirmPassword: '',
  introVideo: '',
  certificate: '',
};

const INITIAL_FORM_DATA: SignUpData = {
  name: '',
  email: '',
  languages: [],
  experience: '',
  password: '',
  confirmPassword: '',
  introVideo: null,
  certificate: null,
};

const SignUp: React.FC = () => {
  const searchParams = useSearchParams();
  const USER_TYPE = searchParams.get('mode');
  const responseMessage = searchParams.get('responseMessage');
  const [userType, setUserType] = useState<UserType>(
    (USER_TYPE as UserType) || 'user',
  );
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [error, setError] = useState(INITIAL_ERROR_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fileName1, setFileName1] = useState<string>('');
  const [fileName2, setFileName2] = useState<string>('');
  const validationSchema =
    userType === 'user' ? UserSignupSchema : TutorSignupSchema;
  const finishSignupValidationSchema =
    userType === 'user' ? UserFinishSignupSchema : TutorFinishSignupSchema;
  const { handleSubmission } = useSubmitForm(
    userType,
    formData,
    error,
    setError,
  );
  const router = useRouter();

  useEffect(() => {
    (() => {
      setFileName1('');
      setFileName2('');
      setFormData(INITIAL_FORM_DATA);
      setError(INITIAL_ERROR_STATE);
      setShowPassword(false);
      setShowConfirmPassword(false);

      const responseMessage = searchParams.get('responseMessage');
      const rejectionReason = searchParams.get('rejectionReason');
      const email = searchParams.get('email') as string;

      if (responseMessage === 'finishSignup') {
        setFormData((prev) => ({ ...prev, email }));
      } else if (rejectionReason) {
        window.history.replaceState(null, '', `/signup?mode=${userType}`);

        utterAlert({
          icon: 'info',
          title: 'Account verification failed',
          text: `Reason: ${rejectionReason}`,
          footer: 'Please sign up again',
          confirmText: 'Okay',
        });
      }
    })();
  }, [searchParams, userType, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);
    setError((prev) => ({
      ...prev,
      [name]: validationSchema
        .safeParse(updatedFormData)
        .error?.issues.find((ele) => ele.path[0] === name)?.message,
    }));
  };

  const handleLanguagesChange = (languages: string[]) => {
    const updatedFormData = { ...formData, languages };
    setFormData((prev) => ({ ...prev, languages }));
    setError((prev) => ({
      ...prev,
      ['languages']:
        validationSchema
          .safeParse(updatedFormData)
          .error?.issues.find((ele) => ele.path[0] === 'languages')?.message ??
        '',
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (!files) return;

    const updatedFormData = { ...formData, [name]: files[0] };

    setFormData(updatedFormData);
    setError((prev) => ({
      ...prev,
      [name]: validationSchema
        .safeParse(updatedFormData)
        .error?.issues.find((ele) => ele.path[0] === name)?.message,
    }));

    if (files[0]) {
      const file = files[0];

      if (file.type.startsWith('video/')) {
        const isValid = await validateVideoDuration(file, 31); // limit = 30 seconds

        if (!isValid) {
          setError((prev) => ({
            ...prev,
            ['introVideo']: 'Video must be 30 seconds or less',
          }));
        }
      }
    }
  };

  const handleGoBack = () => {
    router.push(`/signup?mode=${userType}`);
  };

  const onSignup = async () => {
    await handleSubmission(
      validationSchema,
      register,
      `/verify-otp?mode=${userType}&email=${encodeURIComponent(
        formData.email,
      )}`,
    );
  };

  const onGoogleSignUp = async () => {
    try {
      window.location.href =
        userType === 'user'
          ? process.env.NEXT_PUBLIC_GOOGLE_USER_URL!
          : process.env.NEXT_PUBLIC_GOOGLE_TUTOR_URL!;
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const onFinishSignup = async () => {
    await handleSubmission(
      finishSignupValidationSchema,
      finishSignup,
      userType === 'user' ? `/` : '/verification-pending',
    );
  };

  const subtitle =
    responseMessage === 'finishSignup'
      ? 'Fill in the missing pieces to join our community'
      : userType === 'user'
        ? 'Create your account to start learning'
        : 'Create your tutor account to help others learn';

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-50 to-purple-50 bg-fixed"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <div className="relative flex min-h-screen items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/20 border border-gray-100">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {responseMessage !== 'finishSignup'
                  ? 'Join Utter.In'
                  : 'Finish Sign Up'}
              </h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            <div className="space-y-6">
              {responseMessage !== 'finishSignup' && (
                <UserTypeToggle userType={userType} onChange={setUserType} />
              )}

              <form className="space-y-6">
                {/* Name Input */}
                {responseMessage !== 'finishSignup' && (
                  <>
                    <InputField
                      id="name"
                      label="Full Name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={error.name}
                      required={false}
                    />

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
                  </>
                )}

                {/* Languages Input */}
                <LanguagesInput
                  languages={formData.languages}
                  onLanguagesChange={handleLanguagesChange}
                  maxLanguages={3}
                  error={error.languages}
                />

                {/* Experience Field (Tutor only) */}
                {userType === 'tutor' && (
                  <ExperienceSelector
                    id="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    error={error.experience}
                  />
                )}

                {/* Tutor-specific fields */}
                {userType === 'tutor' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Intro Video Upload */}
                      <FileUpload
                        id="intro-video"
                        label="Intro Video (Max 30 sec)"
                        name="introVideo"
                        filename={fileName1}
                        setFilename={setFileName1}
                        accept=".mp4"
                        onChange={handleFileChange}
                        error={error.introVideo}
                        Icon={FaFileVideo}
                      />

                      {/* Certificates Upload */}
                      <FileUpload
                        id="certificates"
                        label="Certificate (PDF)"
                        name="certificate"
                        filename={fileName2}
                        setFilename={setFileName2}
                        accept=".pdf"
                        onChange={handleFileChange}
                        error={error.certificate}
                        Icon={FaRegFilePdf}
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                {responseMessage !== 'finishSignup' && (
                  <>
                    <PasswordInput
                      id="password"
                      label="Password"
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      showPassword={showPassword}
                      onChange={handleInputChange}
                      onToggleShowPassword={() =>
                        setShowPassword(!showPassword)
                      }
                      error={error.password}
                      required={false}
                    />

                    {/* Confirm Password Input */}
                    <PasswordInput
                      id="confirm-password"
                      label="Confirm Password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      showPassword={showConfirmPassword}
                      onChange={handleInputChange}
                      onToggleShowPassword={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      error={error.confirmPassword}
                      required={false}
                    />
                  </>
                )}

                {/* Sign Up Button */}
                <Button
                  text={responseMessage !== 'finishSignup' ? 'Sign Up' : 'Done'}
                  fullWidth={true}
                  onClick={
                    responseMessage !== 'finishSignup'
                      ? onSignup
                      : onFinishSignup
                  }
                />

                {/* Divider */}
                {responseMessage !== 'finishSignup' && <Divider text="Or" />}
              </form>

              {responseMessage === 'finishSignup' && (
                <Button
                  variant="outline"
                  size={0}
                  fontSize={14}
                  icon={<FiArrowLeft />}
                  text="Go Back"
                  className="text-gray-700! hover:text-black! transition-colors mx-auto mt-4"
                  onClick={handleGoBack}
                />
              )}

              {/* Google Login Button */}
              {responseMessage !== 'finishSignup' && (
                <Button
                  text="Continue with Google"
                  icon={<FaGoogle />}
                  fullWidth={true}
                  onClick={onGoogleSignUp}
                />
              )}
            </div>

            {responseMessage !== 'finishSignup' && (
              <AuthFooter
                text="Already have an account?"
                linkText="Sign in here"
                userType={userType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
