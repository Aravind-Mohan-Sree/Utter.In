'use client';

import { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiSlash } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import { Card } from '~components/ui/Card';
import { SearchAndFilter } from '~components/form/SearchAndFilter';
import { commonLanguages } from '~components/form/LanguagesInput';
import AbstractShapesBackground from '~components/ui/AbstractShapesBackground';
import Button from '~components/ui/Button';
import Loader from '~components/ui/Loader';
import { Pagination } from '~components/ui/Pagination';
import { ResultsSummary } from '~components/ui/ResultsSummary';
import { API_ROUTES } from '~constants/routes';
import {
  decrementSessionCount,
  fetchSessionCount,
  updateSessionCount,
} from '~features/bookingSlice';
import {
  Booking,
  cancelBooking,
  getBookings,
  GetBookingsParams,
} from '~services/shared/bookingService';
import { RootState } from '~store/rootReducer';
import { errorHandler } from '~utils/errorHandler';
import { utterAlert } from '~utils/utterAlert';
import { utterToast } from '~utils/utterToast';

export default function SessionsPage() {
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, Action>>();
  const [upcomingSessions, setUpcomingSessions] = useState<Booking[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Booking[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const fetchVersionRef = useRef(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [itemsOptions] = useState(['5', '10', '15', '20']);
  const [sort, setSort] = useState<'Newest' | 'Oldest'>('Newest');
  const [language, setLanguage] = useState(
    searchParams.get('language') || 'All',
  );
  const [date] = useState(searchParams.get('date') || '');
  const [totalResults, setTotalResults] = useState(0);

  /**
   * fetchBookings wrapped in useCallback to stabilize the reference.
   * This prevents the useEffect from re-running on every render.
   */
  const fetchBookings = useCallback(async () => {
    if (!user?.role) return;
    const currentVersion = ++fetchVersionRef.current;

    try {
      setLoading(true);
      const params: GetBookingsParams = {
        page: currentPage,
        limit: itemsPerPage,
        search,
        status: 'Completed',
        language: language === 'All' ? undefined : language,
        date: date || undefined,
        sort: sort,
      };

      const response = await getBookings(params, user.role);

      if (currentVersion !== fetchVersionRef.current) return;

      setUpcomingSessions(response.upcoming);
      dispatch(updateSessionCount(response.upcoming.length));
      setCompletedSessions(response.history.data);
      setTotalPages(response.history.totalPage);
      setTotalResults(response.history.totalCount);

      if (
        response.history.currentPage > response.history.totalPage &&
        response.history.totalPage > 0
      ) {
        setCurrentPage(1);
      }
    } catch (error) {
      utterToast.error(errorHandler(error));
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, sort, language, date, user?.role]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearch(term);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort as 'Newest' | 'Oldest');
    setCurrentPage(1);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCurrentPage(1);
  };

  const handleCancel = (bookingId: string) => {
    return utterAlert({
      title: 'Cancel Session',
      text: 'Are you sure you want to cancel this session? Cancellation is only allowed up to 1 hour before.',
      icon: 'warning',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep',
      showCancel: true,
      onConfirm: async () => {
        try {
          if (!user?.role) return;
          setCancellingId(bookingId);
          await cancelBooking(bookingId, user.role);
          utterToast.success('Session cancelled successfully');
          dispatch(decrementSessionCount());
          dispatch(fetchSessionCount(user.role));
          await fetchBookings();
        } catch (error) {
          utterToast.error(errorHandler(error));
        } finally {
          setCancellingId(null);
          await fetchBookings();
        }
      },
    });
  };

  const getAvatarUrl = (booking: Booking) => {
    if (booking.otherPartyAvatar) return booking.otherPartyAvatar;

    const baseUrl =
      booking.otherPartyRole === 'tutor'
        ? API_ROUTES.TUTOR.FETCH_AVATAR
        : API_ROUTES.USER.FETCH_AVATAR;
    return `${baseUrl}/${booking.otherPartyId}.jpeg?v=${Date.now()}`;
  };

  const from = totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-rose-50 overflow-hidden">
      {loading && <Loader />}
      <AbstractShapesBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 !pt-32">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="mt-2 text-gray-600">
              View and manage your upcoming and past sessions.
            </p>
          </div>

          {/* Upcoming Sessions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upcoming Sessions
            </h2>
            {loading && upcomingSessions.length === 0 ? (
              <div className="flex justify-center py-10"></div>
            ) : upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions.map((booking) => (
                  <div key={booking.id}>
                    <Card
                      type="tutor"
                      id={booking.id}
                      name={booking.otherPartyName}
                      avatarUrl={getAvatarUrl(booking)}
                      email={booking.topic}
                      yearsOfExperience=""
                      knownLanguages={[booking.language]}
                      status={
                        booking.status as
                        | 'Available'
                        | 'Booked'
                        | 'Completed'
                        | 'Cancelled'
                      }
                      hideStatus={true}
                      joinedAt={new Date(booking.date)}
                      dateLabel="Scheduled for"
                      isVerified={true}
                      rejectionReason={null}
                      isLoading={cancellingId === booking.id}
                      disabled={!!cancellingId}
                      showTime={true}
                      customActions={
                        <Button
                          variant="outline"
                          icon={<FiSlash size={22} />}
                          className={`text-gray-400! h-fit rounded-lg p-0.5! transition-colors duration-200! hover:text-red-500! hover:bg-red-50`}
                          onClick={() => handleCancel(booking.id)}
                          title="Cancel Session"
                        />
                      }
                      className="bg-white/50 backdrop-blur-sm"
                      onCancel={undefined}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">No upcoming sessions found.</p>
              </div>
            )}
          </section>

          {/* Completed Sessions */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Completed Sessions
              </h2>
            </div>

            <SearchAndFilter
              searchValue={search}
              onSearchChange={handleSearch}
              activeFilter={sort}
              onFilterChange={handleSortChange}
              selectedLanguage={language}
              onLanguageSelect={handleLanguageChange}
              filters={['Newest', 'Oldest']}
              languageOptions={['All', ...commonLanguages]}
              placeholder="Search history..."
              className="mb-4"
              languageOptionsClassName="max-h-60 overflow-y-auto w-40 no-scrollbar"
            />

            <ResultsSummary
              from={from}
              to={to}
              filteredCount={to}
              totalCount={to}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              itemsOptions={itemsOptions}
              hideTotal={true}
            />

            {loading && completedSessions.length === 0 ? (
              <div className="flex justify-center py-10"></div>
            ) : completedSessions.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedSessions.map((booking) => (
                    <Card
                      key={booking.id}
                      type="tutor"
                      id={booking.id}
                      name={booking.otherPartyName}
                      avatarUrl={getAvatarUrl(booking)}
                      email={booking.topic}
                      yearsOfExperience=""
                      knownLanguages={[booking.language]}
                      status={
                        booking.status as
                        | 'Available'
                        | 'Booked'
                        | 'Completed'
                        | 'Cancelled'
                      }
                      hideStatus={true}
                      joinedAt={new Date(booking.date)}
                      dateLabel="Scheduled"
                      isVerified={true}
                      rejectionReason={null}
                      isLoading={false}
                      showTime={true}
                    />
                  ))}
                </div>

                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">No completed sessions found.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
