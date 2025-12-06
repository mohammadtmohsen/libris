import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { logos } from '_assets';
import { useStore } from '_store/useStore';
import { Button } from '_components/shared';
import authServices from '_services/authServices/authServices';
import { getInitialsFromName } from '_utils/helper';
import { UploadBook } from '_pages/dashboard/UploadBooks/UploadBooks';
import { CustomHeaderInput } from './CustomHeaderInput';
import { FilterBooks } from './FilterBooks/FilterBooks';
import type { BookFilters } from '_queries/booksQueries';
import { UsersModalTrigger } from './UsersModal';

export const Header = ({
  filters,
  onFilterChange,
  onResetFilters,
}: {
  filters: BookFilters;
  onFilterChange: (filters: BookFilters) => void;
  onResetFilters: () => void;
}) => {
  const { loggingData, logoutUser } = useStore();
  const displayName = loggingData?.displayName;
  const isAdmin = (loggingData?.role ?? 'user') === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const hasFiltersApplied = Boolean(
    (filters.search ?? '').trim() ||
      (filters.status?.length ?? 0) ||
      (filters.tags?.length ?? 0)
  );

  useEffect(() => {
    setSearchValue(filters.search ?? '');
  }, [filters.search]);

  const handleLogout = async () => {
    try {
      await authServices.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logoutUser();
    }
  };

  const handleSearchChange = (value: string) => {
    const nextValue = typeof value === 'string' ? value : '';
    setSearchValue(nextValue);
    onFilterChange({ ...filters, search: nextValue });
  };

  const toggleExpanded = () => setIsExpanded((prev) => !prev);
  const handleUploadOpen = () => setIsExpanded(false);
  const handleUsersOpen = () => setIsExpanded(false);
  const handleResetAll = () => {
    setIsExpanded(false);
    setSearchValue('');
    onResetFilters();
  };

  return (
    <div className='shrink-0 rounded-2xl bg-black-1 shadow-[0_16px_46px_rgba(0,0,0,0.32)]'>
      <div className='flex flex-col gap-3 rounded-secondary'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-3'>
            <img
              src={logos.librisLogo}
              className='h-12 w-16 shrink-0 object-contain'
            />
          </div>

          <div className='flex-1 min-w-[240px]'>
            <CustomHeaderInput
              value={searchValue}
              placeholder='ابحث عن كتاب أو مؤلف'
              isExpanded={isExpanded}
              onChange={handleSearchChange}
              onClear={handleResetAll}
              onToggleExpand={toggleExpanded}
              showClear={hasFiltersApplied}
            />
          </div>
        </div>

        <div
          className={clsx(
            'overflow-hidden transition-[max-height] duration-300 ease-in-out',
            isExpanded ? 'max-h-[1200px]' : 'max-h-0'
          )}
        >
          <div
            className={clsx(
              'grid gap-3 md:grid-cols-[1fr_auto] transition-[opacity,transform,padding] duration-300 ease-in-out',
              isExpanded
                ? 'opacity-100 translate-y-0 pt-3 pb-4'
                : 'pointer-events-none opacity-0 -translate-y-3 pt-0 pb-0'
            )}
          >
            <div className={clsx('flex flex-wrap items-center gap-3')}>
              <FilterBooks filters={filters} onApplyFilters={onFilterChange} />
            </div>

            <div className={clsx('flex flex-wrap items-end justify-end gap-3')}>
              {isAdmin && (
                <>
                  <UploadBook onOpen={handleUploadOpen} />
                  <UsersModalTrigger onOpen={handleUsersOpen} />
                </>
              )}
              <div className='flex items-center gap-2 rounded-full bg-white/5 xpx-3 xpy-1.5 text-sm font-semibold text-white/85'>
                <span className='grid h-[42px] w-[42px] place-items-center rounded-full bg-blue-1/20 text-white'>
                  {getInitialsFromName(displayName)}
                </span>
              </div>
              <Button
                iconButton='logout'
                onClick={handleLogout}
                variant='primaryOutline'
                aria-label='Logout'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
