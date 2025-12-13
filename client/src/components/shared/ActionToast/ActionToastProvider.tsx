import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ActionToast, ActionToastStatus } from './ActionToast';
import {
  ActionToastContext,
  ToastConfig,
  ToastState,
} from './ActionToastContext';

const DEFAULT_AUTO_CLOSE = 2500;

export const ActionToastProvider = ({
  children,
  autoCloseMs = DEFAULT_AUTO_CLOSE,
}: {
  children: ReactNode;
  autoCloseMs?: number;
}) => {
  const [toastState, setToastState] = useState<ToastState>({
    show: false,
    status: 'loading',
    title: '',
    description: '',
    autoCloseMs,
  });

  const showToast = useCallback(
    (config?: ToastConfig) => {
      setToastState({
        show: true,
        status: 'loading',
        title: config?.title || 'Working on it…',
        description: config?.description,
        autoCloseMs: config?.autoCloseMs ?? autoCloseMs,
      });
    },
    [autoCloseMs]
  );

  const updateToastStatus = useCallback(
    (status: ActionToastStatus, config?: ToastConfig) => {
      setToastState((prev) => ({
        show: true,
        status,
        title: config?.title ?? prev.title,
        description: config?.description ?? prev.description,
        autoCloseMs: config?.autoCloseMs ?? prev.autoCloseMs ?? autoCloseMs,
      }));
    },
    [autoCloseMs]
  );

  const showSuccess = useCallback(
    (config?: ToastConfig) => updateToastStatus('success', config),
    [updateToastStatus]
  );

  const showError = useCallback(
    (config?: ToastConfig) => updateToastStatus('error', config),
    [updateToastStatus]
  );

  const showInfo = useCallback(
    (config?: ToastConfig) => updateToastStatus('info', config),
    [updateToastStatus]
  );

  const updateMessage = useCallback(
    (config: ToastConfig) => {
      setToastState((prev) => ({
        ...prev,
        show: true,
        title: config.title ?? prev.title,
        description: config.description ?? prev.description,
        autoCloseMs: config.autoCloseMs ?? prev.autoCloseMs ?? autoCloseMs,
      }));
    },
    [autoCloseMs]
  );

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    if (!toastState.show) return;
    if (toastState.status === 'loading') return;

    const timeout = setTimeout(
      () => setToastState((prev) => ({ ...prev, show: false })),
      toastState.autoCloseMs ?? autoCloseMs
    );

    return () => clearTimeout(timeout);
  }, [autoCloseMs, toastState]);

  const contextValue = useMemo(
    () => ({
      showToast,
      showSuccess,
      showError,
      showInfo,
      updateMessage,
      hideToast,
      updateToastStatus,
      toastState,
    }),
    [
      showToast,
      showSuccess,
      showError,
      showInfo,
      updateMessage,
      hideToast,
      updateToastStatus,
      toastState,
    ]
  );

  return (
    <ActionToastContext.Provider value={contextValue}>
      {children}
      <ActionToast
        show={toastState.show}
        status={toastState.status}
        title={toastState.title}
        description={toastState.description}
        onClose={hideToast}
      />
    </ActionToastContext.Provider>
  );
};
