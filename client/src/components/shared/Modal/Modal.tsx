import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { ModalProps } from './types';
import clsx from 'clsx';
import { TransitionProps } from '@mui/material/transitions';
import { Slide } from '@mui/material';
import React from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

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
      // fullWidth
      fullScreen
      classes={{
        paper: clsx('xrounded-primary !bg-transparent', {
          'm-0': true,
        }),
        root: '!m-0',
        container: '!m-0',
      }}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          style: {
            margin: 0,
          },
        },
      }}
    >
      <DialogContent
        classes={{
          root: clsx(
            '!bg-black-3 !p-3 sm:!p-5 xrounded-secondary text-white-1',
            overrideStyle
          ),
        }}
      >
        {content({ close, contentProps })}
      </DialogContent>
    </Dialog>
  );
};
