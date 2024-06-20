import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private subject = new Subject<Notification>();
  private idCounter = 0;

  getNotification(): Observable<Notification> {
    return this.subject.asObservable();
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.subject.next({ id: this.idCounter++, message, type });
  }
}
