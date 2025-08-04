interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

class NotificationService {
  private isNotificationSupported: boolean;
  private isPermissionGranted: boolean;

  constructor() {
    this.isNotificationSupported = 'Notification' in window;
    this.isPermissionGranted = this.isNotificationSupported && Notification.permission === 'granted';
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isNotificationSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.isPermissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      return this.isPermissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Send browser notification
  async sendBrowserNotification(options: NotificationOptions): Promise<void> {
    if (!this.isPermissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag || 'trading-signal',
        requireInteraction: options.requireInteraction || false,
        badge: '/favicon.ico'
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  }

  // Send email notification (simulated)
  async sendEmailNotification(emailData: EmailNotification): Promise<void> {
    try {
      // In a real application, this would call your backend email service
      console.log('📧 Email notification sent:', {
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        timestamp: new Date().toISOString()
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Store email in localStorage for demo purposes
      const sentEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
      sentEmails.unshift({
        ...emailData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'sent'
      });
      localStorage.setItem('sent_emails', JSON.stringify(sentEmails.slice(0, 50))); // Keep last 50 emails

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Send signal notification to user
  async notifyNewSignal(signal: any, userEmail: string): Promise<void> {
    const signalTitle = `New ${signal.direction} Signal: ${signal.pair}`;
    const signalBody = `Entry: ${signal.entry} | SL: ${signal.stopLoss} | TP: ${signal.takeProfit[0]} | Confidence: ${signal.confidence}%`;

    // Send browser notification
    await this.sendBrowserNotification({
      title: signalTitle,
      body: signalBody,
      tag: `signal-${signal.id}`,
      requireInteraction: true
    });

    // Send email notification
    await this.sendEmailNotification({
      to: userEmail,
      subject: `🚨 ${signalTitle} - FundedFlow Pro`,
      body: `
        <h2>New Trading Signal Alert</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${signal.pair} - ${signal.direction}</h3>
          <p><strong>Entry Price:</strong> ${signal.entry}</p>
          <p><strong>Stop Loss:</strong> ${signal.stopLoss}</p>
          <p><strong>Take Profit:</strong> ${signal.takeProfit.join(', ')}</p>
          <p><strong>Confidence:</strong> ${signal.confidence}%</p>
          <p><strong>Analysis:</strong> ${signal.analysis}</p>
        </div>
        <p>Login to your dashboard to view full details and manage your trade.</p>
        <p>Best regards,<br>FundedFlow Pro Team</p>
      `,
      isHtml: true
    });

    // Play notification sound
    this.playNotificationSound();
  }

  // Play notification sound
  private playNotificationSound(): void {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Get notification status
  getNotificationStatus(): { supported: boolean; granted: boolean; permission: string } {
    return {
      supported: this.isNotificationSupported,
      granted: this.isPermissionGranted,
      permission: this.isNotificationSupported ? Notification.permission : 'unsupported'
    };
  }
}

export const notificationService = new NotificationService();
export type { NotificationOptions, EmailNotification };