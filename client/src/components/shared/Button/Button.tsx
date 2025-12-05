import clsx from 'clsx';
import { CSSProperties } from 'react';
import { ButtonPropsType } from './type';
import { Icon } from '../Icon/Icon';
import { Loader } from '../Loader/Loader';
import { colors } from '_constants/colors';

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
    style,
    ...restProps
  } = props;

  type ButtonVariant = NonNullable<ButtonPropsType['variant']>;

  const ACCENT_COLORS: Record<ButtonVariant, string> = {
    primary: colors.blue[1],
    primaryOutline: colors.blue[1],
    secondary: colors.green[1],
    secondaryOutline: colors.green[1],
    danger: colors.red[1],
    dangerOutline: colors.red[1],
    outline: colors.blue[1],
    neutral: colors.blue[1],
  };

  const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary:
      'border-blue-2/55 bg-blue-1 text-black-1 ring-1 ring-blue-2/30 hover:bg-blue-2 hover:shadow-[0_12px_32px_rgba(123,97,255,0.24)]',
    primaryOutline:
      'border-blue-2/50 bg-blue-6/30 text-blue-1 ring-1 ring-blue-1/25 hover:bg-blue-6/45 hover:border-blue-1/60 hover:ring-blue-1/35',
    secondary:
      'border-green-2/55 bg-green-1 text-black-1 ring-1 ring-green-2/30 hover:bg-green-2 hover:shadow-[0_12px_32px_rgba(97,231,166,0.22)]',
    secondaryOutline:
      'border-green-2/50 bg-green-6/30 text-green-1 ring-1 ring-green-1/20 hover:bg-green-6/45 hover:border-green-1/60',
    danger:
      'border-red-2/55 bg-red-1 text-black-1 ring-1 ring-red-1/30 hover:bg-red-2 hover:shadow-[0_12px_32px_rgba(255,104,101,0.22)]',
    dangerOutline:
      'border-red-2/50 bg-red-3/18 text-red-1 ring-1 ring-red-1/25 hover:bg-red-3/26 hover:border-red-1/60',
    outline:
      'border-blue-4/50 bg-blue-6/28 text-blue-1 ring-1 ring-blue-1/18 hover:bg-blue-6/40 hover:border-blue-1/40',
    neutral:
      'border-black-4/60 bg-black-3/85 text-blue-1 ring-1 ring-blue-1/15 hover:bg-black-4 hover:border-blue-1/35 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
  };

  const currentVariant = (variant ?? 'primary') as ButtonVariant;
  const baseAccent = ACCENT_COLORS[currentVariant] || colors.blue[1];
  const iconAccent = iconProps?.htmlColor || baseAccent;
  const buttonStyle: CSSProperties | undefined = iconButton
    ? ({
        ...(style || {}),
        borderColor: iconAccent,
        ['--tw-ring-color']: iconAccent,
        ['--btn-accent']: iconAccent,
      } as CSSProperties)
    : style;

  return (
    <button
      className={clsx(
        'group relative isolate inline-flex items-center justify-center gap-2 rounded-[12px] border font-semibold tracking-[0.02em]',
        'shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all duration-200 ease-out overflow-hidden backdrop-blur-[1px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-1/60 focus-visible:ring-offset-0 hover:-translate-y-[1px] active:translate-y-[0px]',
        'before:absolute before:inset-0 before:rounded-[inherit] before:bg-blue-1/12 before:opacity-0 before:transition-opacity before:duration-200 before:content-[""] hover:before:opacity-100',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0',
        VARIANT_CLASSES[currentVariant],
        iconButton
          ? 'h-[42px] w-[42px] p-0 !rounded-full items-center justify-center'
          : 'h-[44px] px-5 md:px-6 !w-fit whitespace-nowrap text-[15px] md:text-[16px]',
        className
      )}
      disabled={loading || restProps.disabled}
      style={buttonStyle}
      {...restProps}
    >
      {loading ? (
        <Loader
          loading={loading}
          className={clsx(
            'relative bg-transparent',
            iconButton ? 'text-[var(--btn-accent)]' : 'text-blue-1'
          )}
          circularSize={25}
        />
      ) : iconButton ? (
        <Icon {...{ ...iconProps, htmlColor: iconAccent }} type={iconButton} />
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
