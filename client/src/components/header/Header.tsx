import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { logos } from '_assets';
import { useStore } from '_store/useStore';
import { FlyoutMenu, Icon, IconType, useActionToast } from '_components/shared';
import authServices from '_services/authServices/authServices';
import { getInitialsFromName } from '_utils/helper';
import { UploadBook } from '_pages/dashboard/UploadBooks/UploadBooks';
import { UploadBulkBooks } from '_pages/dashboard/UploadBooks/UploadBulkBooks';
import { CustomHeaderInput } from './CustomHeaderInput';
import { FilterBooks } from './FilterBooks/FilterBooks';
import type { BookFilters } from '_queries/booksQueries';
import { UsersModalTrigger } from './UsersModal';
import { SeriesModalTrigger } from './SeriesModal';

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
  const toast = useActionToast();
  const displayName = loggingData?.displayName;
  const isAdmin = (loggingData?.role ?? 'user') === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search ?? '');
  const userLabel = displayName || loggingData?.username || 'User';
  const userInitials = getInitialsFromName(userLabel) || 'U';
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
  const handleMenuAction = (closeMenu: () => void) => {
    setIsExpanded(false);
    closeMenu();
  };

  const handleResetAll = () => {
    setIsExpanded(false);
    setSearchValue('');
    onResetFilters();
  };

  const handleLogoClick = () => {
    setIsExpanded(false);
    setSearchValue('');
    onResetFilters();
    if (typeof window !== 'undefined') {
      setTimeout(() => window.location.reload(), 0);
    }
  };

  const handleLogoutClick = async (closeMenu: () => void) => {
    handleMenuAction(closeMenu);
    await handleLogout();
  };

  const menuItemBaseClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2';
  const renderMenuItem = (
    label: string,
    icon: IconType,
    onClick: () => void,
    tone: 'default' | 'danger' = 'default'
  ) => {
    const isDanger = tone === 'danger';
    return (
      <button
        type='button'
        role='menuitem'
        onClick={onClick}
        className={clsx(
          menuItemBaseClass,
          isDanger
            ? 'text-red-1 hover:bg-red-1/15 focus-visible:ring-red-1/40'
            : 'text-white/85 hover:bg-blue-1/15 hover:text-white focus-visible:ring-blue-1/45'
        )}
      >
        <Icon
          type={icon}
          fontSize='small'
          className={clsx(isDanger ? 'text-red-1' : 'text-blue-1')}
        />
        <span>{label}</span>
      </button>
    );
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
              toggleClassName='md:hidden'
            />
          </div>
          <FlyoutMenu
            containerClassName='hidden md:block shrink-0'
            ignoreOutsideClickSelector='.react-select__menu, .react-select__menu-list, .react-select__option, .react-select__menu-portal'
            trigger={({ isOpen, toggle, triggerProps }) => (
              <button
                {...triggerProps}
                type='button'
                onClick={toggle}
                className={clsx(
                  'flex items-center gap-2 rounded-full bg-blue-1/5 px-3 py-2 text-sm font-semibold text-white/85 ring-1 ring-blue-1/90',
                  'transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/60'
                )}
              >
                <Icon
                  type='filterOn'
                  fontSize='small'
                  className='text-blue-1'
                />
                <span>Filters</span>
                {hasFiltersApplied && (
                  <span className='h-2 w-2 rounded-full bg-blue-1' />
                )}
                <Icon
                  type={isOpen ? 'chevronUp' : 'chevronDown'}
                  fontSize='small'
                  className='text-blue-1'
                />
              </button>
            )}
            menu={({ isOpen, menuProps }) => (
              <div
                {...menuProps}
                aria-hidden={!isOpen}
                className={clsx(
                  'absolute right-0 z-40 mt-2 w-[90vw] max-w-[860px] origin-top-right rounded-2xl bg-black-2/95 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.45)]',
                  'ring-1 ring-blue-1/20 backdrop-blur transition-[opacity,transform] duration-150 ease-out',
                  isOpen
                    ? 'scale-100 opacity-100'
                    : 'pointer-events-none scale-95 opacity-0'
                )}
              >
                <FilterBooks
                  filters={filters}
                  onApplyFilters={onFilterChange}
                />
              </div>
            )}
          />
          <FlyoutMenu
            containerClassName='shrink-0'
            trigger={({ toggle, triggerProps }) => (
              <button
                {...triggerProps}
                type='button'
                onClick={toggle}
                className={clsx(
                  'h-9 w-9 rounded-full bg-blue-1/20 text-center text-white text-sm font-semibold ring-1 ring-blue-1',
                  'transition hover:bg-blue-1/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/60'
                )}
              >
                {userInitials}
              </button>
            )}
            menu={({ isOpen, close, menuProps }) => (
              <div
                {...menuProps}
                aria-hidden={!isOpen}
                className={clsx(
                  'absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-xl bg-black-2/95 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)]',
                  'ring-1 ring-blue-1/20 backdrop-blur transition-[opacity,transform] duration-150 ease-out',
                  isOpen
                    ? 'scale-100 opacity-100'
                    : 'pointer-events-none scale-95 opacity-0'
                )}
              >
                <div className='flex flex-col gap-1'>
                  {isAdmin && (
                    <>
                      <UploadBook
                        onOpen={() => handleMenuAction(close)}
                        trigger={({ onClick }) =>
                          renderMenuItem('Add book', 'add', onClick)
                        }
                      />
                      <UploadBulkBooks
                        onOpen={() => handleMenuAction(close)}
                        trigger={({ onClick }) =>
                          renderMenuItem('Add bulk book', 'book', onClick)
                        }
                      />
                      <SeriesModalTrigger
                        onOpen={() => handleMenuAction(close)}
                        trigger={({ onClick }) =>
                          renderMenuItem('Manage series', 'series', onClick)
                        }
                      />
                      <UsersModalTrigger
                        onOpen={() => handleMenuAction(close)}
                        trigger={({ onClick }) =>
                          renderMenuItem('Manage users', 'users', onClick)
                        }
                      />
                      <div className='my-1 h-px w-full bg-white/5' />
                    </>
                  )}
                  {renderMenuItem(
                    'Logout',
                    'logout',
                    () => handleLogoutClick(close),
                    'danger'
                  )}
                </div>
              </div>
            )}
          />
        </div>

        <div
          className={clsx(
            'md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out',
            isExpanded ? 'max-h-[1200px]' : 'max-h-0'
          )}
        >
          <div
            className={clsx(
              'grid gap-3 transition-[opacity,transform,padding] duration-300 ease-in-out',
              isExpanded
                ? 'opacity-100 translate-y-0 pt-3 pb-2'
                : 'pointer-events-none opacity-0 -translate-y-3 pt-0 pb-0'
            )}
          >
            <div className={clsx('flex flex-wrap items-center gap-3')}>
              <FilterBooks filters={filters} onApplyFilters={onFilterChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
