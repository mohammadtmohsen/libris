import {
  Button,
  CustomSelect,
  Input,
  Modal,
  useModal,
} from '_components/shared';
import { ARABIC_BOOK_TAGS, READING_STATUSES } from '_constants/filtersOptions';

const FilterBooksForm = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div className='flex flex-col gap-5'>
      {/* Form fields for filtering books go here */}
      <h2>Filter Books</h2>
      <Input placeholder='Search by title or author' />
      <CustomSelect
        options={READING_STATUSES}
        placeholder='Search by reading status'
        isMulti
      />
      <CustomSelect
        options={ARABIC_BOOK_TAGS}
        placeholder='Search by category'
        isMulti
      />
      <Button onClick={onCancel}>Close</Button>
    </div>
  );
};

export const FilterBooks = () => {
  const uploadModal = useModal({
    content: ({ close }) => <FilterBooksForm onCancel={close} />,
  });

  return (
    <>
      <Button
        variant='primary'
        iconButton='filter'
        onClick={() => uploadModal.open({})}
      />
      <Modal {...uploadModal} />
    </>
  );
};
