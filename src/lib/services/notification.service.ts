export interface NotificationService {
  sendSms(to: string, message: string): Promise<void>;
}

class TwilioNotificationService implements NotificationService {
  async sendSms(to: string, message: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      console.warn("Twilio not configured — SMS skipped:", { to, message });
      return;
    }

    const { Twilio } = await import("twilio");
    const client = new Twilio(accountSid, authToken);
    await client.messages.create({ body: message, from, to });
  }
}

class LogNotificationService implements NotificationService {
  async sendSms(to: string, message: string): Promise<void> {
    console.log(`[SMS] To: ${to} | Message: ${message}`);
  }
}

export const notificationService: NotificationService =
  process.env.NODE_ENV === "production"
    ? new TwilioNotificationService()
    : new LogNotificationService();
