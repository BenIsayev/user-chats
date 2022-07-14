import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Comment } from 'src/app/models/comment.model';
import { CommentService } from 'src/app/services/comment.service';
import { UserMsgService } from 'src/app/services/user-msg.service';

@Component({
  selector: 'comment-page',
  templateUrl: './comment-page.component.html',
  styleUrls: ['./comment-page.component.scss'],
})
export class CommentPageComponent implements OnInit, OnDestroy {
  constructor(
    private userService: UserService,
    private commentService: CommentService,
    private userMsgService: UserMsgService
  ) {}

  userSubscription: Subscription;
  commentsSubscription: Subscription;
  activeUser: User;
  comments: Comment[];

  ngOnInit(): void {
    this.commentService.loadComments();

    this.userSubscription = this.userService.activeUser$.subscribe((user) => {
      this.activeUser = { ...user };
    });

    this.commentsSubscription = this.commentService.comments$.subscribe(
      (comments) => {
        this.comments = comments;
      }
    );
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.commentsSubscription.unsubscribe();
  }

  deleteComment(commentId) {
    this.commentService.deleteComment(commentId);
  }
  addComment(comment) {
    if (!this.activeUser.id) {
      this.userMsgService.setMsg({
        txt: 'Login to add comment',
        type: 'alert',
      });
      return;
    }
    comment.owner = this.activeUser;
    this.commentService.handleComment(comment);
  }
}
