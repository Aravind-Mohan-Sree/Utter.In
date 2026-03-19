'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MdPeople } from 'react-icons/md';
import { useSelector } from 'react-redux';

import { commonLanguages as languagesList } from '~components/form/LanguagesInput';
import { SearchAndFilter } from '~components/form/SearchAndFilter';
import AbstractShapesBackground from '~components/ui/AbstractShapesBackground';
import Button from '~components/ui/Button';
import { Card } from '~components/ui/Card';
import Loader from '~components/ui/Loader';
import { Pagination } from '~components/ui/Pagination';
import { ResultsSummary } from '~components/ui/ResultsSummary';
import { useSocketContext } from '~contexts/SocketContext';
import { fetchUsers } from '~services/user/userService';
import { RootState } from '~store/rootReducer';

const commonLanguages = ['All', ...languagesList];

interface User {
  id: string;
  name: string;
  knownLanguages: string[];
  createdAt: string;
}

export default function Home() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { onlineUsers } = useSocketContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [sortBy, setSortBy] = useState('Newest');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [filteredUsersCount, setFilteredUsersCount] = useState(0);

  const role = user?.role as 'user' | 'tutor';
  const router = useRouter();

  const totalPages = Math.ceil(filteredUsersCount / itemsPerPage);
  const from = filteredUsersCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, filteredUsersCount);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (role === 'user') {
      (async () => {
        try {
          let sortParam = 'newest';
          if (sortBy === 'Oldest') sortParam = 'oldest';
          else if (sortBy === 'A-Z') sortParam = 'a-z';
          else if (sortBy === 'Z-A') sortParam = 'z-a';

          const res = await fetchUsers({
            q: debouncedQuery,
            page: currentPage,
            limit: itemsPerPage,
            sort: sortParam,
            language: selectedLanguage
          });

          setUsers(res.users);
          setTotalUsersCount(res.totalUsersCount);
          setFilteredUsersCount(res.filteredUsersCount);
        } catch { } finally {
          setLoading(false);
        }
      })();
    }
  }, [role, debouncedQuery, sortBy, selectedLanguage, currentPage, itemsPerPage, user?.id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById('community-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const content = {
    guest: {
      title: 'Master Any Language, Your Way',
      subtitle:
        'Whether you want to learn from native speakers or share your own expertise with the world, Utter is your gateway to global communication.',
      buttonText: 'Join the Community',
    },
    user: {
      title: 'Connect Through Languages',
      subtitle:
        'Practice with native speakers, learn new languages, and build meaningful connections with people from around the world.',
      buttonText: 'Start Learning',
    },
    tutor: {
      title: 'Share Your Knowledge',
      subtitle:
        'Share your native language expertise with eager learners worldwide. Build your teaching career while helping others achieve their language goals.',
      buttonText: 'Start Teaching',
    },
  };

  const { title, subtitle, buttonText } = (user?.role && content[role]) || content.guest;

  const handleHeroClick = () => {
    const path =
      role === 'user'
        ? '/tutors'
        : role === 'tutor'
          ? '/create-sessions'
          : '/signin';

    router.push(path);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center relative overflow-hidden bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: "url('/hero-bg.webp')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-3xl w-full text-center bg-white/10 backdrop-blur-md p-8 md:p-16 rounded-[2rem] border border-white/20 shadow-2xl">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-md">
              {title}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button text={buttonText} onClick={handleHeroClick} />
            </div>
          </div>
        </div>
      </section>

      {/* Community Section (Only for Users) */}
      {role === 'user' && (
        <section id="community-section" className="relative w-full bg-gradient-to-br from-blue-50 via-white to-rose-50 overflow-hidden py-20">
          <AbstractShapesBackground />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 space-y-6">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900">Community Members</h2>
                <p className="text-gray-500 mt-2">Connect with other language enthusiasts from around the world</p>
              </div>

              <div className="relative z-20 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
                <SearchAndFilter
                  placeholder="Search members by name or language..."
                  filters={['Newest', 'Oldest', 'A-Z', 'Z-A']}
                  activeFilter={sortBy}
                  onFilterChange={(val) => {
                    setSortBy(val);
                    setCurrentPage(1);
                  }}
                  searchValue={searchQuery}
                  onSearchChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                  }}
                  className="mb-0"
                  languageOptions={commonLanguages}
                  selectedLanguage={selectedLanguage}
                  onLanguageSelect={(val) => {
                    setSelectedLanguage(val);
                    setCurrentPage(1);
                  }}
                  languageOptionsClassName="max-h-60 overflow-y-auto no-scrollbar"
                />
              </div>

              <ResultsSummary
                from={from}
                to={to}
                filteredCount={filteredUsersCount}
                totalCount={totalUsersCount}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                itemsOptions={['6', '12', '18', '24']}
                hideTotal={true}
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader /></div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200">
                <div className="text-gray-300 mb-4">
                  <MdPeople className="mx-auto w-24 h-24" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No members found</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                  <Card
                    key={u.id}
                    type="user"
                    id={u.id}
                    name={u.name}
                    email=""
                    joinedAt={new Date(u.createdAt)}
                    status="Active"
                    knownLanguages={u.knownLanguages}
                    className="bg-white/60 backdrop-blur-sm hover:border-rose-200 transition-all h-full"
                    isOnline={onlineUsers.has(String(u.id))}
                    hideStatus={true}
                    onClick={() => router.push(`/chats?userId=${u.id}`)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
