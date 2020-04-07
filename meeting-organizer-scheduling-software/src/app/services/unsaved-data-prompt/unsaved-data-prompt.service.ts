import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Async modal dialog service
 * This asks the user whether to leave the website they were on and discard unsaved data
 * or to cancel leaving the page and resume entering data
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedDataPromptService {

  
  constructor() { }

  confirm(message?: string): Observable<boolean> {
    const confirmation = window.confirm(message || 'Discard unsaved data?');

    return of(confirmation);
  }
}
