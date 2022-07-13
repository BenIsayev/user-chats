import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'comment-preview',
  templateUrl: './comment-preview.component.html',
  styleUrls: ['./comment-preview.component.scss'],
})
export class CommentPreviewComponent implements OnInit {
  constructor(private userService: UserService) {}

  @Input() comment: Comment;
  @Input() activeUser: User;
  @Input() level: number;
  @Output() deleteComment = new EventEmitter();
  @Output() addComment = new EventEmitter();

  isCommentOwner: boolean;
  styleForPosition: Object;
  userImgUrl: string;
  isAddComment: boolean;

  ngOnInit(): void {
    this.userImgUrl = `/assets/users/${this.comment.ownerId}.jpg`;
    this.styleForPosition = {
      left: this.level * 50 + 'px',
    };
  }
  ngOnChanges() {
    this.isCommentOwner = this.activeUser.id === this.comment.ownerId;
  }
  toggleAddComment() {
    this.isAddComment = !this.isAddComment;
  }
}
