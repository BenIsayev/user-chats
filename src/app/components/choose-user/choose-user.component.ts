import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'choose-user',
  templateUrl: './choose-user.component.html',
  styleUrls: ['./choose-user.component.scss'],
})
export class ChooseUserComponent implements OnInit, OnDestroy {
  constructor(private userService: UserService) {}

  users: User[];
  chosenUser: User;
  activeUserSubscription: Subscription;
  usersSubscription: Subscription;

  async ngOnInit(): Promise<void> {
    this.userService.loadUsers();
    this.usersSubscription = this.userService.users$.subscribe(
      (users) => (this.users = users)
    );
    this.activeUserSubscription = this.userService.activeUser$.subscribe(
      (activeUser) => (this.chosenUser = activeUser)
    );
  }

  ngOnDestroy(): void {
    this.activeUserSubscription.unsubscribe();
    this.usersSubscription.unsubscribe();
  }

  chooseUser(ev) {
    const userId: number = ev.target.value;
    this.userService.chooseUser(+userId);
  }
}
