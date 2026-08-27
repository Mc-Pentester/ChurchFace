// WebRTC Call Types

export type CallType = "audio" | "video";

export interface IncomingCallPayload {
  callId: string;
  offer: RTCSessionDescriptionInit;
  callerId: string;
  callerName: string;
  callerImage?: string | null;
  callType: CallType;
}

export interface CallAnswerPayload {
  callId: string;
  answer: RTCSessionDescriptionInit;
}

export interface CallIcePayload {
  callId: string;
  candidate: RTCIceCandidateInit;
}

export interface CallEndPayload {
  callId: string;
  recipientId: string;
}
