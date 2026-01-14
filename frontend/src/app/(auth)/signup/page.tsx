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
import { googleRegister, register } from '~services/shared/authService';
import { UserType } from '~types/auth/UserType';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import { TutorSignupSchema, UserSignupSchema } from '~validations/AuthSchema';
import bgImage from '../../../../public/bg.webp';
import { validateVideoDuration } from '~validations/validateVideoDuration';
import { utterAlert } from '~utils/utterAlert';
import { getAccountDetails } from '~services/shared/managementService';
import { ExperienceSelector } from '~components/auth/ExperienceSelector';
import Button from '~components/shared/Button';
import { Divider } from '~components/auth/Divider';
import { FaGoogle } from 'react-icons/fa';

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
  const tutorEmail = searchParams.get('email');
  const [userType, setUserType] = useState<UserType>(
    (USER_TYPE as UserType) || 'user',
  );
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [error, setError] = useState(INITIAL_ERROR_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validationSchema =
    userType === 'user' ? UserSignupSchema : TutorSignupSchema;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        if (tutorEmail) {
          const res = await getAccountDetails('tutor', tutorEmail);
          const {
            name,
            email,
            knownLanguages,
            yearsOfExperience,
            rejectionReason,
          } = res.tutor;

          setFormData((prev) => ({
            ...prev,
            name,
            email,
            languages: knownLanguages,
            experience: yearsOfExperience,
          }));
          utterAlert({
            title: 'Account verification failed',
            text: `Reason: ${rejectionReason}.`,
            footer: 'Please signup again',
            icon: 'info',
          });
        }
      } catch (error) {
        utterToast.error(errorHandler(error));
      }
    })();
  }, [tutorEmail]);

  useEffect(() => {
    (() => {
      setFormData(INITIAL_FORM_DATA);
      setError(INITIAL_ERROR_STATE);
      setShowPassword(false);
      setShowConfirmPassword(false);
    })();
  }, [userType]);

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

  const handleSubmit = async () => {
    if (error.introVideo) return;

    const newErrors = validationSchema
      .safeParse(formData)
      .error?.issues.reduce<Record<string, string>>((acc, issue) => {
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
      const apiFormData = new FormData();
      const formDataState: SignUpData = formData;

      for (const key in formDataState) {
        const propKey = key as keyof SignUpData;
        const value = formDataState[propKey];

        if (propKey === 'introVideo' || propKey === 'certificate') {
          if (value instanceof File) {
            apiFormData.append(propKey, value);
          }
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            apiFormData.append(`${propKey}[]`, item.toString());
          });
        } else {
          apiFormData.append(propKey, value!.toString());
        }
      }

      try {
        const res = await register(userType, apiFormData);

        utterToast.success(res.message);
        router.push(
          `/verify-otp?mode=${userType}&email=${encodeURIComponent(
            formData.email,
          )}`,
        );
      } catch (error) {
        utterToast.error(errorHandler(error));
      }
    }
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

  const subtitle =
    userType === 'user'
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
                Join Utter.In
              </h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            <div className="space-y-6">
              <UserTypeToggle userType={userType} onChange={setUserType} />

              <form className="space-y-6">
                {/* Name Input */}
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
                        accept=".pdf"
                        onChange={handleFileChange}
                        error={error.certificate}
                        Icon={FaRegFilePdf}
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <PasswordInput
                  id="password"
                  label="Password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  showPassword={showPassword}
                  onChange={handleInputChange}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
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

                {/* Sign Up Button */}
                <Button
                  text="Sign Up"
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
                onClick={onGoogleSignUp}
              />
            </div>

            <AuthFooter
              text="Already have an account?"
              linkText="Sign in here"
              userType={userType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
