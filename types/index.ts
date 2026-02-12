export interface User {
  _id: string;
  email: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Room {
  _id: string;
  roomId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  oppositeUserId: string | null;
  oppositeUserName: string | null;
  oppositeUserEmail: string | null;
  creatorStarted: boolean;
  oppositeUserStarted: boolean;
  winner: string | null;
  status: "waiting" | "ready" | "spinning" | "completed";
  invitedEmail?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface SpinResult {
  winner: string;
  winnerName: string;
  timestamp: string;
}

export interface SocketMessage {
  type: string;
  data: any;
}

export interface RoomInvitation {
  roomId: string;
  creatorName: string;
  creatorEmail: string;
  invitedEmail: string;
  timestamp: string;
}
