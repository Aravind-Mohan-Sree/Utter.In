import { Message } from '~entities/Message';
import { User } from '~entities/User';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ISearchChatUseCase } from '~use-case-interfaces/user/IChatUseCase';

export class SearchChatUseCase implements ISearchChatUseCase {
  constructor(
    private _messageRepository: IMessageRepository,
    private _userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    params: {
      q: string;
      page?: number;
      limit?: number;
      sort?: string;
      language?: string;
    },
  ): Promise<{
    users: User[];
    messages: Message[];
    totalUsersCount: number;
    filteredUsersCount: number;
  }> {
    const { q, page = 1, limit = 10, sort = 'newest', language = 'All' } = params;

    const [userRes, messages] = await Promise.all([
      this._userRepository.fetchUsers(page, limit, q, 'All', sort, language, userId),
      this._messageRepository.searchMessages(userId, q),
    ]);

    return {
      users: userRes.users,
      messages,
      totalUsersCount: userRes.totalUsersCount,
      filteredUsersCount: userRes.filteredUsersCount,
    };
  }
}
