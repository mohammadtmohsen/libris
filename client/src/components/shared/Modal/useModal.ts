import { useState } from 'react';
import { UseModalProps } from './types';

export const useModal = ({
  content,
  overrideStyle,
  fullScreen,
}: UseModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [contentProps, setContentProps] = useState<Record<
    string,
    unknown
  > | null>(null);

  const open = (props: Record<string, unknown> = {}) => {
    setIsVisible(true);
    setContentProps(props);
  };

  const close = () => {
    setIsVisible(false);
  };

  const modalControl = {
    open,
    close,
    isVisible,
    content,
    contentProps,
    overrideStyle,
    fullScreen,
  };

  return { ...modalControl, modalControl };
};
