'use client';

import { useEffect,useState } from 'react';
import { MdPeople } from 'react-icons/md';
import { useSelector } from 'react-redux';

import { SearchAndFilter } from '~components/form/SearchAndFilter';
import { Card } from '~components/ui/Card';
import { Pagination } from '~components/ui/Pagination';
import { ResultsSummary } from '~components/ui/ResultsSummary';
import { fetchUsers, toggleStatus } from '~services/admin/usersService';
import { RootState } from '~store/rootReducer';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';

interface User {
  id: string;
  name: string;
  email: string;
  knownLanguages: string[];
  bio: string;
  role: string;
  isBlocked: boolean;
  createdAt: Date;
}

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [itemsOptions] = useState(['3', '6', '9', '15', '21']);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [filteredUsersCount, setFilteredUsersCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const totalPages = Math.ceil(filteredUsersCount / itemsPerPage);
  const from = filteredUsersCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, filteredUsersCount);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchUsers(
          currentPage,
          itemsPerPage,
          debouncedQuery,
          activeFilter,
        );

        const users = res.usersData.users;

        setTotalUsersCount(res.usersData.totalUsersCount);
        setFilteredUsersCount(res.usersData.filteredUsersCount);
        setUsers(users);
      } catch (error) {
        utterToast.error(errorHandler(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedQuery, activeFilter, currentPage, itemsPerPage, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [users]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleStatus(id);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, isBlocked: !user.isBlocked } : user,
        ),
      );

      utterToast.error(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  return (
    <div className="w-full">
      <SearchAndFilter
        placeholder="Search users..."
        filters={['All', 'Active', 'Blocked']}
        activeFilter={activeFilter}
        onFilterChange={(val) => {
          setActiveFilter(val);
          setCurrentPage(1);
        }}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      <ResultsSummary
        from={from}
        to={to}
        filteredCount={filteredUsersCount}
        totalCount={totalUsersCount}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        itemsOptions={itemsOptions}
        label="users"
      />

      {loading && users.length === 0 ? (
        <div className="h-[40vh] w-full flex flex-col items-center justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[5px] border-rose-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-[5px] border-transparent border-t-rose-500 rounded-full animate-spin"></div>
            <div className="absolute inset-5 bg-rose-500/5 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Retrieving Users</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <MdPeople className="mx-auto w-24 h-24" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No users found
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            {searchQuery || activeFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'There are no users available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card
              key={user.id}
              type="user"
              id={user.id}
              name={user.name}
              email={user.email}
              joinedAt={user.createdAt}
              status={user.isBlocked ? 'Blocked' : 'Active'}
              knownLanguages={user.knownLanguages}
              onToggleStatus={handleToggleStatus}
              hideOnlineStatus={true}
            />
          ))}
        </div>
      )}

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
