import { daysNames } from '_constants/daysName';
import { IDays, IRoutineDays } from '_types/types';
import dayjs from 'dayjs';
export const getToday = () => {
  const todayIndex = new Date().getDay();
  const today = daysNames[todayIndex ?? 0] as IDays;
  return today;
};

export const getTodayRoutine = ({
  activeRoutine,
}: {
  activeRoutine: IRoutineDays;
}) => {
  const today = getToday();
  const todayWorkout = activeRoutine[today];
  return { day: today, workout: todayWorkout };
};

export const formatDate = (
  date: string | number | Date,
  format: 'DD/MM/YYYY' | 'MM/YYYY' = 'DD/MM/YYYY'
) => {
  if (!date) {
    return '';
  }
  try {
    const formattedDate = dayjs(date).format(format);
    // Validate if the formatted date is valid
    if (formattedDate === 'Invalid Date') {
      return '';
    }
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getInitialsFromName = (name?: string) => {
  if (!name) return '';

  const splitName = name.split(' ');
  if (splitName?.length) {
    return splitName?.map((part) => part[0]?.toUpperCase() || '').join('');
  }
  return '';
};
