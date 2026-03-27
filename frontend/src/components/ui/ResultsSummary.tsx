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
    label?: string;
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
    label = 'results',
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4 text-black">
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700">Items per page</p>
                <Dropdown
                    options={itemsOptions}
                    selected={itemsPerPage.toString()}
                    onSelect={(val) => onItemsPerPageChange(+val)}
                    className="min-w-[80px]"
                />
            </div>

            <p className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-bold text-rose-500">
                    {filteredCount > 0 ? from : 0}-{to}
                </span>{' '}
                of{' '}
                <span className="font-bold text-rose-500">{filteredCount}</span>{' '}
                {label}
                {!hideTotal && filteredCount !== totalCount && (
                    <span className="text-gray-400 ml-1">
                        (Total <span className="text-rose-500 font-bold">{totalCount}</span> overall)
                    </span>
                )}
            </p>
        </div>
    );
};
