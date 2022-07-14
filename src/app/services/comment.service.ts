import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { Comment } from '../models/comment.model';
import { UserService } from './user.service';
import comments from '../../assets/data/comments.json';
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

  loadCommentsFromLocalStorage() {
    return JSON.parse(localStorage.getItem(this.COMMENTS_KEY));
  } //Load comments from the local storage

  saveComments(comments) {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  } //Save comments to the local storage

  async importComments() {
    const users = await this.userService.loadUsers();
    let comments: any = await lastValueFrom(
      this.http.get<Observable<Comment[]>>('../../assets/data/comments.json')
    );
    comments = comments.map((comment) => {
      return {
        ...comment,
        owner: users.find((user) => user.id === comment.ownerId),
      };
    });

    this.saveComments(comments);
    return comments;
  } //Import the comments from a file in case not found in the local storage

  async loadComments() {
    let comments =
      this.loadCommentsFromLocalStorage() || (await this.importComments());
    comments = this.sortCommentsByDate(comments);
    // comments = this.sortByChildren(comments);
    comments = this.sortByChildrenSecond(comments); // Another way to sort by children(a little more simple)

    this._comments$.next(comments);
  } //Load comments and setting them in the comments observables(subscribed in relevent components)

  sortCommentsByDate(comments) {
    return comments.sort((comment1, comment2) => {
      const firstCommentTime = Date.parse(comment1.createdAt);
      const secondCommentTime = Date.parse(comment2.createdAt);
      return secondCommentTime - firstCommentTime;
    });
  }

  sortByChildren(comments) {
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

  sortByChildrenSecond(comments) {
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
    // const flatComments = this.loadCommentsFromLocalStorage();
    let comments: Comment[];
    const subscription = this.comments$.subscribe(
      (recentComments) => (comments = recentComments)
    );

    let CommentsToDeleteFrom = flat(comments); //Flatten the comments to find specific comment because in the local storage they are saved without children property

    const comment = CommentsToDeleteFrom.find(
      (potentialComment) => potentialComment.id === commentId
    );

    comment.deletedAt = new Date().toString();
    if (comment.children?.length) {
      this.markChildrenAsDeleted(comment);
    }
    this.saveComments(comments);
    this.loadComments();
    this.userMsgService.setMsg({ txt: 'Comment deleted', type: 'success' });
    subscription.unsubscribe();

    function flat(array) {
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

  markChildrenAsDeleted(comment: Comment) {
    comment.children.forEach((child) => {
      child.deletedAt = new Date().toString();
      if (child.children?.length) this.markChildrenAsDeleted(child);
    });
  }

  handleComment(comment) {
    comment.id ? this.editComment(comment) : this.addComment(comment);
  }
  addComment(comment) {
    const commentToAdd = this.getEmptyComment();
    commentToAdd.owner = comment.owner;
    commentToAdd.ownerId = comment.owner.id;
    commentToAdd.txt = comment.txt;
    commentToAdd.parentCommentId = comment.parentCommentId;

    const comments = this.loadCommentsFromLocalStorage();
    comments.push(commentToAdd);
    this.userMsgService.setMsg({ txt: 'Comment added', type: 'success' });
    this.saveComments(comments);
    this.loadComments();
  }

  editComment(commentToSave) {
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
}
