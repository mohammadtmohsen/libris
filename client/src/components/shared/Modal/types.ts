interface UseModalProps {
  content: (props: {
    close: () => void;
    contentProps?: Record<string, unknown> | null;
  }) => React.ReactNode;
  overrideStyle?: string;
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
}

export type { UseModalProps, ModalProps };
