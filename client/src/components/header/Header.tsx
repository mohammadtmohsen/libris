import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { logos } from '_assets';
import { useStore } from '_store/useStore';
import { Button, useActionToast } from '_components/shared';
import authServices from '_services/authServices/authServices';
import { getInitialsFromName } from '_utils/helper';
import { UploadBook } from '_pages/dashboard/UploadBooks/UploadBooks';
import { CustomHeaderInput } from './CustomHeaderInput';
import { FilterBooks } from './FilterBooks/FilterBooks';
import type { BookFilters } from '_queries/booksQueries';
import { UsersModalTrigger } from './UsersModal';
import { SeriesModalTrigger } from './SeriesModal';

export const Header = ({
  filters,
  onFilterChange,
  onResetFilters,
  onLogoClick,
}: {
  filters: BookFilters;
  onFilterChange: (filters: BookFilters) => void;
  onResetFilters: () => void;
  onLogoClick?: () => void;
}) => {
  const { loggingData, logoutUser } = useStore();
  const toast = useActionToast();
  const displayName = loggingData?.displayName;
  const isAdmin = (loggingData?.role ?? 'user') === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const hasFiltersApplied = Boolean(
    (filters.search ?? '').trim() ||
      (filters.status?.length ?? 0) ||
      (filters.tags?.length ?? 0) ||
      (filters.seriesIds?.length ?? 0)
  );

  useEffect(() => {
    setSearchValue(filters.search ?? '');
  }, [filters.search]);

  const handleLogout = async () => {
    const farewellName = displayName || loggingData?.username || 'Reader';

    try {
      toast.showToast({
        title: 'Closing this chapter…',
        description:
          'Tucking your session between the pages while we log you out.',
      });
      await authServices.logout();
      logoutUser();
      toast.showSuccess({
        title: `Bookmark saved, ${farewellName}!`,
        description:
          'You are signed out, shelves are tidy, and your spot is saved for next time.',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      logoutUser();
      toast.showError({
        title: 'Offline plot twist',
        description:
          'Server missed the ending, but we closed your local chapter anyway.',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    const nextValue = typeof value === 'string' ? value : '';
    setSearchValue(nextValue);
  };

  const handleDebouncedSearchChange = (value: string) => {
    const nextValue = typeof value === 'string' ? value : '';
    if (nextValue === filters.search) return;
    onFilterChange({ ...filters, search: nextValue });
  };

  const toggleExpanded = () => setIsExpanded((prev) => !prev);
  const handleUploadOpen = () => setIsExpanded(false);
  const handleUsersOpen = () => setIsExpanded(false);
  const handleSeriesOpen = () => setIsExpanded(false);

  const handleResetAll = () => {
    setIsExpanded(false);
    setSearchValue('');
    onResetFilters();
  };

  const handleLogoClick = () => {
    onLogoClick?.();
  };

  return (
    <div className='sticky top-0 z-30 shrink-0 bg-black-1 p-3 backdrop-blur sm:px-4 sm:pt-4'>
      <div className='flex flex-col'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleLogoClick}
            className='h-12 shrink-0 rounded-md border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/60 focus-visible:ring-offset-0'
            aria-label='Scroll to top'
          >
            <img
              src={logos.librisLogo}
              alt='Libris'
              className='h-full w-full object-contain'
            />
          </button>
          <div className='flex-1 min-w-[100px]'>
            <CustomHeaderInput
              value={searchValue}
              placeholder='ابحث عن كتاب أو مؤلف'
              isExpanded={isExpanded}
              onChange={handleSearchChange}
              onDebouncedChange={handleDebouncedSearchChange}
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
                ? 'opacity-100 translate-y-0 pt-3 pb-2'
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
                  <SeriesModalTrigger onOpen={handleSeriesOpen} />
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
