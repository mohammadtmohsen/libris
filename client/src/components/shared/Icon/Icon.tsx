import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RemoveIcon from '@mui/icons-material/Remove';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { SvgIconProps } from '@mui/material/SvgIcon';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export type IconType =
  | 'delete'
  | 'edit'
  | 'add'
  | 'check'
  | 'info'
  | 'more'
  | 'logout'
  | 'back'
  | 'published'
  | 'clearAll'
  | 'remove'
  | 'kg'
  | 'plates'
  | 'filter'
  | 'visibility'
  | 'visibilityOff';

interface IconProps {
  type: IconType;
  color?: string;
  fontSize?: 'small' | 'medium' | 'large' | 'inherit';
  className?: string;
}

export const Icon = ({
  type,
  color,
  fontSize = 'medium',
  className,
}: IconProps) => {
  const iconProps: SvgIconProps = {
    fontSize,
    className,
  };

  if (color) {
    iconProps.color = color as SvgIconProps['color'];
  }

  switch (type) {
    case 'delete':
      return <DeleteIcon {...iconProps} />;
    case 'edit':
      return <EditIcon {...iconProps} />;
    case 'add':
      return <AddIcon {...iconProps} />;
    case 'check':
      return <CheckIcon {...iconProps} />;
    case 'info':
      return <InfoIcon {...iconProps} />;
    case 'more':
      return <MoreVertIcon {...iconProps} />;
    case 'logout':
      return <LogoutIcon {...iconProps} />;
    case 'back':
      return <BackIcon {...iconProps} />;
    case 'published':
      return <PublishedWithChangesIcon {...iconProps} />;
    case 'clearAll':
      return <ClearAllIcon {...iconProps} />;
    case 'remove':
      return <RemoveIcon {...iconProps} />;
    case 'kg':
      return <FitnessCenterIcon {...iconProps} />;
    case 'plates':
      return <ViewHeadlineIcon {...iconProps} />;
    case 'filter':
      return <FilterAltOutlinedIcon {...iconProps} />;
    case 'visibility':
      return <VisibilityOutlinedIcon {...iconProps} />;
    case 'visibilityOff':
      return <VisibilityOffOutlinedIcon {...iconProps} />;
    default:
      return null;
  }
};
