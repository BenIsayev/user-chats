import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent implements OnInit {
  constructor() {}
  @Output() addComment = new EventEmitter();
  @Input() parentCommentId;
  @Input() commentId;
  @Input() txt;

  comment: any;

  ngOnInit(): void {
    this.comment = {
      txt: this.txt || '',
      parentCommentId: this.parentCommentId || null,
      id: this.commentId || null,
    };
  }

  addCommentHandler() {
    console.log(this.comment);

    this.addComment.emit(this.comment);
    this.comment.txt = '';
  }
}
