'use client';

import { useState, useMemo, useEffect } from 'react';
import { SearchAndFilter } from '~components/admin/SearchAndFilter';
import { Card, TutorCardProps } from '~components/admin/Card';
import { Pagination } from '~components/shared/Pagination';
import { MdPeople } from 'react-icons/md';
import { fetchUsers } from '~services/admin/usersService';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUsers(
          currentPage,
          itemsPerPage,
          debouncedQuery,
          activeFilter,
        );
        console.log(res.userData.users);
        setTotalUsers(res.usersData.totalUsers);
        setUsers(res.usersData.users);
      } catch (error) {
        utterToast.error(errorHandler(error));
      }
    })();
  }, [debouncedQuery, activeFilter, currentPage, itemsPerPage]);

  // Pagination calculation
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users?.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!paginatedUsers) return;

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

      {paginatedUsers.length === 0 ? (
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
          {paginatedUsers.map((user) => (
            <Card
              key={user.id}
              type="user"
              id={user.id}
              name={user.name}
              email={user.email}
              avatarUrl={avatarUrl}
              status={user.status as TutorCardProps['status']}
              languages={user.languages}
              onToggleStatus={() => {}}
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
