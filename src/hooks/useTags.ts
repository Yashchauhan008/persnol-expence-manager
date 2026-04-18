import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTags, createTag, updateTag, deleteTag } from '@/services/api/tag.api';
import type { CreateTagData, Tag, UpdateTagData } from '@/types/tag';
import { useAuth } from '@/context/AuthContext';

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
};

export function useGetTags() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...tagKeys.lists(), user?.id],
    queryFn: async () => {
      const res = await getTags();
      return res.data.data as Tag[];
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagData) => createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success('Tag created');
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagData }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success('Tag updated');
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success('Tag deleted');
    },
  });
}
