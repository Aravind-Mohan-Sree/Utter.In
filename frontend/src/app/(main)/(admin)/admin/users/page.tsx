'use client';

import { useState, useEffect } from 'react';
import { SearchAndFilter } from '~components/admin/SearchAndFilter';
import { Card } from '~components/admin/Card';
import { Pagination } from '~components/shared/Pagination';
import { MdPeople } from 'react-icons/md';
import { fetchUsers, toggleStatus } from '~services/admin/usersService';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';
import { Dropdown } from '~components/shared/Dropdown';
import { API_ROUTES } from '~constants/routes';
import { RootState } from '~store/rootReducer';
import { useSelector } from 'react-redux';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
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
  const { user } = useSelector((state: RootState) => state.auth);
  const totalPages = Math.ceil(totalUsersCount / itemsPerPage);
  const from = totalUsersCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalUsersCount);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetchUsers(
          currentPage,
          itemsPerPage,
          debouncedQuery,
          activeFilter,
        );

        const users = res.usersData.users.map((user: User) => ({
          ...user,
          avatarUrl: `${API_ROUTES.USER.FETCH_AVATAR}/${
            user.id
          }.jpeg?v=${Date.now()}`,
        }));

        setTotalUsersCount(res.usersData.totalUsersCount);
        setFilteredUsersCount(res.usersData.filteredUsersCount);
        setUsers(users);
      } catch (error) {
        utterToast.error(errorHandler(error));
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

      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4 text-black">
        <div className="flex items-center gap-2">
          <p className="text-sm">Items per page</p>
          <Dropdown
            options={itemsOptions}
            selected={itemsPerPage.toString()}
            onSelect={(val) => {
              setItemsPerPage(+val);
            }}
          />
        </div>

        <p className="text-sm text-black">
          Showing{' '}
          <span className="font-medium text-rose-400">
            {from}-{to}
          </span>{' '}
          of{' '}
          <span className="font-medium text-rose-400">
            {filteredUsersCount}
          </span>{' '}
          results
          {filteredUsersCount !== totalUsersCount && (
            <span className="text-black ml-1">
              (Total{' '}
              <span className="text-rose-400 font-medium">
                {totalUsersCount}
              </span>{' '}
              users)
            </span>
          )}
        </p>
      </div>

      {users.length === 0 ? (
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
              avatarUrl={user.avatarUrl}
              joinedAt={user.createdAt}
              status={user.isBlocked ? 'Blocked' : 'Active'}
              knownLanguages={user.knownLanguages}
              onToggleStatus={handleToggleStatus}
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
