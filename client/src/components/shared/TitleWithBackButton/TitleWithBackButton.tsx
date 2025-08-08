import useHeaderTitle from '_hooks/useHeaderTitle';
import clsx from 'clsx';
import { Button } from '../Button/Button';

export const TitleWithBackButton = ({ className }: { className?: string }) => {
  const { title, canGoBack, goBack } = useHeaderTitle();
  return (
    <div className={clsx('flex items-center', className)}>
      {canGoBack && (
        <Button
          iconButton='back'
          className='text-white border-none'
          variant='outline'
          onClick={goBack}
        />
      )}
      <h2 className='text-white font-bold text-2xl'>{title}</h2>
    </div>
  );
};
