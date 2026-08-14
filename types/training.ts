export type TrainingRoomType = "VIDEO" | "AUDIO" | "TEXT";

export type TrainingRoom = {
  id: string;
  title: string;
  description?: string | null;
  roomType: TrainingRoomType;
  isActive: boolean;
  isPublic: boolean;
  instructorId?: string | null;
  churchId?: string | null;
  maxParticipants?: number | null;
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    participants: number;
  };
};

export type TrainingParticipant = {
  id: string;
  userId: string;
  trainingRoomId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
};

export type TrainingSession = {
  id: string;
  trainingRoomId: string;
  startedAt?: Date | null;
  endedAt?: Date | null;
  recordingUrl?: string | null;
};
