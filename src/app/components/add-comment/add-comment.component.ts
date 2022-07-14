import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent implements OnInit {
  constructor() {}
  @Output() addComment = new EventEmitter();
  @Input() parentCommentId: number;
  @Input() commentId: number;
  @Input() txt: string;

  comment: any;
  activeUserImgUrl: string;

  ngOnInit(): void {
    this.comment = {
      txt: this.txt || '',
      parentCommentId: this.parentCommentId || null,
      id: this.commentId || null,
    };
  }

  addCommentHandler() {
    this.comment;

    this.addComment.emit(this.comment);
    this.comment.txt = '';
  }
}
