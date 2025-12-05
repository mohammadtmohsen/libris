import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '_axios';
import axiosRaw from 'axios';

import type {
  PresignUploadRequest,
  PresignUploadResponse,
  SignedUrlResponse,
  UploadToPresignedUrlRequest,
} from './storageQueries.types';
import { STORAGE_QUERY_BASE, STORAGE_QUERY_KEYS } from './storageQueries.keys';

export const useGetBookSignedUrl = ({
  bookId,
  includeCover = false,
  enabled = true,
}: {
  bookId?: string;
  includeCover: boolean;
  enabled?: boolean;
}) => {
  const queryResult = useQuery({
    queryKey: [STORAGE_QUERY_KEYS.GET_BOOK_URL, bookId, includeCover],
    enabled: Boolean(bookId) && enabled,
    queryFn: async () => {
      if (!bookId) return null;
      const res = await axiosInstance.get<SignedUrlResponse>(
        `${STORAGE_QUERY_BASE}/${bookId}/url`,
        { params: { includeCover } }
      );
      return res.data;
    },
  });
  return queryResult;
};

export const usePresignUpload = () => {
  const mutation = useMutation({
    mutationKey: [STORAGE_QUERY_KEYS.PRESIGN_UPLOAD],
    mutationFn: async (payload: PresignUploadRequest) => {
      const res = await axiosInstance.post<PresignUploadResponse>(
        `${STORAGE_QUERY_BASE}/presign-upload`,
        payload
      );
      return res.data;
    },
  });
  return mutation;
};

export const useUploadToPresignedUrl = () => {
  const mutation = useMutation({
    mutationKey: [STORAGE_QUERY_KEYS.UPLOAD_TO_PRESIGNED_URL],
    mutationFn: async (payload: UploadToPresignedUrlRequest) => {
      const { file, presign } = payload;
      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
        ...(presign.headers || {}),
      };
      await axiosRaw.put(presign.uploadUrl, file, { headers });
    },
  });
  return mutation;
};
