// Domain Events for Users
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  role: string;
  createdAt: Date;
}
