import httpRequest from './httpRequest';
import type { CreateTagData, UpdateTagData } from '@/types/tag';

export const getTags = () => httpRequest.get('/tags');
export const createTag = (data: CreateTagData) => httpRequest.post('/tags', data);
export const updateTag = (id: string, data: UpdateTagData) => httpRequest.patch(`/tags/${id}`, data);
export const deleteTag = (id: string) => httpRequest.delete(`/tags/${id}`);
