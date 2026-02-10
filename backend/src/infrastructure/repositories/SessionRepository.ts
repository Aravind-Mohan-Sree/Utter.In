import { BaseRepository } from './BaseRepository';
import { Session } from '~entities/Session';
import { ISession, SessionModel } from '~models/SessionModel';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import mongoose from 'mongoose';

export class SessionRepository extends BaseRepository<Session, ISession> implements ISessionRepository {
    constructor() {
        super(SessionModel);
    }

    async findAllByTutorAndDateRange(tutorId: string, startDate: Date, endDate: Date): Promise<Session[]> {
        const docs = await this.model.find({
            tutorId: new mongoose.Types.ObjectId(tutorId),
            scheduledAt: { $gte: startDate, $lte: endDate }
        });

        return docs.map(doc => this.toEntity(doc)) as Session[];
    }

    protected toSchema(entity: Session | Partial<Session>): ISession | Partial<ISession> {
        return {
            tutorId: entity.tutorId ? new mongoose.Types.ObjectId(entity.tutorId) : undefined,
            scheduledAt: entity.scheduledAt,
            duration: entity.duration,
            language: entity.language,
            topic: entity.topic,
            price: entity.price,
            status: entity.status,
            expiresAt: entity.expiresAt,
        };
    }

    protected toEntity(data: (ISession & mongoose.Document) | null): Session | null {
        if (!data) return null;
        return new Session(
            data.tutorId.toString(),
            data.scheduledAt,
            data.duration,
            data.language,
            data.topic,
            data.price,
            data.status,
            data.expiresAt,
            data._id.toString(),
            data.createdAt,
            data.updatedAt
        );
    }
}
