import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserMsg } from '../models/user-msg.model';

@Injectable({
  providedIn: 'root',
})
export class UserMsgService {
  constructor() {}

  private _msg$ = new BehaviorSubject({} as UserMsg);
  public msg$ = this._msg$.asObservable();

  setMsg(msg) {
    this._msg$.next(msg);
    setTimeout(() => {
      this._msg$.next({} as UserMsg);
    }, 3000);
  }
}
