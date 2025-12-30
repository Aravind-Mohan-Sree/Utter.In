'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ExperienceSelector } from '~components/auth/ExperienceSelector';
import { InputField } from '~components/auth/InputField';
import { LanguagesInput } from '~components/auth/LanguagesInput';
import { PasswordInput } from '~components/auth/PasswordInput';
import { TextAreaInput } from '~components/auth/TextAreaInput';
import Notification from '~components/layout/Notification';
import AbuseReportsModal from '~components/profile/AbuseReportsModal';
import Avatar from '~components/profile/Avatar';
import ProfileDetail from '~components/profile/ProfileDetail';
import TransactionHistoryModal from '~components/profile/TransactionHistoryModal';
import AbstractShapesBackground from '~components/shared/AbstractShapesBackground';
import Button from '~components/shared/Button';
import Loader from '~components/shared/Loader';
import {
  changePassword,
  fetchAvatar,
  getAccountDetails,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from '~services/shared/managementService';
import { RootState } from '~store/store';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';
import {
  changePasswordSchema,
  tutorProfileUpdateSchema,
  userProfileUpdateSchema,
} from '~validations/profileSchema';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  knownLanguages: string[];
  yearsOfExperience: string;
  walletBalance: number;
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_ERROR_STATE = {
  name: '',
  bio: '',
  languages: '',
  experience: '',
  currentPassword: '',
  password: '',
  confirmPassword: '',
};

interface Transaction {
  id: number;
  type: 'payment' | 'refund';
  description: string;
  date: string;
  amount: number;
  balanceAfter: number;
}

interface AbuseReport {
  id: number;
  status: 'pending' | 'resolved' | 'rejected';
  type: string;
  reportedUser: {
    name: string;
    email: string;
  };
  date: string;
  description: string;
  channel: 'video' | 'chat';
}

export default function ProfilePage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAbuseReportsModalOpen, setIsAbuseReportsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(INITIAL_ERROR_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://utter-web-app.s3.ap-south-2.amazonaws.com/utter/logo_bd9o9t.png',
  );
  const validationSchema =
    user?.role === 'user' ? userProfileUpdateSchema : tutorProfileUpdateSchema;

  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'payment',
      description: 'Payment to Session',
      date: 'January 15, 2025',
      amount: -300,
      balanceAfter: 2450,
    },
    {
      id: 2,
      type: 'refund',
      description: 'Cancellation Refund',
      date: 'January 12, 2025',
      amount: 300,
      balanceAfter: 2750,
    },
  ];

  const abuseReports: AbuseReport[] = [
    {
      id: 1,
      status: 'pending',
      type: 'Harassment',
      reportedUser: {
        name: 'Karan Malhotra',
        email: 'karan.malhotra@email.com',
      },
      date: '2025-01-26 13:10',
      description: 'Verbal abuse and inappropriate comments during session',
      channel: 'video',
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const avatarUrl = await fetchAvatar({ role: user!.role, id: user!.id });

        setAvatarUrl(avatarUrl);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAccountDetails(user!.role, user!.email);
        const data: ProfileData = res.user ?? res.tutor;
        setProfileData(data);
      } catch (error) {
        utterToast.error(errorHandler(error));
      }
    })();
  }, [user]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        ...profileData,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [profileData]);

  const handleAvatarUpload = async (croppedBlob: Blob) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('avatar', croppedBlob);

      const res = await uploadAvatar(user!.role, formData);

      utterToast.success(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarDeletion = async () => {
    try {
      setIsLoading(true);

      const res = await removeAvatar(user!.role);

      utterToast.success(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    console.log('Signing out...');
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData as ProfileData);
    setError((prev) => ({
      ...prev,
      [name]: validationSchema
        .safeParse(updatedFormData)
        .error?.issues.find((ele) => ele.path[0] === name)?.message,
    }));
  };

  const handleLanguagesChange = (languages: string[]) => {
    const updatedFormData = {
      ...formData,
      knownLanguages: [...languages],
    };
    setFormData(updatedFormData as ProfileData);
    setError((prev) => ({
      ...prev,
      ['languages']:
        validationSchema
          .safeParse({
            ...updatedFormData,
            languages: updatedFormData.knownLanguages,
          })
          .error?.issues.find((ele) => ele.path[0] === 'languages')?.message ??
        '',
    }));
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData as ProfileData);
    setError((prev) => ({
      ...prev,
      [name]: changePasswordSchema
        .safeParse(updatedFormData)
        .error?.issues.find((ele) => ele.path[0] === name)?.message,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToCompare = ['name', 'bio', 'knownLanguages'];
    if (user?.role === 'tutor') {
      fieldsToCompare.push('yearsOfExperience');
    }

    const isUnchanged = fieldsToCompare.every(
      (key) =>
        formData![key as keyof ProfileData] ===
        profileData![key as keyof ProfileData],
    );

    if (isUnchanged) {
      utterToast.info('No changes to update');
      return;
    }

    const validation = validationSchema.safeParse({
      ...formData,
      languages: formData?.knownLanguages,
    });

    if (!validation.success) {
      const newErrors = validation.error.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const fieldName = issue.path[0] as string;
          if (!acc[fieldName]) acc[fieldName] = issue.message;
          return acc;
        },
        {},
      );

      setError({
        ...INITIAL_ERROR_STATE,
        ...newErrors,
      });
      return;
    }

    if (!isLoading) {
      setIsLoading(true);
      setError(INITIAL_ERROR_STATE);

      try {
        const res = await updateProfile(user!.role, formData as ProfileData);

        utterToast.success(res.message);
      } catch (error) {
        utterToast.error(errorHandler(error));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = changePasswordSchema.safeParse(formData);

    if (!validation.success) {
      const newErrors = validation.error.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const fieldName = issue.path[0] as string;
          if (!acc[fieldName]) acc[fieldName] = issue.message;
          return acc;
        },
        {},
      );

      setError({
        ...INITIAL_ERROR_STATE,
        ...newErrors,
      });
      return;
    }

    if (!isLoading) {
      setIsLoading(true);
      setError(INITIAL_ERROR_STATE);

      try {
        const res = await changePassword(user!.role, formData as ProfileData);

        utterToast.success(res.message);
      } catch (error) {
        utterToast.error(errorHandler(error));
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!formData) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {showNotifications && (
        <Notification onClose={() => setShowNotifications(false)} />
      )}

      <main className="pt-20 px-4 pb-6 max-w-7xl mx-auto">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <AbstractShapesBackground />

          <div className="bg-white/20 rounded-2xl shadow-lg p-6 h-fit backdrop-blur-xs">
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                user={{ name: user!.name, avatarUrl }}
                handleAvatarUpload={handleAvatarUpload}
                handleAvatarDeletion={handleAvatarDeletion}
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 wrap-anywhere">
                  {profileData?.name}
                </h3>
                <p className="text-gray-600 wrap-anywhere">
                  {profileData?.email}
                </p>
              </div>
            </div>

            <ProfileDetail
              bio={profileData?.bio}
              languages={profileData?.knownLanguages}
              experience={profileData?.yearsOfExperience}
            />

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Wallet
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-red-500">₹ 0</p>
                </div>
                <Button
                  text="Transaction History"
                  variant="secondary"
                  onClick={() => setIsTransactionModalOpen(true)}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
              <Button
                text="Abuse Reports"
                variant="secondary"
                onClick={() => setIsAbuseReportsModalOpen(true)}
              />
              <Button
                text="Sign Out"
                variant="danger"
                isLoading={isLoading}
                onClick={handleSignOut}
              />
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl shadow-lg p-6 backdrop-blur-xs">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <p className="text-gray-600">
                Update your personal information and preferences
              </p>
            </div>

            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-6">
                <InputField
                  id="name"
                  label="Full Name"
                  type="text"
                  name="name"
                  placeholder="user@example.com"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={error.name}
                  required={false}
                />

                <TextAreaInput
                  id="bio"
                  label="Bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  error={error.bio}
                />

                <LanguagesInput
                  languages={formData.knownLanguages}
                  onLanguagesChange={handleLanguagesChange}
                  maxLanguages={3}
                  error={error.languages}
                />

                {profileData?.yearsOfExperience && (
                  <ExperienceSelector
                    id="experience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    error={error.experience}
                  />
                )}

                <Button text="Update" isLoading={isLoading} />
              </div>
            </form>

            <form action="" className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Change Password
              </h4>
              <div className="space-y-4">
                <PasswordInput
                  id="currentPassword"
                  label="Current Password"
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  showPassword={showCurrentPassword}
                  onChange={handlePasswordInput}
                  onToggleShowPassword={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                  error={error.currentPassword}
                  required={false}
                />

                <PasswordInput
                  id="password"
                  label="New Password"
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  showPassword={showNewPassword}
                  onChange={handlePasswordInput}
                  onToggleShowPassword={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  error={error.password}
                  required={false}
                />

                <PasswordInput
                  id="confirmPassword"
                  label="Confirm New Password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  showPassword={showConfirmNewPassword}
                  onChange={handlePasswordInput}
                  onToggleShowPassword={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                  error={error.confirmPassword}
                  required={false}
                />

                <div className="pt-2">
                  <Button
                    text="Change"
                    isLoading={isLoading}
                    onClick={handleChangePassword}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <TransactionHistoryModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactions={transactions}
        totalBalance={formData.walletBalance}
      />

      <AbuseReportsModal
        isOpen={isAbuseReportsModalOpen}
        onClose={() => setIsAbuseReportsModalOpen(false)}
        reports={abuseReports}
      />
    </div>
  );
}
