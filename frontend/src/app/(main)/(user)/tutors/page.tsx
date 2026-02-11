'use client';

import { useState, useEffect } from 'react';
import { SearchAndFilter } from '~components/admin/SearchAndFilter';
import { Card } from '~components/admin/Card';
import { Pagination } from '~components/shared/Pagination';
import { MdPeople } from 'react-icons/md';
import { fetchTutors } from '~services/user/tutorService';
import { utterToast } from '~utils/utterToast';
import { errorHandler } from '~utils/errorHandler';
import { Dropdown } from '~components/shared/Dropdown';
import { API_ROUTES } from '~constants/routes';
import { ResultsSummary } from '~components/shared/ResultsSummary';
import Loader from '~components/shared/Loader';
import { BiExpand } from 'react-icons/bi';
import AbstractShapesBackground from '~components/shared/AbstractShapesBackground';
import { useRouter } from 'next/navigation';

interface Tutor {
    id: string;
    name: string;
    avatarUrl: string;
    knownLanguages: string[];
    yearsOfExperience: string;
    bio: string;
    createdAt: Date;
}

const commonLanguages = [
    'All',
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Korean',
    'Hindi',
    'Arabic',
    'Russian',
    'Portuguese',
    'Italian',
    'Dutch',
    'Turkish',
    'Vietnamese',
];

export default function TutorsPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [itemsOptions] = useState(['3', '6', '9', '15', '21']);
    const [sortBy, setSortBy] = useState('Newest');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [totalTutorsCount, setTotalTutorsCount] = useState(0);
    const [filteredTutorsCount, setFilteredTutorsCount] = useState(0);
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const totalPages = Math.ceil(filteredTutorsCount / itemsPerPage);
    const from = filteredTutorsCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, filteredTutorsCount);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        (async () => {
            try {

                let sortParam = 'newest';
                if (sortBy === 'Oldest') sortParam = 'oldest';
                else if (sortBy === 'A-Z') sortParam = 'a-z';
                else if (sortBy === 'Z-A') sortParam = 'z-a';

                const res = await fetchTutors(
                    currentPage,
                    itemsPerPage,
                    debouncedQuery,
                    sortParam,
                    selectedLanguage
                );

                const mappedTutors = res.tutorsData.tutors.map((tutor: any) => ({
                    ...tutor,
                    avatarUrl: `${API_ROUTES.TUTOR.FETCH_AVATAR}/${tutor.id
                        }.jpeg?v=${Date.now()}`,
                }));

                setTotalTutorsCount(res.tutorsData.totalTutorsCount);
                setFilteredTutorsCount(res.tutorsData.filteredTutorsCount);
                setTutors(mappedTutors);
            } catch (error) {
                utterToast.error(errorHandler(error));
            } finally {
                setLoading(false);
            }
        })();
    }, [debouncedQuery, sortBy, selectedLanguage, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 overflow-hidden">
            <AbstractShapesBackground />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">

                <div className="mb-8 space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Find a Tutor</h1>
                        <p className="text-gray-500 mt-1">Connect with expert language tutors from around the world</p>
                    </div>

                    <div className="relative z-20 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
                        <SearchAndFilter
                            placeholder="Search by name or language..."
                            filters={['Newest', 'Oldest', 'A-Z', 'Z-A']}
                            activeFilter={sortBy}
                            onFilterChange={(val) => {
                                setSortBy(val);
                                setCurrentPage(1);
                            }}
                            searchValue={searchQuery}
                            onSearchChange={(val) => {
                                setSearchQuery(val);
                                currentPage !== 1 && setCurrentPage(1);
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
                </div>

                {/* Results Summary */}
                <ResultsSummary
                    from={from}
                    to={to}
                    filteredCount={filteredTutorsCount}
                    totalCount={totalTutorsCount}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                    }}
                    itemsOptions={itemsOptions}
                    hideTotal={true}
                />

                {/* Grid */}
                {loading ? (
                    <Loader />
                ) : tutors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="text-gray-300 mb-4">
                            <MdPeople className="mx-auto w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No tutors found
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-md">
                            Try adjusting your search or filter criteria.
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
                                email=""
                                avatarUrl={tutor.avatarUrl}
                                joinedAt={tutor.createdAt}
                                knownLanguages={tutor.knownLanguages}
                                yearsOfExperience={`${tutor.yearsOfExperience} years experience`}
                                isVerified={true}
                                rejectionReason={null}
                                isLoading={false}
                                status="Active"
                                hideStatus={true}
                                viewDetailsIcon={<BiExpand size={23} />}
                                onViewDetails={(id: string) => {
                                    router.push(`/tutors/${id}`);
                                }}
                                className="bg-white/50 backdrop-blur-sm"
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
