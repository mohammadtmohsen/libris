import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  CustomSelect,
  Input,
  Modal,
  useModal,
} from '_components/shared';
import { ARABIC_BOOK_TAGS, READING_STATUSES } from '_constants/filtersOptions';
import type { BookFilters } from '_queries/booksQueries';
import type { ProgressStatus } from '_queries/progressQueries';

const buildFilters = (filters?: BookFilters): BookFilters => ({
  search: filters?.search ?? '',
  status: [...(filters?.status ?? [])],
  tags: [...(filters?.tags ?? [])],
});

const getActiveFiltersCount = (filters: BookFilters) => {
  const searchCount = filters.search?.trim() ? 1 : 0;
  const statusCount = filters.status?.length ?? 0;
  const tagsCount = filters.tags?.length ?? 0;
  return searchCount + statusCount + tagsCount;
};

const FilterPreview = ({ filters }: { filters: BookFilters }) => {
  const statusLabels = useMemo(
    () =>
      READING_STATUSES.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {}),
    []
  );

  const badges: string[] = [];
  const tags = filters.tags ?? [];
  const statuses = filters.status ?? [];

  if (filters.search?.trim()) {
    badges.push(`Search: ${filters.search.trim()}`);
  }

  statuses.forEach((status) =>
    badges.push(`Status: ${statusLabels[status] ?? status}`)
  );
  tags.slice(0, 5).forEach((tag) => badges.push(`Tag: ${tag}`));

  const overflowTags = Math.max(tags.length - 5, 0);

  return (
    <div className='flex flex-wrap gap-2 rounded-primary bg-white/5 px-4 py-3 ring-1 ring-white/10'>
      {badges.length === 0 ? (
        <span className='text-sm text-white/70'>
          No filters applied. Use the controls below to narrow the library.
        </span>
      ) : (
        badges.map((badge, idx) => (
          <span
            key={`${badge}-${idx}`}
            className='rounded-full bg-white/10 px-3 py-1 text-xs text-white shadow-inner ring-1 ring-white/15'
          >
            {badge}
          </span>
        ))
      )}
      {overflowTags > 0 && (
        <span className='rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 ring-1 ring-white/15'>
          +{overflowTags} more tags
        </span>
      )}
    </div>
  );
};

const FilterBooksForm = ({
  initialFilters,
  onApply,
  onCancel,
  onReset,
}: {
  initialFilters: BookFilters;
  onApply: (filters: BookFilters) => void;
  onCancel: () => void;
  onReset: () => void;
}) => {
  const [formFilters, setFormFilters] = useState<BookFilters>(
    buildFilters(initialFilters)
  );
  const activeCount = getActiveFiltersCount(formFilters);

  useEffect(() => {
    setFormFilters(buildFilters(initialFilters));
  }, [initialFilters]);

  const handleApply = () => {
    onApply(buildFilters(formFilters));
  };

  const handleReset = () => {
    const cleared = buildFilters();
    setFormFilters(cleared);
    onReset();
  };

  return (
    <div className='relative m-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-blue-1/12 via-black-2/80 to-black-1 p-4 sm:p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-1/15 blur-3xl' />
        <div className='absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-green-1/12 blur-3xl' />
      </div>

      <div className='relative space-y-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-[11px] uppercase tracking-[0.14em] text-white/60'>
              Filter library
            </p>
            <h2 className='text-2xl font-semibold leading-tight text-white'>
              Narrow down your stack
            </h2>
            <p className='max-w-2xl text-sm text-white/75'>
              Combine text search with reading statuses and categories to find
              the right book faster.
            </p>
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10'>
            {activeCount} active filter
            {activeCount === 1 ? '' : 's'}
          </div>
        </div>

        <FilterPreview filters={formFilters} />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Input
            label='Search by title or author'
            placeholder='مثال: الخيميائي / Paulo Coelho'
            value={formFilters.search}
            onChange={(value) =>
              setFormFilters((prev) => ({ ...prev, search: value || '' }))
            }
          />
          <CustomSelect
            label='Reading status'
            options={READING_STATUSES}
            placeholder='Select status'
            isMulti
            value={formFilters.status}
            onChange={(value) =>
              setFormFilters((prev) => ({
                ...prev,
                status: (value as ProgressStatus[]) || [],
              }))
            }
          />
        </div>

        <div className='grid grid-cols-1 gap-3'>
          <CustomSelect
            label='Category tags'
            options={ARABIC_BOOK_TAGS}
            placeholder='Select by category'
            dir='rtl'
            isMulti
            value={formFilters.tags}
            onChange={(value) =>
              setFormFilters((prev) => ({
                ...prev,
                tags: (value as string[]) || [],
              }))
            }
          />
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Button
            variant='neutral'
            onClick={onCancel}
            className='w-full sm:w-auto'
          >
            Close
          </Button>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              className='w-full sm:w-auto'
            >
              Reset filters
            </Button>
            <Button
              type='button'
              onClick={handleApply}
              className='w-full min-w-[140px] sm:w-auto'
            >
              Apply filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FilterBooks = ({
  filters,
  onApplyFilters,
  onResetFilters,
}: {
  filters: BookFilters;
  onApplyFilters: (filters: BookFilters) => void;
  onResetFilters: () => void;
}) => {
  const normalizedFilters = useMemo(() => buildFilters(filters), [filters]);
  const filterModal = useModal({
    content: ({ close }) => (
      <FilterBooksForm
        initialFilters={normalizedFilters}
        onCancel={close}
        onApply={(next) => {
          onApplyFilters(buildFilters(next));
          close();
        }}
        onReset={() => {
          onResetFilters();
        }}
      />
    ),
  });

  const appliedFiltersCount = getActiveFiltersCount(normalizedFilters);

  return (
    <>
      <div className='relative'>
        <Button
          variant='outline'
          leftIcon='filter'
          onClick={() => filterModal.open({})}
          className='!h-10 !px-4 border-white/20 bg-white/5 text-white/90 hover:border-blue-1/40 hover:bg-blue-1/10'
        >
          Filters
          {appliedFiltersCount > 0 && (
            <span className='ml-2 rounded-full bg-blue-1/15 px-2 py-[2px] text-xs text-blue-1 ring-1 ring-blue-1/30'>
              {appliedFiltersCount}
            </span>
          )}
        </Button>
      </div>
      <Modal {...filterModal} />
    </>
  );
};
