import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Notification
 * 
 * This interface is used to define the notification.
 */
export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

/**
 * Notification service
 * 
 * This service is used to manage the notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private subject = new Subject<Notification>();
  private idCounter = 0;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Get notification
   * 
   * It is used to get the notification.
   * 
   * @returns The notification
   */
  getNotification(): Observable<Notification> {
    return this.subject.asObservable();
  }

  /**
   * Show notification
   * 
   * It is used to show the notification.
   * 
   * @param message The message
   * @param type The type
   */
  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.subject.next({ id: this.idCounter++, message, type });
  }
}
