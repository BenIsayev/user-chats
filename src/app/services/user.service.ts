import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject, of } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private USERS_KEY = 'users';

  public _activeUser$ = new BehaviorSubject<User>({} as User);
  public activeUser$ = this._activeUser$.asObservable();

  constructor(private http: HttpClient) {}

  async importUsers() {
    return await lastValueFrom(this.http.get('../../assets/data/users.json'));
  } //Import the users ONLY if there are no users in the local storage

  loadUsersFromStorage() {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
    this.saveUsers(users);
    return users;
  } //Load the user from the local storage

  saveUsers(users: User[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  } //Save the users to the local storage

  async loadUsers(): Promise<User[]> {
    let users = this.loadUsersFromStorage() || (await this.importUsers());
    return users;
  } //Load the users when needed(from local storage/importing the file in case not found in local storage)

  async chooseUser(userId: number) {
    const users = await this.loadUsers();
    const user = users.find((user) => user.id === userId);

    this._activeUser$.next(user);
  } //Choose active user and set it in the observable(subscribed from relevent components)
}
