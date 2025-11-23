export enum NotificationType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  READ = 'READ',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export class Notification {
  constructor(
    public readonly id: string,
    public userId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public status: NotificationStatus,
    public metadata: Record<string, any>,
    public readonly createdAt: Date,
    public sentAt: Date | null,
  ) {}

  static create(props: {
    id?: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    status?: NotificationStatus;
    metadata?: Record<string, any>;
    createdAt?: Date;
    sentAt?: Date | null;
  }): Notification {
    const now = new Date();
    return new Notification(
      props.id || '',
      props.userId,
      props.type,
      props.title,
      props.message,
      props.status || NotificationStatus.PENDING,
      props.metadata || {},
      props.createdAt || now,
      props.sentAt || null,
    );
  }

  markAsRead(): void {
    this.status = NotificationStatus.READ;
  }

  markAsSent(): void {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
  }

  markAsFailed(): void {
    this.status = NotificationStatus.FAILED;
  }
}
