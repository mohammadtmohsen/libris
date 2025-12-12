import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomSelect } from '_components/shared';
import { ARABIC_BOOK_TAGS, READING_STATUSES } from '_constants/filtersOptions';
import type { BookFilters } from '_queries/booksQueries';
import type { ProgressStatus } from '_queries/progressQueries';
import { useGetSeries } from '_queries/seriesQueries';

const buildFilters = (filters?: BookFilters): BookFilters => ({
  search: filters?.search ?? '',
  status: [...(filters?.status ?? [])],
  tags: [...(filters?.tags ?? [])],
  seriesIds: [...(filters?.seriesIds ?? [])],
});

export const FilterBooks = ({
  filters,
  onApplyFilters,
}: {
  filters: BookFilters;
  onApplyFilters: (filters: BookFilters) => void;
}) => {
  const { data: seriesList = [], isLoading: isSeriesLoading } = useGetSeries();
  const seriesOptions = useMemo(
    () =>
      seriesList.map((series) => ({
        label: series.name,
        value: series._id,
        customLabel:
          typeof series.totalParts === 'number'
            ? `${series.name} (${series.totalParts} parts)`
            : series.name,
      })),
    [seriesList]
  );
  const normalizedFilters = useMemo(() => buildFilters(filters), [filters]);
  const [formFilters, setFormFilters] =
    useState<BookFilters>(normalizedFilters);
  const hasInteractedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFormFilters(normalizedFilters);
  }, [normalizedFilters]);

  useEffect(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onApplyFilters(
        buildFilters({ ...formFilters, search: normalizedFilters.search })
      );
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formFilters, normalizedFilters.search, onApplyFilters]);

  return (
    <div className='w-full rounded-xl bg-black-1/90'>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
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
        <CustomSelect
          label='Series'
          options={seriesOptions}
          placeholder='Filter by series'
          isMulti
          isLoading={isSeriesLoading}
          value={formFilters.seriesIds}
          onChange={(value) =>
            setFormFilters((prev) => ({
              ...prev,
              seriesIds: (value as string[]) || [],
            }))
          }
        />
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
    </div>
  );
};
