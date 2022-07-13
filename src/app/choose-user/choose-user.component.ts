import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'choose-user',
  templateUrl: './choose-user.component.html',
  styleUrls: ['./choose-user.component.scss'],
})
export class ChooseUserComponent implements OnInit {
  constructor(private userService: UserService) {}

  users: User[];
  chosenUser: User;

  async ngOnInit(): Promise<void> {
    this.users = await this.userService.loadUsers();
  }

  chooseUser(ev) {
    const userId: number = ev.target.value;
    this.userService.chooseUser(+userId);
  }
}
