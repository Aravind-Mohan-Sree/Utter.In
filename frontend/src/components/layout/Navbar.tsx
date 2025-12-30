'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Notification from './Notification';
import { FaBell } from 'react-icons/fa';
import Image from 'next/image';
import { GoX } from 'react-icons/go';
import { BiMenu } from 'react-icons/bi';
import { useSelector } from 'react-redux';
import { RootState } from '~store/store';
import { usePathname } from 'next/navigation';
import { IoLanguage } from 'react-icons/io5';
import { CgChevronDown } from 'react-icons/cg';

export function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;
  const [sessionCount] = useState(8);
  const [chatCount] = useState(4);
  const [notificationCount] = useState(12);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const userLinks = [
    { href: '/', label: 'Home' },
    { href: '/play-quiz', label: 'Play Quiz' },
    { href: '/tutors', label: 'Tutors' },
    { href: '/sessions', label: `Sessions`, badge: sessionCount },
    { href: '/chats', label: `Chats`, badge: chatCount },
    { href: '/profile', label: 'Profile' },
  ];

  const tutorLinks = [
    { href: '/home', label: 'Home' },
    { href: '/create-sessions', label: 'Create Sessions' },
    { href: '/sessions', label: `Sessions`, badge: sessionCount },
    { href: '/profile', label: 'Profile' },
  ];

  const links =
    userRole === 'user' ? userLinks : userRole === 'tutor' ? tutorLinks : [];

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-rose-100/30 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={'/utter_logo.png'}
                alt="utterLogo"
                width={40}
                height={40}
                className="animate-bounce"
              />
              <span className="text-2xl font-semibold text-rose-500">
                Utter.In
              </span>
            </Link>

            {userRole && (
              <div className="hidden lg:flex items-center gap-6">
                <ul className="flex items-center gap-6">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-rose-400 hover:text-rose-600 flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm underline-offset-3 decoration-2 ${
                              pathname === link.href
                                ? 'underline'
                                : 'no-underline'
                            }`}
                          >
                            {link.label}
                          </span>
                          {link.badge && (
                            <span className="bg-rose-100 border-rose-400 text-rose-400 text-[.7rem] rounded-full w-6 h-6 flex items-center justify-center">
                              {link.badge > 99 ? '99+' : link.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 text-rose-400 font-medium">
              <button className="flex items-center gap-1.5 cursor-pointer hover:text-rose-600">
                <IoLanguage size={20} />
                <span className="text-sm">English</span>
                <CgChevronDown />
              </button>

              {userRole && (
                <div className="relative inline-flex">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <FaBell
                      size={20}
                      className="text-rose-400 hover:text-rose-600"
                    />
                    {notificationCount > 0 && (
                      <span className="absolute -top-3 -right-3 bg-rose-100 text-rose-400 text-[.7rem] rounded-full w-6 h-6 flex items-center justify-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {userRole && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden inline-flex items-center justify-center ms-3 rounded-md text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  {isMenuOpen ? <GoX size={26} /> : <BiMenu size={26} />}
                </button>
              )}
            </div>
          </div>

          {isMenuOpen && userRole && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:text-rose-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm underline-offset-3 decoration-2 ${
                            pathname === link.href
                              ? 'underline'
                              : 'no-underline'
                          }`}
                        >
                          {link.label}
                        </span>
                        {link.badge && (
                          <span className="bg-rose-100 text-rose-600 text-xs font-semibold px-2 py-1 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {showNotifications && (
        <Notification onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
