import axios from 'axios';
import type { Assignment, CreateAssignmentDTO, ApiResponse } from '../../shared/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 60000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

export const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    const res = await api.get<ApiResponse<Assignment[]>>('/api/assignments');
    return res.data.data || [];
  },

  async getById(id: string): Promise<Assignment> {
    const res = await api.get<ApiResponse<Assignment>>(`/api/assignments/${id}`);
    if (!res.data.data) throw new Error('Assignment not found');
    return res.data.data;
  },

  async create(
    dto: CreateAssignmentDTO,
    file?: File | null
  ): Promise<{ assignmentId: string; jobId: string }> {
    if (file) {
      // Multipart form-data upload
      const form = new FormData();
      form.append('file', file);
      form.append('subject', dto.subject);
      form.append('grade', dto.grade);
      form.append('dueDate', dto.dueDate);
      form.append('questionTypes', JSON.stringify(dto.questionTypes));
      if (dto.additionalInstructions) {
        form.append('additionalInstructions', dto.additionalInstructions);
      }
      const res = await api.post<ApiResponse<{ assignmentId: string; jobId: string }>>(
        '/api/assignments',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (!res.data.data) throw new Error('Creation failed');
      return res.data.data;
    }

    // JSON submission (no file)
    const res = await api.post<ApiResponse<{ assignmentId: string; jobId: string }>>(
      '/api/assignments',
      dto,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (!res.data.data) throw new Error('Creation failed');
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/assignments/${id}`);
  },

  async regenerate(id: string): Promise<{ assignmentId: string; jobId: string }> {
    const res = await api.post<ApiResponse<{ assignmentId: string; jobId: string }>>(
      `/api/assignments/${id}/regenerate`
    );
    if (!res.data.data) throw new Error('Regeneration failed');
    return res.data.data;
  },

  getPDFUrl(id: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/assignments/${id}/pdf`;
  },
};
