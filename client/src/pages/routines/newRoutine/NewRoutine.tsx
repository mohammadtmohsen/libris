import { BuildRoutine } from '_components/shared/form/build-routine';
import { useCreateRoutine } from '_queries/routineQueries/routineQueries';
import { IRoutine } from '_types/types';
import { useNavigate } from 'react-router-dom';

const NewRoutine = () => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateRoutine();

  const onSubmit = async (data: IRoutine) => {
    await mutateAsync(data);
    navigate('/routines');
  };

  return (
    <BuildRoutine
      onSubmit={onSubmit}
      isSubmitting={isPending}
      onCancel={() => navigate('/routines')}
    />
  );
};

export default NewRoutine;
