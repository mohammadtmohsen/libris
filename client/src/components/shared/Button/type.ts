import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';
import { IconType } from '../Icon/Icon';

export type ButtonPropsType = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode | string;
  variant?:
    | 'primary'
    | 'primaryOutline'
    | 'secondary'
    | 'secondaryOutline'
    | 'danger'
    | 'dangerOutline'
    | 'outline';
  style?: CSSProperties;
  leftIcon?: IconType;
  rightIcon?: IconType;
  iconButton?: IconType;
  loading?: boolean;
};
