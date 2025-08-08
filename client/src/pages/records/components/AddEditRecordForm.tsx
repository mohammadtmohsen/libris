import { Button, Input, DatePicker } from '_components/shared';
import { IRecord } from '_services/recordServices';
import { Controller, UseFormReturn, FieldPath } from 'react-hook-form';

interface AddEditRecordFormProps {
  methods: UseFormReturn<IRecord>;
  onSubmit: (data: IRecord, close: () => void) => Promise<void>;
  handleClose: (close: () => void) => void;
  close: () => void;
  title?: string;
  submitButtonText?: string;
}

const AddEditRecordForm = ({
  methods,
  onSubmit,
  handleClose,
  close,
  title = 'Add New Record',
  submitButtonText = 'Add',
}: AddEditRecordFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const fieldArray = [
    { dataIndex: 'date', label: 'Date' },
    { dataIndex: 'measurements.weight', label: 'Weight' },
    { dataIndex: 'measurements.neck', label: 'Neck' },
    { dataIndex: 'measurements.shoulders', label: 'Shoulders' },
    { dataIndex: 'measurements.chest', label: 'Chest' },
    { dataIndex: 'measurements.arms', label: 'Arms' },
    { dataIndex: 'measurements.forearms', label: 'Forearms' },
    { dataIndex: 'measurements.waist', label: 'Waist' },
    { dataIndex: 'measurements.hips', label: 'Hips' },
    { dataIndex: 'measurements.thighs', label: 'Thighs' },
    { dataIndex: 'measurements.calves', label: 'Calves' },
  ];

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, close))}
      className='flex flex-col gap-5'
    >
      <h1 className='font-bold'>{title}</h1>
      <div className='grid grid-cols-2 sm:grid-cols-2 gap-5'>
        {fieldArray.map((item) => (
          <Controller
            key={item.dataIndex}
            name={item.dataIndex as FieldPath<IRecord>}
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const error =
                errors[item.dataIndex as keyof typeof errors]?.message || '';
              return item.dataIndex === 'date' ? (
                <DatePicker
                  label={item.label}
                  error={error}
                  {...field}
                  value={field.value as number}
                />
              ) : (
                <Input
                  key={item.dataIndex}
                  label={item.label}
                  error={error}
                  {...field}
                  type='number'
                />
              );
            }}
          />
        ))}
      </div>
      <div className='flex gap-5 justify-center'>
        <Button variant='primaryOutline' type='submit' className='!w-full'>
          {submitButtonText}
        </Button>
        <Button
          variant='secondaryOutline'
          type='button'
          className='!w-full'
          onClick={() => handleClose(close)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddEditRecordForm;
