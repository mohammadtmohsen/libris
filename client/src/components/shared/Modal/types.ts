interface UseModalProps {
  content: (props: {
    close: () => void;
    contentProps?: Record<string, unknown> | null;
  }) => React.ReactNode;
  overrideStyle?: string;
  fullScreen?: boolean;
}

interface ModalProps {
  open: () => void;
  close: () => void;
  isVisible: boolean;
  content: (props: {
    close: () => void;
    contentProps?: Record<string, unknown> | null;
  }) => React.ReactNode;
  contentProps?: Record<string, unknown> | null;
  overrideStyle?: string;
  fullScreen?: boolean;
}

export type { UseModalProps, ModalProps };
