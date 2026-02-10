import { Session } from '~entities/Session';

export class SessionMapper {
    static toResponse(session: Session) {
        return {
            id: session.id,
            tutorId: session.tutorId,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            language: session.language,
            topic: session.topic,
            price: session.price,
            status: session.status,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
        };
    }
}

export type SessionResponseDTO = ReturnType<typeof SessionMapper.toResponse>;
