import { BadRequestError } from '~errors/HttpError';

export class GetBookingsDTO {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  date?: string;
  language?: string;
  sort?: 'Newest' | 'Oldest';
  userId?: string;
  tutorId?: string;

  constructor(data: {
    page?: string | number;
    limit?: string | number;
    search?: string;
    status?: string;
    date?: string;
    language?: string;
    sort?: string;
    userId?: string;
    tutorId?: string;
  }) {
    this.page = data.page ? parseInt(String(data.page)) : 1;
    this.limit = data.limit ? parseInt(String(data.limit)) : 5;
    this.search = data.search ? String(data.search).trim() : undefined;
    this.status = data.status && data.status !== 'undefined' ? String(data.status).trim() : undefined;
    this.date = data.date && data.date !== 'undefined' ? String(data.date).trim() : undefined;
    this.language = data.language && data.language !== 'undefined' ? String(data.language).trim() : undefined;
    this.sort = data.sort === 'Oldest' ? 'Oldest' : 'Newest';
    this.userId = data.userId;
    this.tutorId = data.tutorId;

    if (isNaN(this.page) || isNaN(this.limit)) {
      throw new BadRequestError('Invalid pagination parameters');
    }
  }
}
