import { createContext, useContext } from 'react';
import { ActionToastStatus } from './ActionToast';

export type ToastConfig = {
  title?: string;
  description?: string;
  autoCloseMs?: number;
};

export type ToastState = {
  show: boolean;
  status: ActionToastStatus;
  title?: string;
  description?: string;
  autoCloseMs?: number;
};

export type ActionToastContextValue = {
  showToast: (config?: ToastConfig) => void;
  showSuccess: (config?: ToastConfig) => void;
  showError: (config?: ToastConfig) => void;
  showInfo: (config?: ToastConfig) => void;
  updateMessage: (config: ToastConfig) => void;
  hideToast: () => void;
  updateToastStatus: (status: ActionToastStatus, config?: ToastConfig) => void;
  toastState: ToastState;
};

export const ActionToastContext =
  createContext<ActionToastContextValue | null>(null);

const warnMissingProvider = (() => {
  let warned = false;
  return () => {
    if (!warned) {
      warned = true;
      console.warn(
        'ActionToast: no provider found. The hook will be a no-op until wrapped in <ActionToastProvider>.'
      );
    }
  };
})();

const noop = () => undefined;

const defaultContext: ActionToastContextValue = {
  showToast: noop,
  showSuccess: noop,
  showError: noop,
  showInfo: noop,
  updateMessage: noop,
  hideToast: noop,
  updateToastStatus: noop,
  toastState: { show: false, status: 'info' },
};

export const useActionToastContext = () => {
  const ctx = useContext(ActionToastContext);
  if (!ctx) {
    warnMissingProvider();
    return defaultContext;
  }
  return ctx;
};
