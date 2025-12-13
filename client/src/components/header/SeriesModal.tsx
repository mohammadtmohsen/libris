import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  Icon,
  Input,
  Modal,
  useModal,
  useActionToast,
} from '_components/shared';
import {
  useCreateSeries,
  useDeleteSeries,
  useGetSeries,
  useUpdateSeries,
} from '_queries/seriesQueries';
import type { Series } from '_queries/seriesQueries';

type SeriesForm = {
  name: string;
  totalParts?: number | '';
};

const defaultValues: SeriesForm = { name: '', totalParts: '' };

const SeriesModalContent = ({ close }: { close: () => void }) => {
  const { data, isLoading, isFetching } = useGetSeries();
  const seriesList = useMemo(() => data ?? [], [data]);
  const {
    mutateAsync: createSeries,
    isPending: isCreating,
    error: createError,
  } = useCreateSeries();
  const {
    mutateAsync: updateSeries,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateSeries();
  const {
    mutateAsync: deleteSeries,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteSeries();
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SeriesForm>({
    defaultValues,
  });
  const toast = useActionToast();

  useEffect(() => {
    if (!editingSeries) {
      reset(defaultValues);
      return;
    }
    reset({
      name: editingSeries.name,
      totalParts: editingSeries.totalParts ?? '',
    });
  }, [editingSeries, reset]);

  const buildPayload = (values: SeriesForm) => ({
    name: (values.name || '').trim(),
    totalParts:
      values.totalParts === '' || values.totalParts === undefined
        ? null
        : Number(values.totalParts),
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildPayload(values);
    const targetName = payload.name || editingSeries?.name || 'Series';
    try {
      toast.showToast({
        title: editingSeries ? 'Saving series…' : 'Creating series…',
        description: editingSeries
          ? `Updating "${targetName}".`
          : `Adding "${targetName}".`,
      });
      if (editingSeries) {
        await updateSeries({ id: editingSeries._id, payload });
      } else {
        await createSeries(payload);
      }
      toast.showSuccess({
        title: editingSeries ? 'Series updated' : 'Series created',
        description: `"${targetName}" saved successfully.`,
      });
      setEditingSeries(null);
      reset(defaultValues);
    } catch (err) {
      console.error('Failed to save series', err);
      const message =
        err instanceof Error ? err.message : 'Could not save the series.';
      toast.showError({
        title: 'Save failed',
        description: `"${targetName}": ${message}`,
      });
    }
  });

  const handleDelete = async (series: Series) => {
    try {
      toast.showToast({
        title: 'Deleting series…',
        description: `Removing "${series.name}" and detaching from books.`,
      });
      await deleteSeries(series._id);
      toast.showSuccess({
        title: 'Series deleted',
        description: `"${series.name}" has been removed.`,
      });
      if (editingSeries?._id === series._id) {
        setEditingSeries(null);
        reset(defaultValues);
      }
    } catch (err) {
      console.error('Failed to delete series', err);
      const message =
        err instanceof Error ? err.message : 'Could not delete this series.';
      toast.showError({
        title: 'Delete failed',
        description: `"${series.name}": ${message}`,
      });
    }
  };

  const getErrorMessage = (err: unknown) => {
    if (!err) return '';
    const maybeError = err as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };
    return (
      maybeError?.response?.data?.error ||
      maybeError?.response?.data?.message ||
      maybeError?.message ||
      ''
    );
  };

  const errorMessage =
    getErrorMessage(createError) ||
    getErrorMessage(updateError) ||
    getErrorMessage(deleteError);

  const isSaving = isCreating || isUpdating;

  return (
    <div className='m-auto w-[100vw] max-w-5xl space-y-6 rounded-primary bg-black-3/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-blue-1/15 backdrop-blur-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Icon type='series' className='text-blue-1' />
          <div className='text-lg font-semibold text-white'>Manage series</div>
        </div>
        <span className='rounded-full bg-blue-1/15 px-3 py-1 text-xs font-semibold text-blue-1'>
          {seriesList.length} total
        </span>
      </div>

      <div className='grid gap-3 rounded-primary bg-black-2/60 p-4 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'>
        <div className='flex items-center justify-between text-sm text-white/80'>
          <span className='text-xs uppercase tracking-[0.12em] text-white/60'>
            Existing series
          </span>
          {isLoading || isFetching ? (
            <span className='text-xs text-white/60'>Refreshing...</span>
          ) : null}
        </div>
        <div className='max-h-[240px] space-y-2 overflow-y-auto'>
          {seriesList.length === 0 && !isLoading ? (
            <p className='text-sm text-white/60'>
              No series yet. Add your first collection below.
            </p>
          ) : (
            seriesList.map((series: Series) => (
              <div
                key={series._id}
                className='flex min-h-[50px] items-center justify-between gap-2 rounded-xl bg-gradient-to-br from-blue-1/15 via-black/35 to-blue-1/12 px-3 py-2 ring-1 ring-blue-1/15'
              >
                <div className='flex flex-col gap-[2px] text-left'>
                  <span className='text-sm font-semibold text-white'>
                    {series.name}
                  </span>
                  <span className='text-xs text-white/65'>
                    {typeof series.totalParts === 'number'
                      ? `${series.totalParts} part${
                          series.totalParts === 1 ? '' : 's'
                        }`
                      : 'Open-ended series'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    iconButton='edit'
                    onClick={() => setEditingSeries(series)}
                    aria-label={`Edit ${series.name}`}
                    disabled={isSaving || isDeleting}
                  />
                  <Button
                    variant='dangerOutline'
                    iconButton='delete'
                    onClick={() => handleDelete(series)}
                    aria-label={`Delete ${series.name}`}
                    disabled={isSaving || isDeleting}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form
        className='grid gap-4 rounded-primary bg-black-2/60 p-5 shadow-inner shadow-black/40 ring-1 ring-blue-1/15'
        onSubmit={onSubmit}
      >
        <div className='flex items-center justify-between text-sm text-white/80'>
          <span className='text-xs uppercase tracking-[0.12em] text-white/60'>
            {editingSeries ? 'Edit series' : 'Add a new series'}
          </span>
          {editingSeries ? (
            <span className='rounded-full bg-blue-1/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-1'>
              Editing
            </span>
          ) : null}
        </div>

        <Controller
          name='name'
          control={control}
          rules={{
            required: 'Name is required',
            validate: (value) =>
              (value && value.trim().length > 0) || 'Name is required',
          }}
          render={({ field }) => (
            <Input
              label='Series name'
              placeholder='e.g., Chronicles Collection'
              dir='rtl'
              {...field}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name='totalParts'
          control={control}
          rules={{
            validate: (value) => {
              if (value === '' || value === undefined) return true;
              if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                return 'Total parts must be a positive integer';
              }
              return true;
            },
          }}
          render={({ field }) => (
            <Input
              label='Total parts (optional)'
              placeholder='e.g., 5'
              type='number'
              min={1}
              {...field}
              value={field.value === undefined ? '' : field.value}
              error={errors.totalParts?.message}
            />
          )}
        />

        {errorMessage ? (
          <p className='text-sm text-red-1'>{errorMessage}</p>
        ) : null}

        <div className='flex flex-wrap justify-end gap-2'>
          {editingSeries ? (
            <Button
              type='button'
              variant='neutral'
              onClick={() => {
                setEditingSeries(null);
                reset(defaultValues);
              }}
              disabled={isSaving || isDeleting}
            >
              Cancel edit
            </Button>
          ) : null}
          <Button
            type='button'
            variant='neutral'
            onClick={close}
            disabled={isSaving || isDeleting}
          >
            Close
          </Button>
          <Button type='submit' disabled={isSaving || isDeleting}>
            {editingSeries ? 'Save changes' : 'Add series'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const SeriesModalTrigger = ({ onOpen }: { onOpen?: () => void }) => {
  const modal = useModal({
    content: ({ close }) => <SeriesModalContent close={close} />,
  });

  return (
    <>
      <Button
        variant='outline'
        iconButton='series'
        onClick={() => {
          onOpen?.();
          modal.open({});
        }}
        aria-label='Manage series'
      />
      <Modal {...modal} />
    </>
  );
};
