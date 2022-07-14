import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Comment } from '../models/comment.model';
import { UserService } from './user.service';
import { UserMsgService } from './user-msg.service';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private COMMENTS_KEY = 'comments';

  private _comments$ = new BehaviorSubject<Comment[]>([] as Comment[]);
  public comments$ = this._comments$.asObservable();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private userMsgService: UserMsgService
  ) {}

  async loadComments() {
    //Load comments and setting them in the comments observables(subscribed in relevent components)
    let comments =
      this.loadCommentsFromLocalStorage() || (await this.importComments());
    comments = this.sortCommentsByDate(comments);
    // comments = this.sortByChildren(comments);
    comments = this.sortByChildrenSecond(comments); // Another way to sort by children(a little more simple)

    this._comments$.next(comments);
  }

  private loadCommentsFromLocalStorage() {
    //Load comments from the local storage
    return JSON.parse(localStorage.getItem(this.COMMENTS_KEY));
  }

  private saveComments(comments) {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  } //Save comments to the local storage

  private async importComments() {
    const users = await this.userService.loadUsers();

    let comments: any = await import('../../assets/data/comments.json');

    comments = comments.default.map((comment) => {
      return {
        ...comment,
        owner: users.find((user) => user.id === comment.ownerId),
      };
    });

    this.saveComments(comments);
    return comments;
  } //Import the comments from a file in case not found in the local storage

  private sortCommentsByDate(comments) {
    return comments.sort((comment1, comment2) => {
      const firstCommentTime = Date.parse(comment1.createdAt);
      const secondCommentTime = Date.parse(comment2.createdAt);
      return secondCommentTime - firstCommentTime;
    });
  }

  private sortByChildren(comments) {
    const byParent = new Map();
    for (const comment of comments) {
      let children = byParent.get(comment.parentCommentId);
      if (!children) {
        children = [];
        byParent.set(comment.parentCommentId, children);
      }
      children.push(comment);
    }

    function getChildren(comment) {
      return {
        ...comment,
        children: byParent.get(comment.id)?.map(getChildren),
      };
    }

    const mappedComments = [];

    comments
      .filter((comment) => !comment.parentCommentId)
      .forEach((comment) => {
        mappedComments.push(getChildren(comment));
      });

    return mappedComments;
  }

  private sortByChildrenSecond(comments) {
    const sortedComments = [];
    const refrences = [];
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];

      if (comment.parentCommentId) {
        let parentComment = comments.find(
          (potentialParent) => potentialParent.id === comment.parentCommentId
        );
        if (!parentComment) {
          parentComment = refrences.find(
            (potentialParent) => potentialParent.id === comment.parentCommentId
          );
        }
        if (!parentComment)
          parentComment = sortedComments.find(
            (potentialParent) => potentialParent.id === comment.parentCommentId
          );

        if (!parentComment.children) parentComment.children = [comment];
        else parentComment.children.push(comment);
        refrences.push(comment);
      } else {
        sortedComments.push(comment);
      }
    }
    return sortedComments;
  }

  deleteComment(commentId: number) {
    let comments: Comment[];
    const subscription = this.comments$.subscribe(
      (recentComments) => (comments = recentComments)
    );

    let CommentsToDeleteFrom = flat(comments); //Flatten the comments to find specific comment because in the local storage they are saved without children property
    CommentsToDeleteFrom.forEach((comment) => {
      delete comment.children;
    }); //Deleting all children from comments because later it arranges them from the start and can make alot of duplications

    const comment = CommentsToDeleteFrom.find(
      (potentialComment) => potentialComment.id === commentId
    );

    comment.deletedAt = new Date().toString();
    if (comment.children?.length) {
      this.markChildrenAsDeleted(comment);
    }
    this.saveComments(CommentsToDeleteFrom);
    this.loadComments();
    this.userMsgService.setMsg({ txt: 'Comment deleted', type: 'success' });
    subscription.unsubscribe();

    function flat(array) {
      array = JSON.parse(JSON.stringify(array));
      let result = [];
      array.forEach(function (a) {
        result.push(a);
        if (Array.isArray(a.children)) {
          result = result.concat(flat(a.children));
        }
      });
      return result;
    }
  }

  private markChildrenAsDeleted(comment: Comment) {
    comment.children.forEach((child) => {
      child.deletedAt = new Date().toString();
      if (child.children?.length) this.markChildrenAsDeleted(child);
    });
  }

  handleComment(comment) {
    comment.id ? this.editComment(comment) : this.addComment(comment);
  }
  private addComment({ owner, txt, parentCommentId }) {
    let commentToAdd = this.getEmptyComment();
    commentToAdd = {
      ...commentToAdd,
      owner,
      ownerId: owner.id,
      txt,
      parentCommentId,
    };

    const comments = this.loadCommentsFromLocalStorage();
    comments.push(commentToAdd);
    this.userMsgService.setMsg({ txt: 'Comment added', type: 'success' });
    this.saveComments(comments);
    this.loadComments();
  }

  private editComment(commentToSave) {
    const comments = this.loadCommentsFromLocalStorage();
    const comment = comments.find((comment) => comment.id === commentToSave.id);
    comment.txt = commentToSave.txt;
    comment.createdAt = new Date().toString();
    this.userMsgService.setMsg({ txt: 'Comment edited', type: 'success' });

    this.saveComments(comments);
    this.loadComments();
  }

  private getEmptyComment(): Comment {
    return {
      id: +Date.now(),
      parentCommentId: null,
      createdAt: new Date().toString(),
      deletedAt: null,
      children: [],
    } as Comment;
  }

  public deleteUserComments(userId: number) {
    const comments = this.loadCommentsFromLocalStorage();
    let ids = comments
      .filter((comment: Comment) => comment.ownerId === userId)
      .map((comment) => comment.id);

    ids.forEach((id) => {
      this.deleteComment(id);
    });
  }
}
