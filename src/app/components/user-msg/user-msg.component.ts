import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserMsg } from 'src/app/models/user-msg.model';
import { UserMsgService } from 'src/app/services/user-msg.service';

@Component({
  selector: 'user-msg',
  templateUrl: './user-msg.component.html',
  styleUrls: ['./user-msg.component.scss'],
})
export class UserMsgComponent implements OnInit, OnDestroy {
  constructor(private userMsgService: UserMsgService) {}

  userMsg: UserMsg;
  subscription: Subscription;

  ngOnInit(): void {
    this.subscription = this.userMsgService.msg$.subscribe((msg) => {
      this.userMsg = msg;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
