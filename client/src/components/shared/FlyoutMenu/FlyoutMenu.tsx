import { ReactNode, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

let flyoutIdCounter = 0;

const getFlyoutId = () => {
  flyoutIdCounter += 1;
  return `flyout-${flyoutIdCounter}`;
};

type FlyoutTriggerRenderProps = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  triggerProps: {
    id: string;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    'aria-controls': string;
  };
};

type FlyoutMenuRenderProps = {
  isOpen: boolean;
  close: () => void;
  menuProps: {
    id: string;
    role: 'menu';
    'aria-labelledby': string;
  };
};

type FlyoutMenuProps = {
  trigger: (props: FlyoutTriggerRenderProps) => ReactNode;
  menu: (props: FlyoutMenuRenderProps) => ReactNode;
  containerClassName?: string;
};

export const FlyoutMenu = ({
  trigger,
  menu,
  containerClassName = '',
}: FlyoutMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef<string>();

  if (!idRef.current) {
    idRef.current = getFlyoutId();
  }

  const triggerId = `${idRef.current}-trigger`;
  const menuId = `${idRef.current}-menu`;

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);
  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      close();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={clsx('relative', containerClassName)}>
      {trigger({
        isOpen,
        toggle,
        open,
        close,
        triggerProps: {
          id: triggerId,
          'aria-haspopup': 'menu',
          'aria-expanded': isOpen,
          'aria-controls': menuId,
        },
      })}
      {menu({
        isOpen,
        close,
        menuProps: {
          id: menuId,
          role: 'menu',
          'aria-labelledby': triggerId,
        },
      })}
    </div>
  );
};

export type {
  FlyoutMenuProps,
  FlyoutMenuRenderProps,
  FlyoutTriggerRenderProps,
};
