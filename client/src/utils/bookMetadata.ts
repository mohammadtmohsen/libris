export type ParsedBookMetadata = {
  title: string;
  author?: string;
  publicationYear?: number;
};

export const parseBookMetadataFromFilename = (
  fileName: string
): ParsedBookMetadata => {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const normalized = baseName.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return { title: '' };
  }

  const spacedDashMatch = normalized.match(/\s+-\s+/);
  let author = '';
  let remainder = '';

  if (spacedDashMatch && spacedDashMatch.index !== undefined) {
    const separatorIndex = spacedDashMatch.index;
    author = normalized.slice(0, separatorIndex).trim();
    remainder = normalized
      .slice(separatorIndex + spacedDashMatch[0].length)
      .trim();
  } else {
    const dashIndex = normalized.indexOf('-');
    if (dashIndex === -1) {
      return { title: normalized };
    }
    author = normalized.slice(0, dashIndex).trim();
    remainder = normalized.slice(dashIndex + 1).trim();
  }

  if (!remainder) {
    return { title: normalized };
  }

  let title = remainder;
  let publicationYear: number | undefined;
  const yearMatch = remainder.match(/^(\d{3,4})(?:\s+|[-_]+)(.+)$/);

  if (yearMatch) {
    const parsedYear = Number(yearMatch[1]);
    if (!Number.isNaN(parsedYear)) {
      publicationYear = parsedYear;
      title = yearMatch[2].trim();
    }
  }

  if (!title) {
    title = normalized;
  }

  return {
    title,
    author: author || undefined,
    publicationYear,
  };
};
