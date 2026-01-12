'use client';

import { useState, useMemo } from 'react';
import { SearchAndFilter } from '~components/admin/SearchAndFilter';
import { Card, TutorCardProps } from '~components/admin/Card';
import { Pagination } from '~components/shared/Pagination';
import { DetailsModal } from '~components/admin/modals';
import { MdSchool } from 'react-icons/md';

export default function TutorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState<number | null>(null);

  const [tutors, setTutors] = useState([
    {
      id: 1,
      name: 'Rajesh Gupta',
      email: 'rajesh.gupta@email.com',
      status: 'Active',
      verified: true,
      rejectionReason: null,
      languages: ['English', 'Hindi'],
      experience: '0-1',
      certificateFileName: 'Certificate.pdf',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      status: 'Blocked',
      verified: false,
      rejectionReason: null,
      languages: ['Spanish', 'French'],
      experience: '3-5',
      certificateFileName: 'Certificate.pdf',
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      status: 'Active',
      verified: false,
      rejectionReason: null,
      languages: ['Japanese'],
      experience: '1-3',
      certificateFileName: 'Certificate.pdf',
    },
    {
      id: 4,
      name: 'Sneha Mehta',
      email: 'sneha.mehta@email.com',
      status: 'Active',
      verified: false,
      rejectionReason: 'Incomplete documentation',
      languages: ['French'],
      experience: '5+',
      certificateFileName: 'Certificate.pdf',
    },
  ]);

  // Filter logic
  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      let matchesFilter = false;

      if (activeFilter === 'All') {
        matchesFilter = true;
      } else if (activeFilter === 'Verified') {
        matchesFilter = tutor.verified === true;
      } else if (activeFilter === 'Pending') {
        matchesFilter = tutor.verified === false && !tutor.rejectionReason;
      } else if (activeFilter === 'Rejected') {
        matchesFilter =
          tutor.rejectionReason !== null &&
          tutor.rejectionReason.trim().length > 0;
      } else {
        // For Active/Blocked status filters
        matchesFilter = tutor.status === activeFilter;
      }

      const matchesSearch =
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.languages.some((lang) =>
          lang.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      return matchesFilter && matchesSearch;
    });
  }, [tutors, activeFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTutors = filteredTutors.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleViewDetails = (id: number) => {
    setSelectedTutorId(id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setTutors((prev) =>
      prev.map((tutor) =>
        tutor.id === id
          ? {
              ...tutor,
              status: tutor.status === 'Active' ? 'Blocked' : 'Active',
            }
          : tutor,
      ),
    );
  };

  const selectedTutor = tutors.find((t) => t.id === selectedTutorId);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <SearchAndFilter
        placeholder="Search tutors..."
        filters={[
          'All',
          'Verified',
          'Pending',
          'Rejected',
          'Active',
          'Blocked',
        ]}
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

      {paginatedTutors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <MdSchool className="mx-auto w-24 h-24" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No tutors found
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            {searchQuery || activeFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'There are no tutors available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTutors.map((tutor) => (
            <Card
              key={tutor.id}
              type="tutor"
              id={tutor.id}
              name={tutor.name}
              email={tutor.email}
              avatarUrl={avatarUrl}
              status={tutor.status as TutorCardProps['status']}
              verified={tutor.verified}
              rejectionReason={tutor.rejectionReason}
              experience={`${tutor.experience} years experience`}
              languages={tutor.languages}
              onToggleStatus={handleToggleStatus}
              onViewDetails={handleViewDetails}
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

      {/* Details Modal */}
      {selectedTutor && (
        <DetailsModal
          type="tutor"
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTutorId(null);
          }}
          tutor={{
            id: selectedTutor.id,
            name: selectedTutor.name,
            email: selectedTutor.email,
            avatarUrl,
            experience: `${selectedTutor.experience} years experience`,
            verified: selectedTutor.verified,
            rejectionReason: selectedTutor.rejectionReason,
          }}
          introVideoUrl={introVideoUrl}
          certificateUrl={certificateUrl}
          certificateFileName={selectedTutor.certificateFileName}
          onApprove={(id) => {
            console.log('Approve tutor', id);
            // Add your approve logic here
          }}
          onReject={(id) => {
            console.log('Reject tutor', id);
            // Add your reject logic here
          }}
        />
      )}
    </div>
  );
}
