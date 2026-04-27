import { NextFunction, Request, Response } from 'express';
import {
  IGetConversationsUseCase,
  IGetMessagesUseCase,
  ISendMessageUseCase,
  ISearchChatUseCase,
  IEditMessageUseCase,
  IDeleteMessageUseCase,
} from '~use-case-interfaces/user/IChatUseCase';
import { ChatMapper } from '~mappers/ChatMapper';
import { logger } from '~logger/logger';
import { UserMapper } from '~mappers/UserMapper';
import { SendMessageDTO } from '~dtos/ChatDTO';
import { IValidateDataService, FileInput } from '~service-interfaces/IValidateDataService';
import { IUploadChatAttachmentUseCase, ContentType } from '~use-case-interfaces/shared/IFileUseCase';
import { UploadedFiles } from '~middlewares/multer';
import { BadRequestError } from '~errors/HttpError';
import { filePrefixes } from '~constants/fileConstants';
import { unlink } from 'fs/promises';

/**
 * Controller for handling chat-related operations.
 * Manages conversations, messages, searching, and file attachments.
 */
export class ChatController {
  constructor(
    private _getConversationsUseCase: IGetConversationsUseCase,
    private _getMessagesUseCase: IGetMessagesUseCase,
    private _sendMessageUseCase: ISendMessageUseCase,
    private _searchChatUseCase: ISearchChatUseCase,
    private _editMessageUseCase: IEditMessageUseCase,
    private _deleteMessageUseCase: IDeleteMessageUseCase,
    private _uploadChatAttachmentUseCase: IUploadChatAttachmentUseCase,
    private _validator: IValidateDataService,
  ) {}

  /**
   * Retrieves all conversations for the authenticated user.
   */
  getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const conversations = await this._getConversationsUseCase.execute(userId);
      return res.status(200).json({
        success: true,
        conversations: ChatMapper.toConversationList(conversations),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Retrieves messages for a specific conversation with pagination.
   */
  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const { page, limit, targetId } = req.query;
      const userId = req.user!.id;
      const result = await this._getMessagesUseCase.execute(
        conversationId,
        userId,
        {
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 30,
          targetId: targetId as string | undefined,
        },
      );
      return res.status(200).json({
        success: true,
        messages: ChatMapper.toMessageList(result.messages),
        page: result.page,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Sends a new message in a conversation.
   */
  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new SendMessageDTO(req.body, this._validator);
      const senderId = req.user!.id;
      const message = await this._sendMessageUseCase.execute(
        senderId,
        dto.receiverId,
        dto.text,
        dto.fileUrl,
        dto.fileType,
        dto.fileName,
      );
      return res.status(201).json({
        success: true,
        message: ChatMapper.toMessageResponse(message),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Searches for users and messages within the chat context.
   */
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, page, limit, sort, language } = req.query;
      const userId = req.user!.id;
      const results = await this._searchChatUseCase.execute(userId, {
        q: String(q || ''),
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort: String(sort || 'newest'),
        language: String(language || 'All'),
      });
      return res.status(200).json({
        success: true,
        users: results.users.map((u) => UserMapper.toResponse(u)),
        messages: ChatMapper.toMessageList(results.messages),
        totalUsersCount: results.totalUsersCount,
        filteredUsersCount: results.filteredUsersCount,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Edits an existing message's text.
   */
  editMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      const userId = req.user!.id;
      const message = await this._editMessageUseCase.execute(
        messageId,
        userId,
        text,
      );
      return res.status(200).json({
        success: true,
        message: ChatMapper.toMessageResponse(message),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Deletes a message (optionally for everyone in the conversation).
   */
  deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const { forEveryone } = req.query;
      const userId = req.user!.id;
      const message = await this._deleteMessageUseCase.execute(
        messageId,
        userId,
        forEveryone === 'true',
      );
      return res.status(200).json({
        success: true,
        message: ChatMapper.toMessageResponse(message),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Uploads a file attachment for a chat message.
   */
  uploadAttachment = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const attachment = files.attachment ? files.attachment[0] : null;

    try {
      if (!attachment) {
        throw new BadRequestError('Attachment is required');
      }

      // Validate file type and size
      const validationRes = this._validator.validateAttachment(attachment as FileInput);
      if (!validationRes.success) {
        throw new BadRequestError(validationRes.message);
      }

      // Upload file to cloud storage
      const url = await this._uploadChatAttachmentUseCase.execute(
        filePrefixes.CHAT_ATTACHMENT,
        attachment.originalname,
        attachment.path,
        attachment.mimetype as ContentType,
      );

      return res.status(200).json({
        success: true,
        url,
        fileName: attachment.originalname,
        fileType: attachment.mimetype,
      });
    } catch (error) {
      // Clean up temporary local file if upload fails
      if (attachment?.path) {
        await unlink(attachment.path).catch(() => void 0);
      }
      logger.error(error);
      next(error);
    }
  };
}
