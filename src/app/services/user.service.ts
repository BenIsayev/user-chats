import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private USERS_KEY = 'users';
  private ACTIVE_USER_KEY = 'active-user';

  private _activeUser$ = new BehaviorSubject<User>({} as User);
  public activeUser$ = this._activeUser$.asObservable();
  private _users$ = new BehaviorSubject<User[]>([]);
  public users$ = this._users$.asObservable();

  constructor(private http: HttpClient) {}

  async loadUsers(): Promise<User[]> {
    let users = this.loadUsersFromStorage() || (await this.importUsers());
    this.saveUsers(users);
    this._users$.next(users);
    return users;
  } //Load the users when needed(from local storage/importing the file in case not found in local storage)

  private async importUsers() {
    // const users = await lastValueFrom(
    //   // this.http.get('../../assets/data/users.json')
    //   this.http.get('@/src/assets/data/users.json')
    // );
    let users = await import('../../assets/data/users.json');

    return users.default;
  } //Import the users ONLY if there are no users in the local storage

  private loadUsersFromStorage() {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
    if (!users) return null;
    return users;
  } //Load the user from the local storage

  private saveUsers(users: User[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this._users$.next(users);
  } //Save the users to the local storage

  public loadActiveUser() {
    const user = JSON.parse(localStorage.getItem(this.ACTIVE_USER_KEY));
    if (user) this._activeUser$.next(user);
  }

  public async deleteActiveUser(userId) {
    const users = await this.loadUsers();

    const userIdx = users.findIndex((user) => user.id === userId);
    users.splice(userIdx, 1);
    localStorage.removeItem(this.ACTIVE_USER_KEY);

    this.saveUsers(users);
    this._activeUser$.next({} as User);
  }

  public async chooseUser(userId: number) {
    const users = await this.loadUsers();
    const user = users.find((user) => user.id === userId);

    localStorage.setItem(this.ACTIVE_USER_KEY, JSON.stringify(user));
    this._activeUser$.next(user);
  } //Choose active user and set it in the observable(subscribed from relevent components)
}
