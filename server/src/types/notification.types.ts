export interface NotificationStatusResponse {
  subscribed: boolean;
  enabled?: boolean;
  preferredTime?: string;
  notificationTypes?: {
    dailyReminder: boolean;
    streakWarning: boolean;
  };
}

/** Browser PushSubscription JSON sent from the client. */
export interface WebPushSubscription {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
  [key: string]: unknown;
}

export interface SendNotificationInput {
  targetUserId?: string;
  title?: string;
  body?: string;
  url?: string;
}
