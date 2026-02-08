'use client';

import { useState, useEffect } from 'react';
import { SearchAndFilter } from '~components/admin/SearchAndFilter';
import { Card } from '~components/admin/Card';
import { Pagination } from '~components/shared/Pagination';
import { MdPeople } from 'react-icons/md';
import {
  approve,
  fetchTutors,
  reject,
  toggleStatus,
} from '~services/admin/tutorsService';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';
import { Dropdown } from '~components/shared/Dropdown';
import { DetailsModal } from '~components/admin/modals';
import { API_ROUTES } from '~constants/routes';
import { utterRadioAlert } from '~utils/utterRadioAlert';
import { RootState } from '~store/rootReducer';
import { useSelector } from 'react-redux';

interface Tutor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  introVideoUrl: string;
  certificateUrl: string;
  certificationType: string | null;
  knownLanguages: string[];
  yearsOfExperience: string;
  rejectionReason: string | null;
  bio: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
}

export default function TutorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [itemsOptions] = useState(['3', '6', '9', '15', '21']);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [totalTutorsCount, setTotalTutorsCount] = useState(0);
  const [filteredTutorsCount, setFilteredTutorsCount] = useState(0);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const totalPages = Math.ceil(totalTutorsCount / itemsPerPage);
  const from =
    totalTutorsCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalTutorsCount);

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
        const res = await fetchTutors(
          currentPage,
          itemsPerPage,
          debouncedQuery,
          activeFilter,
        );

        const tutors = res.tutorsData.tutors.map((tutor: Tutor) => ({
          ...tutor,
          avatarUrl: `${API_ROUTES.TUTOR.FETCH_AVATAR}/${
            tutor.id
          }.jpeg?v=${Date.now()}`,
          introVideoUrl: `${API_ROUTES.TUTOR.FETCH_VIDEO}/${
            tutor.id
          }.mp4?v=${Date.now()}`,
          certificateUrl: `${API_ROUTES.TUTOR.FETCH_CERTIFICATE}/${
            tutor.id
          }.pdf?v=${Date.now()}`,
        }));

        setTotalTutorsCount(res.tutorsData.totalTutorsCount);
        setFilteredTutorsCount(res.tutorsData.filteredTutorsCount);
        setTutors(tutors);
      } catch (error) {
        utterToast.error(errorHandler(error));
      }
    })();
  }, [debouncedQuery, activeFilter, currentPage, itemsPerPage, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tutors]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (id: string) => {
    setSelectedTutorId(id);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleStatus(id);

      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor.id === id ? { ...tutor, isBlocked: !tutor.isBlocked } : tutor,
        ),
      );

      utterToast.error(res.message);
    } catch (error) {
      utterToast.error(errorHandler(error));
    }
  };

  const handleApprove = (id: string) => {
    const CERTIFICATION_OPTIONS = {
      TESOL: 'TESOL',
      CEFR: 'CEFR',
      'State Licensed': 'State Licensed',
      Goethe: 'Goethe',
      PGCHE: 'PGCHE',
    };

    utterRadioAlert(
      'Choose Certification Type',
      CERTIFICATION_OPTIONS,
      'Confirm',
      async (certificationType) => {
        try {
          setProcessingId(id);

          const res = await approve(id, certificationType);

          setTutors((prevTutors) =>
            prevTutors.map((tutor) =>
              tutor.id === id
                ? { ...tutor, isVerified: true, certificationType }
                : tutor,
            ),
          );

          utterToast.success(res.message);
        } catch (error) {
          utterToast.error(errorHandler(error));
        } finally {
          setProcessingId(null);
        }
      },
    );
  };

  const handleReject = (id: string) => {
    const reasonsArray = [
      'cert/Certification document is blurry or unreadable',
      'cert/Uploaded certificate is expired or invalid',
      'video/Introduction video has poor audio or low lighting',
      'video/Introduction video content is unprofessional or incomplete',
      'cert/Certification does not match the subject expertise claimed',
    ];

    const REJECTION_OPTIONS = Object.fromEntries(
      reasonsArray.map((r) => [r, r.split('/')[1]]),
    );

    utterRadioAlert(
      'Choose Rejection Reason',
      REJECTION_OPTIONS,
      'Confirm',
      async (reason) => {
        try {
          setProcessingId(id);

          const res = await reject(id, reason);

          setTutors((prevTutors) =>
            prevTutors.map((tutor) =>
              tutor.id === id
                ? {
                    ...tutor,
                    avatarUrl: `${API_ROUTES.TUTOR.FETCH_AVATAR}/${
                      tutor.id
                    }.jpeg?v=${Date.now()}`,
                    rejectionReason: reason,
                  }
                : tutor,
            ),
          );

          utterToast.info(res.message);
        } catch (error) {
          utterToast.error(errorHandler(error));
        } finally {
          setProcessingId(null);
        }
      },
    );
  };

  const selectedTutor = tutors.find((t) => t.id === selectedTutorId);

  return (
    <div className="w-full">
      <SearchAndFilter
        placeholder="Search tutors..."
        filters={[
          'All',
          'Active',
          'Blocked',
          'Pending',
          'Approved',
          'Rejected',
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
            {filteredTutorsCount}
          </span>{' '}
          results
          {filteredTutorsCount !== totalTutorsCount && (
            <span className="text-black ml-1">
              (Total{' '}
              <span className="text-rose-400 font-medium">
                {totalTutorsCount}
              </span>{' '}
              tutors)
            </span>
          )}
        </p>
      </div>

      {tutors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <MdPeople className="mx-auto w-24 h-24" />
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
          {tutors.map((tutor) => (
            <Card
              key={tutor.id}
              type="tutor"
              id={tutor.id}
              name={tutor.name}
              email={tutor.email}
              avatarUrl={tutor.avatarUrl}
              joinedAt={tutor.createdAt}
              knownLanguages={tutor.knownLanguages}
              yearsOfExperience={`${tutor.yearsOfExperience} years experience`}
              isVerified={tutor.isVerified}
              rejectionReason={tutor.rejectionReason}
              isLoading={processingId === tutor.id}
              status={tutor.isBlocked ? 'Blocked' : 'Active'}
              onViewDetails={handleViewDetails}
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
            avatarUrl: selectedTutor.avatarUrl || '',
            experience: `${selectedTutor.yearsOfExperience} years experience`,
            verified: selectedTutor.isVerified,
            rejectionReason: selectedTutor.rejectionReason || null,
          }}
          introVideoUrl={selectedTutor.introVideoUrl}
          certificateUrl={selectedTutor.certificateUrl}
          certificateType={selectedTutor.certificationType ?? 'Unverified'}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
