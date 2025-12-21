export const bytesToMegabytes = (
  bytes?: number | null,
  decimals = 1
): number | '' => {
  if (bytes === undefined || bytes === null) return '';
  if (!Number.isFinite(bytes)) return '';

  const mb = bytes / 1_000_000;

  return Number(mb.toFixed(decimals));
};

export const formatMegabytes = (
  bytes?: number | null,
  decimals = 1
): string => {
  const value = bytesToMegabytes(bytes, decimals);
  if (value === '') return '';
  return `${value} MB`;
};
