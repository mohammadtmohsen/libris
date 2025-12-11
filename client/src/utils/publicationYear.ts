export type PublicationEra = 'BC' | 'AD';

export const getPublicationEraFromYear = (
  year?: number | null
): PublicationEra | undefined => {
  if (year === undefined || year === null) {
    return undefined;
  }
  return year < 0 ? 'BC' : 'AD';
};

export const getAbsolutePublicationYear = (
  year?: number | null
): number | undefined => {
  if (year === undefined || year === null) {
    return undefined;
  }
  return Math.abs(year);
};

export const toSignedPublicationYear = (
  year: number | '' | undefined,
  era: PublicationEra | '' | undefined
): number | undefined => {
  if (year === undefined || year === '' || era === '' || !era) {
    return undefined;
  }
  const numericYear =
    typeof year === 'number' ? year : Number(Number(year));
  if (!Number.isFinite(numericYear) || numericYear === 0) {
    return undefined;
  }
  return era === 'BC' ? -Math.abs(numericYear) : Math.abs(numericYear);
};
