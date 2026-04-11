'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProfileDetail from '~components/blocks/ProfileDetail';
import { ExperienceSelector } from '~components/form/ExperienceSelector';
import { InputField } from '~components/form/InputField';
import { LanguagesInput } from '~components/form/LanguagesInput';
import { PasswordInput } from '~components/form/PasswordInput';
import { TextAreaInput } from '~components/form/TextAreaInput';
import Notification from '~components/layout/Notification';
import AbuseReportsModal from '~components/modals/AbuseReportsModal';
import TransactionHistoryModal from '~components/modals/TransactionHistoryModal';
import AbstractShapesBackground from '~components/ui/AbstractShapesBackground';
import Avatar from '~components/ui/Avatar';
import Button from '~components/ui/Button';
import { DateAndTime } from '~components/ui/DateAndTime';
import Loader from '~components/ui/Loader';
import {
  changePassword,
  getAccountDetails,
  removeAvatar,
  signout,
  updateProfile,
  uploadAvatar,
} from '~services/shared/managementService';
import { getWalletTransactions } from '~services/shared/walletService';
import { RootState } from '~store/rootReducer';
import { errorHandler } from '~utils/errorHandler';
import { utterAlert } from '~utils/utterAlert';
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
  certificationType: string;
  walletBalance: number;
  currentPassword: string;
  password: string;
  confirmPassword: string;
  createdAt: string | Date;
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

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAbuseReportsModalOpen, setIsAbuseReportsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(INITIAL_ERROR_STATE);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const validationSchema =
    user?.role === 'user' ? userProfileUpdateSchema : tutorProfileUpdateSchema;

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    try {
      const wallet = await getWalletTransactions(user.role);
      let currentBalance = wallet.balance;
      const mappedTransactions = [...wallet.transactions]
        .reverse()
        .map((t, index) => {
          const transactionRecord = {
            id: index,
            type: (t.type === 'credit' ? 'refund' : 'payment') as
              | 'payment'
              | 'refund',
            description: t.description,
            date: t.date,
            amount: t.amount,
            balanceAfter: currentBalance,
          };
          currentBalance -= t.type === 'credit' ? t.amount : -t.amount;
          return transactionRecord;
        });

      setTransactions(mappedTransactions);
      setWalletBalance(wallet.balance);
    } catch (err: unknown) {
      utterToast.error(errorHandler(err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'user' || user?.role === 'tutor') {
      fetchWalletData();
    }
  }, [user, fetchWalletData]);

  useEffect(() => {
    if (isTransactionModalOpen) {
      fetchWalletData();
    }
  }, [isTransactionModalOpen, fetchWalletData]);



  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await getAccountDetails(user.role, user.email);
        const data: ProfileData = res.user ?? res.tutor;

        setProfileData(data);
        setFormData({
          ...data,
          currentPassword: '',
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        utterToast.error(errorHandler(error));
      }
    })();
  }, [user]);

  const handleAvatarUpload = async (croppedBlob: Blob) => {
    if (!user) return;
    try {
      const formData = new FormData();
      formData.append('avatar', croppedBlob);

      const res = await uploadAvatar(user!.role, formData);
      utterToast.success(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const handleAvatarDeletion = async () => {
    try {
      const res = await removeAvatar(user!.role);
      utterToast.success(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await signout(user!.role);
      dispatch({ type: 'signout' });
      utterToast.success(res.message);
      router.replace(`/signin?mode=${user?.role}`);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name === 'experience' ? 'yearsOfExperience' : name]: value,
    };

    setFormData(updatedFormData as ProfileData);
    setError((prev) => ({
      ...prev,
      [name]: validationSchema
        .safeParse({
          ...updatedFormData,
          experience: updatedFormData.yearsOfExperience,
        })
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

  const handleProfileUpdate = async () => {
    const fieldsToCompare = ['name', 'bio', 'knownLanguages'];
    if (user?.role === 'tutor') fieldsToCompare.push('yearsOfExperience');

    const isUnchanged = fieldsToCompare.every((key) => {
      let newVal = formData![key as keyof ProfileData];
      let oldVal = profileData![key as keyof ProfileData];

      if (typeof newVal === 'string') newVal = newVal.trim();
      if (typeof oldVal === 'string') oldVal = oldVal.trim();

      if (Array.isArray(newVal) && Array.isArray(oldVal)) {
        newVal = [...newVal].sort();
        oldVal = [...oldVal].sort();
      }

      return JSON.stringify(newVal) === JSON.stringify(oldVal);
    });

    if (isUnchanged) {
      utterToast.info('No changes to update');
      return;
    }

    const validation = validationSchema.safeParse({
      ...formData,
      languages: formData?.knownLanguages,
      experience: formData?.yearsOfExperience,
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

      setError({ ...INITIAL_ERROR_STATE, ...newErrors });
      return;
    }

    setError(INITIAL_ERROR_STATE);

    try {
      const res = await updateProfile(user!.role, formData as ProfileData);
      const updatedData = res.updatedTutor ? res.updatedTutor : res.updatedUser;

      setProfileData(updatedData);
      setFormData({
        ...updatedData,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
      utterToast.success(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const handleChangePassword = async () => {
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

      setError({ ...INITIAL_ERROR_STATE, ...newErrors });
      return;
    }

    setError(INITIAL_ERROR_STATE);

    try {
      const res = await changePassword(user!.role, formData as ProfileData);
      setFormData((prev) => ({
        ...prev!,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      utterToast.success(res.message);
    } catch (error) {
      setError((prev) => ({
        ...prev,
        ['confirmPassword']: errorHandler(error),
      }));
    }
  };

  if (!formData) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {showNotifications && (
        <Notification onClose={() => setShowNotifications(false)} />
      )}
      <AbstractShapesBackground />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 gap-8 items-start ${isEditMode ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'
            }`}
        >
          {/* Profile Overview Card */}
          <div className="bg-white/20 rounded-2xl shadow-lg p-6 h-fit backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <Avatar
                size="xxl"
                user={{
                  id: user?.id,
                  name: user?.name as string,
                  role: user?.role as 'user' | 'tutor',
                }}
                handleAvatarUpload={handleAvatarUpload}
                handleAvatarDeletion={handleAvatarDeletion}
                editable={true}
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 wrap-anywhere">
                  {profileData?.name}
                </h3>
                <p className="text-gray-600 wrap-anywhere">
                  {profileData?.email}
                </p>
                <DateAndTime date={profileData?.createdAt || new Date()} />
              </div>
            </div>

            <ProfileDetail
              bio={profileData?.bio}
              languages={profileData?.knownLanguages}
              experience={profileData?.yearsOfExperience}
              certificationType={profileData?.certificationType}
            />

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Wallet
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-green-500">
                    ₹{walletBalance.toLocaleString()}
                  </p>
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
                text={isEditMode ? 'Close Edit' : 'Edit Profile'}
                variant="secondary"
                onClick={() => setIsEditMode(!isEditMode)}
              />
              <Button
                text="Abuse Reports"
                variant="secondary"
                onClick={() => setIsAbuseReportsModalOpen(true)}
              />
              <Button
                text="Sign Out"
                variant="danger"
                onClick={() =>
                  utterAlert({
                    title: 'Saying Goodbye...',
                    text: 'Do you really want to signout?',
                    icon: 'question',
                    confirmText: 'Yes',
                    cancelText: 'No',
                    showCancel: true,
                    onConfirm: handleSignOut,
                  })
                }
              />
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditMode && (
            <div className="bg-white/20 rounded-2xl shadow-lg p-6 backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Profile
                </h2>
                <p className="text-gray-600">
                  Update your personal information and preferences
                </p>
              </div>

              <form>
                <div className="space-y-6">
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

                  <Button text="Update" onClick={handleProfileUpdate} />
                </div>
              </form>

              {/* Password Change Section */}
              <form className="mt-6 pt-6 border-t border-gray-200">
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
                    <Button text="Change" onClick={handleChangePassword} />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <TransactionHistoryModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactions={transactions}
        totalBalance={walletBalance}
      />

      <AbuseReportsModal
        isOpen={isAbuseReportsModalOpen}
        onClose={() => setIsAbuseReportsModalOpen(false)}
      />
    </div>
  );
}
