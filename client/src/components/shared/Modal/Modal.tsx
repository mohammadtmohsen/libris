import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { ModalProps } from './types';
import clsx from 'clsx';

export const Modal = ({
  close,
  isVisible,
  content,
  contentProps,
  overrideStyle,
}: ModalProps) => {
  return (
    <Dialog
      open={isVisible}
      onClose={close}
      classes={{
        paper: clsx('rounded-primary !bg-transparent', {
          'm-0': true,
        }),
        root: '!m-0',
        container: '!m-0',
      }}
      slotProps={{
        paper: {
          style: {
            margin: 10,
          },
        },
      }}
    >
      <DialogContent
        classes={{
          root: clsx(
            '!bg-black-3 !p-3 sm:!p-5 rounded-secondary text-white-1',
            overrideStyle
          ),
        }}
      >
        {content({ close, contentProps })}
      </DialogContent>
    </Dialog>
  );
};
