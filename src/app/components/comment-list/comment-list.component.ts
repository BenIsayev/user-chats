import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
})
export class CommentListComponent implements OnInit {
  constructor() {}
  @Input() comments: Comment[];
  @Input() activeUser: User;
  @Output() deleteComment = new EventEmitter();

  ngOnInit(): void {}
}
