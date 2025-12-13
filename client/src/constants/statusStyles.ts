import type { ProgressStatus } from '_queries/progressQueries';
import { colors } from './colors';

type StatusAccent = {
  solid: string;
  barGradient: string[];
  labelGradient?: string[];
};

export const STATUS_ACCENTS: Record<ProgressStatus, StatusAccent> = {
  not_started: {
    solid: colors.white[1],
    barGradient: [colors.white[2], colors.white[3], colors.white[6]],
    labelGradient: [colors.white[3], colors.white[6], colors.white[3]],
  },
  want_to_read: {
    solid: colors.yellow[1],
    barGradient: [colors.yellow[1], colors.yellow[2], colors.yellow[3]],
    labelGradient: [colors.yellow[1], colors.yellow[2], colors.yellow[1]],
  },
  reading: {
    solid: colors.blue[1],
    barGradient: [colors.blue[1], colors.blue[2], colors.blue[3]],
    labelGradient: [colors.blue[1], colors.blue[2], colors.blue[1]],
  },
  finished: {
    solid: colors.green[1],
    barGradient: [colors.green[1], colors.green[2], colors.green[3]],
    labelGradient: [colors.green[1], colors.green[2], colors.green[1]],
  },
  abandoned: {
    solid: colors.red[1],
    barGradient: [colors.red[1], colors.red[2], colors.red[3]],
    labelGradient: [colors.red[1], colors.red[2], colors.red[1]],
  },
};

export const getStatusAccent = (
  status?: ProgressStatus | null
): StatusAccent => {
  if (!status) return STATUS_ACCENTS.not_started;
  return STATUS_ACCENTS[status] ?? STATUS_ACCENTS.not_started;
};
