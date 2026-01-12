import { errorMessage } from '~constants/errorMessage';
import { BadRequestError } from '~errors/HttpError';

export class FetchAdminUsersDTO {
  page: number;
  limit: number;
  query: string;
  filter: string;

  constructor(data: {
    page: string;
    limit: string;
    query: string;
    filter: string;
  }) {
    if (!data.page.trim() || !data.limit.trim() || !data.filter.trim())
      throw new BadRequestError(errorMessage.INVALID_DATA);

    this.page = parseInt(data.page.trim());
    this.limit = parseInt(data.limit.trim());
    this.query = data.query.trim();
    this.filter = data.filter.trim();
  }
}
