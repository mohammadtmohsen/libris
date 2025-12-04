import clsx from 'clsx';
import { ButtonPropsType } from './type';
import { Icon } from '../Icon/Icon';
import { Loader } from '../Loader/Loader';

export const Button = (props: ButtonPropsType) => {
  const {
    children,
    className = '',
    variant = 'primary',
    leftIcon,
    rightIcon,
    iconButton,
    loading,
    iconProps,
    ...restProps
  } = props;

  const VARIANT_CLASSES = {
    primary:
      'bg-blue-1 text-white-1 border-transparent hover:bg-blue-2 disabled:bg-blue-3 disabled:cursor-not-allowed',
    primaryOutline:
      'bg-transparent text-blue-1 border-blue-1 hover:bg-blue-7 disabled:bg-blue-3 disabled:cursor-not-allowed',
    secondary:
      'bg-green-4 text-white-2 border-transparent hover:bg-green-5 disabled:bg-green-5 disabled:cursor-not-allowed',
    secondaryOutline:
      'bg-transparent text-green-3 border-green-3 hover:bg-green-6 disabled:bg-green-4 disabled:cursor-not-allowed',
    danger:
      'bg-red-2 text-white-1 border-transparent hover:bg-red-3 disabled:bg-red-3 disabled:cursor-not-allowed',
    dangerOutline:
      'bg-transparent text-red-2 border-red-2 hover:bg-red-3 disabled:bg-red-3 disabled:cursor-not-allowed',
    outline:
      'bg-transparent text-blue-1 border-blue-1 hover:bg-blue-7 disabled:bg-blue-3 disabled:cursor-not-allowed',
  };

  return (
    <button
      className={clsx(
        'font-patrick border rounded-[8px]',
        'transition-colors duration-200',
        VARIANT_CLASSES[variant],
        iconButton
          ? 'p-2 h-[40px] w-[40px] flex !rounded-full items-center justify-center'
          : 'py-2 px-5 md:px-6 !w-fit h-[40px] whitespace-nowrap text-[16px] md:text-[18px] flex gap-[6px] items-center justify-center',

        className
      )}
      disabled={loading || restProps.disabled}
      {...restProps}
    >
      {loading ? (
        <Loader
          loading={loading}
          className='relative bg-transparent text-white-4'
          circularSize={25}
        />
      ) : iconButton ? (
        <Icon {...iconProps} type={iconButton} />
      ) : (
        <>
          {leftIcon && <Icon type={leftIcon} />}
          {children}
          {rightIcon && <Icon type={rightIcon} />}
        </>
      )}
    </button>
  );
};
