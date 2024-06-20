import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.getNotification().subscribe(notification => {
      this.notifications.push(notification);
      setTimeout(() => this.removeNotification(notification.id), 5000); // Auto-remove after 5 seconds
    });
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

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
