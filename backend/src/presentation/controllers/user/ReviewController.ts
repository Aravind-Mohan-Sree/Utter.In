import { NextFunction, Request, Response } from 'express';
import {
  IAddReviewUseCase,
  IGetReviewsUseCase,
  IUpdateReviewUseCase,
  IDeleteReviewUseCase,
  IGetReviewEligibilityUseCase,
} from '~use-case-interfaces/user/IReviewUseCase';
import { ReviewMapper } from '~mappers/ReviewMapper';
import { AddReviewDTO, UpdateReviewDTO } from '~dtos/ReviewDTO';
import { logger } from '~logger/logger';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { successMessage } from '~constants/successMessage';

export class ReviewController {
  constructor(
    private _addReviewUseCase: IAddReviewUseCase,
    private _getReviewsUseCase: IGetReviewsUseCase,
    private _updateReviewUseCase: IUpdateReviewUseCase,
    private _deleteReviewUseCase: IDeleteReviewUseCase,
    private _getReviewEligibilityUseCase: IGetReviewEligibilityUseCase,
    private _validator: IValidateDataService,
  ) {}

  addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new AddReviewDTO(req.body, this._validator);

      const userId = req.user!.id;
      const review = await this._addReviewUseCase.execute(
        userId,
        dto.tutorId,
        dto.rating,
        dto.note,
      );

      return res.status(201).json({
        success: true,
        message: successMessage.REVIEW_ADDED,
        review: ReviewMapper.toResponse(review),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tutorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      const { reviews, totalCount, totalPages, currentPage } =
        await this._getReviewsUseCase.execute(tutorId, page, limit);

      return res.status(200).json({
        success: true,
        reviews: ReviewMapper.toResponseList(reviews),
        totalCount,
        totalPages,
        currentPage,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto = new UpdateReviewDTO(req.body, this._validator);

      const userId = req.user!.id;
      const review = await this._updateReviewUseCase.execute(
        id,
        userId,
        dto.rating,
        dto.note,
      );

      return res.status(200).json({
        success: true,
        message: successMessage.REVIEW_UPDATED,
        review: ReviewMapper.toResponse(review),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await this._deleteReviewUseCase.execute(id, userId);

      return res.status(200).json({
        success: true,
        message: successMessage.REVIEW_DELETED,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  checkEligibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tutorId } = req.params;
      const userId = req.user!.id;
      const eligibility = await this._getReviewEligibilityUseCase.execute(
        userId,
        tutorId,
      );

      return res.status(200).json({
        success: true,
        ...eligibility,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
