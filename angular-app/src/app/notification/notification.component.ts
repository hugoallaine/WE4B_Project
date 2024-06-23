import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../services/notification.service';

/**
 * Notification component
 * 
 * This component is used to display the notifications.
 */
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  /**
   * Constructor
   * 
   * @param notificationService The notification service
   */
  constructor(
    private notificationService: NotificationService
  ) { }

  /**
   * OnInit lifecycle hook
   * 
   * It is used to subscribe to the notification observable.
   */
  ngOnInit(): void {
    this.notificationService.getNotification().subscribe(notification => {
      this.notifications.push(notification);
      setTimeout(() => this.removeNotification(notification.id), 5000); // Auto-remove after 5 seconds
    });
  }

  /**
   * Remove notification
   * 
   * It is used to remove the notification with the given ID.
   * 
   * @param id The notification ID
   */
  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Get toast class
   * 
   * It is used to get the toast class based on the notification type.
   * 
   * @param type The notification type
   * @returns The toast class
   */
  getToastClass(type: 'success' | 'error' | 'info' | 'warning'): string {
    switch (type) {
      case 'success':
        return 'text-bg-success';
      case 'error':
        return 'text-bg-danger';
      case 'info':
        return 'text-bg-info';
      case 'warning':
        return 'text-bg-warning';
      default:
        return 'text-bg-primary';
    }
  }
}
