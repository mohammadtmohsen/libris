import clsx from 'clsx';

import { ButtonPropsType } from './type';

export const TextButton = (props: ButtonPropsType) => {
  const { children, className = '', ...restProps } = props;
  return (
    <button
      className={clsx([
        'text-[17px] sm:text-[18px] font-patrick font-medium',
        'flex gap-[6px] items-center justify-center disabled:cursor-not-allowed disabled:text-opacity-50 w-fit',
        'text-periwinkle',
        className,
      ])}
      {...restProps}>
      {children}
    </button>
  );
};
