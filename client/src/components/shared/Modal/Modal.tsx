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
  fullScreen = false,
}: ModalProps) => {
  return (
    <Dialog
      open={isVisible}
      onClose={close}
      fullWidth
      fullScreen={!!fullScreen}
      slots={{
        transition: Transition,
      }}
      classes={{
        paper: clsx('xrounded-primary !bg-transparent', {
          'm-0': true,
        }),
        root: '!m-0',
        container: '!m-0',
      }}
      slotProps={{
        paper: {
          sx: {
            m: 0,
            height: fullScreen ? '100vh' : '60vh',
            maxHeight: fullScreen ? '100vh' : '60vh',
            width: '100vw',
            maxWidth: '100vw',
            borderTopLeftRadius: fullScreen ? 0 : '1rem',
            borderTopRightRadius: fullScreen ? 0 : '1rem',
            bgcolor: 'transparent',
          },
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-end',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(6, 10, 18, 0.65)',
          backdropFilter: 'blur(4px)',
        },
      }}
      //     backgroundColor: 'transparent',
      //     borderRadius: '0px',
      //   },
      // }}
    >
      <DialogContent
        classes={{
          root: clsx(
            '!bg-black-transparent !p-0 sm:!p-0 rounded-secondary text-white-1',
            overrideStyle
          ),
        }}
      >
        {content({ close, contentProps })}
      </DialogContent>
    </Dialog>
  );
};
