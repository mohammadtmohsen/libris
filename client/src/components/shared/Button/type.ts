import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';
import { IconType } from '../Icon/Icon';
import { SvgIconProps } from '@mui/material';

export type ButtonPropsType = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode | string;
  variant?:
    | 'primary'
    | 'primaryOutline'
    | 'secondary'
    | 'secondaryOutline'
    | 'danger'
    | 'dangerOutline'
    | 'outline'
    | 'neutral';
  style?: CSSProperties;
  leftIcon?: IconType;
  rightIcon?: IconType;
  iconButton?: IconType;
  iconProps?: SvgIconProps;
  loading?: boolean;
};
