import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'user-chats';
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.loadActiveUser();
  }
}
