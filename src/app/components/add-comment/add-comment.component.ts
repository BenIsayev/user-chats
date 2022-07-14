import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent implements OnInit, OnDestroy {
  constructor(private userService: UserService) {}
  @Output() addComment = new EventEmitter();
  @Input() parentCommentId: number;
  @Input() commentId: number;
  @Input() txt: string;

  comment: any;
  activeUserImg: string;
  activeUserSubscription: Subscription;

  ngOnInit(): void {
    this.comment = {
      txt: this.txt || '',
      parentCommentId: this.parentCommentId || null,
      id: this.commentId || null,
    };
    this.activeUserSubscription = this.userService.activeUser$.subscribe(
      (activeUser) => {
        this.activeUserImg = `background-image: url("./assets/users/${activeUser.id}.jpg")`;
      }
    );
  }
  ngOnDestroy(): void {
    this.activeUserSubscription.unsubscribe();
  }

  addCommentHandler() {
    this.comment;

    this.addComment.emit(this.comment);
    this.comment.txt = '';
  }
}
