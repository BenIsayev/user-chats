import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UserMsg } from 'src/app/models/user-msg.model';
import { UserMsgService } from 'src/app/services/user-msg.service';

@Component({
  selector: 'user-msg',
  templateUrl: './user-msg.component.html',
  styleUrls: ['./user-msg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMsgComponent implements OnInit, OnDestroy {
  constructor(
    private userMsgService: UserMsgService,
    private cd: ChangeDetectorRef
  ) {}

  userMsg: UserMsg;
  subscription: Subscription;

  ngOnInit(): void {
    this.subscription = this.userMsgService.msg$.subscribe((msg) => {
      this.cd.markForCheck();
      this.userMsg = { ...msg };
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
