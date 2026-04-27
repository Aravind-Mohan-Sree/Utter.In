'use client';

import { useEffect, useState } from 'react';
import { MdPeople } from 'react-icons/md';
import { useSelector } from 'react-redux';

import { SearchAndFilter } from '~components/form/SearchAndFilter';
import { DetailsModal } from '~components/modals';
import { Card } from '~components/ui/Card';
import { Pagination } from '~components/ui/Pagination';
import { ResultsSummary } from '~components/ui/ResultsSummary';
import { API_ROUTES } from '~constants/routes';
import {
  approve,
  fetchTutors,
  reject,
  toggleStatus,
  verifyLanguages,
} from '~services/admin/tutorsService';
import { RootState } from '~store/rootReducer';
import { errorHandler } from '~utils/errorHandler';
import { utterRadioAlert } from '~utils/utterRadioAlert';
import { utterToast } from '~utils/utterToast';

interface Tutor {
  id: string;
  name: string;
  email: string;
  introVideoUrl: string;
  certificationType: string[];
  knownLanguages: string[];
  yearsOfExperience: string;
  rejectionReason: string | null;
  bio: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  pendingLanguages: string[];
  pendingCertification: string | null;
  languageVerificationStatus: 'pending' | 'approved' | 'rejected' | null;
  certificates: string[];
  createdAt: string;
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
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const totalPages = Math.ceil(filteredTutorsCount / itemsPerPage);
  const from =
    filteredTutorsCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, filteredTutorsCount);

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
        const res = await fetchTutors(
          currentPage,
          itemsPerPage,
          debouncedQuery,
          activeFilter,
        );

        const tutors = res.tutorsData.tutors.map((tutor: Tutor) => ({
          ...tutor,
          introVideoUrl: `${API_ROUTES.TUTOR.FETCH_VIDEO}/${tutor.id}.mp4?v=${Date.now()}`,
        }));

        setTotalTutorsCount(res.tutorsData.totalTutorsCount);
        setFilteredTutorsCount(res.tutorsData.filteredTutorsCount);
        setTutors(tutors);
      } catch (error) {
        utterToast.error(errorHandler(error));
      } finally {
        setLoading(false);
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
                ? { ...tutor, isVerified: true, certificationType: [certificationType] }
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

  const handleVerifyLanguages = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
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
            const res = await verifyLanguages(id, action, certificationType);

            setTutors((prevTutors) =>
              prevTutors.map((tutor) =>
                tutor.id === id
                  ? {
                    ...tutor,
                    knownLanguages: [...tutor.knownLanguages, ...tutor.pendingLanguages],
                    certificates: tutor.pendingCertification
                      ? [...tutor.certificates, tutor.pendingCertification]
                      : tutor.certificates,
                    certificationType: tutor.certificationType.includes(certificationType)
                      ? tutor.certificationType
                      : [...tutor.certificationType, certificationType],
                    pendingLanguages: [],
                    pendingCertification: null,
                    languageVerificationStatus: null,
                  }
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
    } else {
      const reasonsArray = [
        'cert/Certification document is blurry or unreadable',
        'cert/Uploaded certificate is expired or invalid',
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
            const res = await verifyLanguages(id, action, undefined, reason);

            setTutors((prevTutors) =>
              prevTutors.map((tutor) =>
                tutor.id === id
                  ? {
                    ...tutor,
                    pendingLanguages: [],
                    pendingCertification: null,
                    languageVerificationStatus: null,
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
    }
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
          'LanguageVerificationPending',
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

      <ResultsSummary
        from={from}
        to={to}
        filteredCount={filteredTutorsCount}
        totalCount={totalTutorsCount}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        itemsOptions={itemsOptions}
        label="tutors"
      />

      {loading && tutors.length === 0 ? (
        <div className="h-[40vh] w-full flex flex-col items-center justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[5px] border-rose-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-[5px] border-transparent border-t-rose-500 rounded-full animate-spin"></div>
            <div className="absolute inset-5 bg-rose-500/5 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Retrieving Tutors</p>
        </div>
      ) : tutors.length === 0 ? (
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
            experience: `${selectedTutor.yearsOfExperience} years experience`,
            verified: selectedTutor.isVerified,
            rejectionReason: selectedTutor.rejectionReason || null,
          }}
          introVideoUrl={selectedTutor.introVideoUrl}
          certificateTypes={selectedTutor.certificationType || []}
          certificates={selectedTutor.certificates || []}
          onApprove={handleApprove}
          onReject={handleReject}
          pendingLanguages={selectedTutor.pendingLanguages}
          pendingCertificationUrl={selectedTutor.pendingCertification ? selectedTutor.pendingCertification : null}
          languageVerificationStatus={selectedTutor.languageVerificationStatus}
          onVerifyLanguages={handleVerifyLanguages}
        />
      )}
    </div>
  );
}
