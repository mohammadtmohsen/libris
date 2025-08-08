import { Modal } from '_components/shared/Modal/Modal';
import { IRecord } from '_services/recordServices';
import { useForm } from 'react-hook-form';
import { useModal } from '_components/shared/Modal/useModal';
import { useUpdateRecord } from '_queries/recordQueries/recordQueries';
import AddEditRecordForm from './AddEditRecordForm';
import { Button } from '_components/shared';

interface EditRecordProps {
  record: IRecord;
}

const EditRecord = ({ record }: EditRecordProps) => {
  const { mutateAsync: updateRecord } = useUpdateRecord();
  const methods = useForm<IRecord>({
    defaultValues: {
      _id: record._id,
      date: record.date,
      measurements: {
        weight: record.measurements.weight,
        neck: record.measurements.neck,
        shoulders: record.measurements.shoulders,
        chest: record.measurements.chest,
        arms: record.measurements.arms,
        forearms: record.measurements.forearms,
        waist: record.measurements.waist,
        hips: record.measurements.hips,
        thighs: record.measurements.thighs,
        calves: record.measurements.calves,
      },
    },
  });

  const handleClose = (close: () => void) => {
    methods.reset();
    close();
  };

  const onSubmit = async (data: IRecord, close: () => void) => {
    try {
      const timestamp = new Date(data.date).getTime();
      const recordId = record._id as string;

      await updateRecord({
        recordId,
        payload: { ...data, date: timestamp },
      });
      handleClose(close);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const { modalControl, open } = useModal({
    content: ({ close }) => {
      return (
        <AddEditRecordForm
          methods={methods}
          onSubmit={onSubmit}
          handleClose={handleClose}
          close={close}
          title='Update Record'
          submitButtonText='Update'
        />
      );
    },
  });

  return (
    <>
      <Button
        iconButton='edit'
        onClick={() => open()}
        variant='primaryOutline'
        className='border-none'
      />
      <Modal {...modalControl} />
    </>
  );
};

export default EditRecord;
