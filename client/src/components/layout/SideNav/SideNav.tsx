import * as React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

import { colors } from '_constants/colors';

import { SideNavItems } from './SideNavItems';
import { logos } from '_assets';

export const SideNav = () => {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{
        bgcolor: colors.black[1],
        paddingX: 3,
        paddingY: 6,
        height: '100%',
        color: 'white',
      }}
      role='presentation'
      onClick={toggleDrawer(false)}
    >
      <Box display='flex' justifyContent='right' alignItems='center' mb={2}>
        <IconButton onClick={toggleDrawer(false)} sx={{ padding: 0 }}>
          <CloseIcon
            sx={{
              color: colors.yellow[1],
              width: '33px',
              height: '33px',
              padding: 0,
            }}
          />
        </IconButton>
      </Box>
      <Box display='flex' justifyContent='center' alignItems='center' mb={2}>
        <img src={logos.librisLogo} className='w-44 h-44' />
      </Box>
      <Box>
        <SideNavItems className='flex-col gap-11 flex-1' />
      </Box>
    </Box>
  );

  return (
    <div className='sm:hidden'>
      <IconButton onClick={toggleDrawer(true)}>
        <MenuIcon sx={{ color: colors.red[1] }} />
      </IconButton>
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            borderRadius: '0px',
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
};
