export class Session {
  constructor(
        public tutorId: string,
        public scheduledAt: Date,
        public duration: number,
        public language: string,
        public topic: string,
        public price: number,
        public status: string,
        public expiresAt: Date,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
  ) { }
}
