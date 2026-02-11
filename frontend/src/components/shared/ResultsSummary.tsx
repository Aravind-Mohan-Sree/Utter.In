import React from 'react';
import { Dropdown } from './Dropdown';

interface ResultsSummaryProps {
    from: number;
    to: number;
    filteredCount: number;
    totalCount: number;
    itemsPerPage: number;
    onItemsPerPageChange: (val: number) => void;
    itemsOptions?: string[];
    hideTotal?: boolean;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
    from,
    to,
    filteredCount,
    totalCount,
    itemsPerPage,
    onItemsPerPageChange,
    itemsOptions = ['3', '6', '9', '15', '21'],
    hideTotal = false,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4 text-black">
            <div className="flex items-center gap-2">
                <p className="text-sm">Items per page</p>
                <Dropdown
                    options={itemsOptions}
                    selected={itemsPerPage.toString()}
                    onSelect={(val) => onItemsPerPageChange(+val)}
                />
            </div>

            <p className="text-sm text-black">
                Showing{' '}
                <span className="font-medium text-rose-400">
                    {filteredCount > 0 ? from : 0}-{to}
                </span>{' '}
                of{' '}
                <span className="font-medium text-rose-400">{filteredCount}</span>{' '}
                results
                {!hideTotal && filteredCount !== totalCount && (
                    <span className="text-black ml-1">
                        (Total <span className="text-rose-400 font-medium">{totalCount}</span>{' '}
                        tutors)
                    </span>
                )}
            </p>
        </div>
    );
};
