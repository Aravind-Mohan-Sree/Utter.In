'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Notification from './Notification';
import { FaBell } from 'react-icons/fa';
import Image from 'next/image';
import { GoX } from 'react-icons/go';
import { BiMenu, BiSolidReport } from 'react-icons/bi';
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { RootState } from '~store/rootReducer';
import { MdDashboard, MdPeople, MdSchool, MdLogout } from 'react-icons/md';
import { HiChevronDoubleLeft } from 'react-icons/hi';
import { IoLanguage } from 'react-icons/io5';
import { utterToast } from '~utils/utterToast';
import { useDispatch } from 'react-redux';
import { signout } from '~services/shared/managementService';
import { errorHandler } from '~utils/errorHandler';
import { utterAlert } from '~utils/utterAlert';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;
  const [sessionCount] = useState(8);
  const [chatCount] = useState(4);
  const [notificationCount] = useState(12);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const isAdminPath = pathname.startsWith('/admin');

  // Update CSS variable for sidebar width
  useEffect(() => {
    if (userRole === 'admin' && isAdminPath) {
      const sidebarWidth = isSidebarCollapsed ? '80px' : '256px';
      document.documentElement.style.setProperty(
        '--admin-sidebar-width',
        sidebarWidth,
      );
    }
  }, [isSidebarCollapsed, userRole, isAdminPath]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = 'unset';
      } else if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
      }
    };

    if (isMenuOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    try {
      const res = await signout(user!.role);

      setIsMenuOpen(false);
      dispatch({ type: 'signout' });
      utterToast.success(res.message);
      router.replace(`/admin/signin`);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const userLinks = [
    { href: '/', label: 'Home' },
    { href: '/play-quiz', label: 'Play Quiz' },
    { href: '/tutors', label: 'Tutors' },
    { href: '/sessions', label: `Sessions`, badge: sessionCount },
    { href: '/chats', label: `Chats`, badge: chatCount },
    { href: '/profile', label: 'Profile' },
  ];

  const tutorLinks = [
    { href: '/', label: 'Home' },
    { href: '/create-sessions', label: 'Create Sessions' },
    { href: '/sessions', label: `Sessions`, badge: sessionCount },
    { href: '/profile', label: 'Profile' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { href: '/admin/users', label: 'Users', icon: <MdPeople /> },
    { href: '/admin/tutors', label: 'Tutors', icon: <MdSchool /> },
    {
      href: '/admin/reports',
      label: 'Abuse Reports',
      icon: <BiSolidReport />,
    },
  ];

  const links =
    userRole === 'user' ? userLinks : userRole === 'tutor' ? tutorLinks : [];

  if (userRole === 'admin' && isAdminPath) {
    return (
      <>
        <div
          className={`fixed inset-0 bg-rose-100/30 z-40 backdrop-blur-md lg:hidden transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          className={`fixed lg:fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col h-screen
            ${
              isMenuOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            }
            ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
        >
          <div className="h-16 px-6 ps-5.5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <Link href={'/admin/dashboard'}>
              <div className="flex items-center gap-2">
                <Image
                  src="/utter_logo.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="shrink-0 animate-bounce"
                />
                <div
                  className={`flex transition-all duration-300 ease-in-out ${
                    isSidebarCollapsed
                      ? 'lg:opacity-0 lg:w-0 lg:invisible'
                      : 'opacity-100 w-auto visible'
                  }`}
                >
                  <span className="text-2xl font-bold text-rose-400 whitespace-nowrap">
                    Utter
                  </span>
                </div>
              </div>
            </Link>
            <button
              className="lg:hidden text-gray-700 hover:text-rose-400 rounded-md p-2 transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <GoX size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-2">
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all duration-300 relative group
                      ${
                        pathname === link.href
                          ? 'bg-rose-50 text-rose-400'
                          : 'text-gray-700 hover:bg-rose-50'
                      }`}
                  >
                    <span className="text-xl shrink-0">{link.icon}</span>
                    <div
                      className={`flex-1 flex items-center justify-between transition-all duration-300 ease-in-out overflow-hidden ${
                        isSidebarCollapsed
                          ? 'lg:opacity-0 lg:w-0 lg:invisible'
                          : 'opacity-100 w-auto visible delay-00'
                      }`}
                    >
                      <span className="font-medium truncate mr-2 ml-1">
                        {link.label}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-4">
            <div
              className={`flex items-center gap-3 px-2 min-h-[40px] transition-all duration-300 ${
                isSidebarCollapsed ? 'lg:justify-start' : 'justify-start'
              }`}
            >
              <span className="flex justify-center items-center rounded-full bg-rose-200 w-8 h-8 shrink-0 text-rose-400">
                {user?.name?.[0]}
              </span>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isSidebarCollapsed
                    ? 'lg:opacity-0 lg:max-w-0 lg:invisible'
                    : 'opacity-100 max-w-[200px] visible'
                }`}
              >
                <h3 className="font-medium text-gray-900 truncate leading-tight">
                  {user?.name}
                </h3>
                <p className="text-[10px] text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex cursor-pointer items-center gap-3 px-3.5 py-3 text-gray-700 hover:bg-rose-50 rounded-lg hover:text-rose-400 transition-colors"
              >
                <HiChevronDoubleLeft
                  className={`shrink-0 transition-transform duration-300 ${
                    isSidebarCollapsed ? 'rotate-180' : ''
                  }`}
                  size={20}
                />
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isSidebarCollapsed
                      ? 'lg:opacity-0 lg:max-w-0 lg:invisible'
                      : 'opacity-100 max-w-[150px] visible'
                  }`}
                >
                  <span className="font-medium whitespace-nowrap">
                    Collapse
                  </span>
                </div>
              </button>

              <button
                onClick={() =>
                  utterAlert({
                    title: 'Are you sure...',
                    text: 'Do you really want to signout?',
                    icon: 'question',
                    confirmText: 'Yes',
                    cancelText: 'No',
                    showCancel: true,
                    onConfirm: handleSignOut,
                  })
                }
                className="flex cursor-pointer items-center gap-3 px-3.5 py-3 text-white bg-red-500 hover:bg-rose-50 hover:text-red-500 rounded-lg transition-colors w-full"
              >
                <MdLogout className="text-xl shrink-0" />
                <div
                  className={`flex transition-all duration-300 ease-in-out overflow-hidden ${
                    isSidebarCollapsed
                      ? 'lg:opacity-0 lg:w-0 lg:invisible'
                      : 'opacity-100 lg:w-32 visible'
                  }`}
                >
                  <span className="font-medium whitespace-nowrap">
                    Sign Out
                  </span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm px-4 flex items-center justify-between shrink-0 z-30">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-700 hover:text-rose-400 transition-colors rounded-md cursor-pointer"
          >
            <BiMenu size={28} />
          </button>
          <Link href={'/admin/dashboard'}>
            <div className="flex items-center gap-2">
              <Image
                src="/utter_logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="animate-bounce"
              />
              <span className="text-2xl font-bold text-rose-400">Utter</span>
            </div>
          </Link>
          <div className="w-10" />
        </header>
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-rose-100/30 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/utter_logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="animate-bounce"
              />
              <span className="text-2xl font-bold text-rose-400">Utter</span>
            </Link>

            <div className="flex items-center gap-4 lg:gap-8 h-full">
              {userRole && (
                <ul className="hidden lg:flex items-center gap-6 h-full">
                  {links.map((link) => (
                    <li key={link.href} className="h-full">
                      <Link
                        href={link.href}
                        className={`flex items-center h-full px-1 text-sm font-medium transition-colors 
                          ${
                            pathname === link.href
                              ? 'shadow-[inset_0_-2px_0_0_#fb7185] text-rose-400'
                              : 'border-transparent text-gray-600 hover:text-rose-400'
                          }`}
                      >
                        {link.label}
                        {link.badge && (
                          <span className="ml-2 bg-rose-100 text-rose-500 text-[0.65rem] font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {link.badge > 99 ? '99+' : link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-3 lg:gap-5 lg:pl-4 lg:border-l lg:border-gray-300">
                {!isAdminPath && userRole !== 'admin' && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <div className="flex items-center">
                      <LanguageSwitcher />
                    </div>
                  </div>
                )}

                {userRole && userRole !== 'admin' && (
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-600 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <FaBell className="text-xl" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-3 -right-3 bg-rose-100 text-rose-500 text-[0.65rem] font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                )}

                {userRole && (
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden text-gray-700 hover:text-rose-400 rounded-md pl-2 transition-colors cursor-pointer"
                  >
                    {isMenuOpen ? <GoX size={28} /> : <BiMenu size={28} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`lg:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-xl transition-all duration-300 origin-top
            ${
              isMenuOpen
                ? 'scale-y-100 opacity-100'
                : 'scale-y-0 opacity-0 pointer-events-none'
            }`}
        >
          <div className="p-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  pathname === link.href
                    ? 'bg-rose-50 text-rose-500'
                    : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-medium">{link.label}</span>
                {link.badge && (
                  <span className="bg-rose-100 text-rose-500 text-xs px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {showNotifications && (
        <Notification onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
