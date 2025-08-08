import { Modal } from '_components/shared/Modal/Modal';
import { IRecord } from '_services/recordServices';
import { useForm } from 'react-hook-form';
import { useModal } from '_components/shared/Modal/useModal';
import { useAddNewRecord } from '_queries/recordQueries/recordQueries';
import AddEditRecordForm from '../components/AddEditRecordForm';
import { Button } from '_components/shared';

const AddNewRecords = () => {
  const { mutateAsync: addNewRecord } = useAddNewRecord();
  const methods = useForm<IRecord>({
    defaultValues: {
      date: new Date().getTime(),
      measurements: {
        weight: null,
        neck: null,
        shoulders: null,
        chest: null,
        arms: null,
        forearms: null,
        waist: null,
        hips: null,
        thighs: null,
        calves: null,
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

      await addNewRecord({ ...data, date: timestamp });
      handleClose(close);
    } catch (error) {
      console.error('Error adding new record:', error);
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
          title='Add New Record'
          submitButtonText='Add'
        />
      );
    },
  });

  return (
    <>
      <Button leftIcon='add' onClick={() => open()} className='ml-auto'>
        New Record
      </Button>
      <Modal {...modalControl} />
    </>
  );
};

export default AddNewRecords;
