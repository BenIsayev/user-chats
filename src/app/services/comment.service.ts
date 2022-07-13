import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { Comment } from '../models/comment.model';
import { UserService } from './user.service';
import comments from '../../assets/data/comments.json';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private COMMENTS_KEY = 'comments';

  private _comments$ = new BehaviorSubject<Comment[]>([] as Comment[]);
  public comments$ = this._comments$.asObservable();

  constructor(private http: HttpClient, private userService: UserService) {}

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

    comments = this.sortCommentsByDate(comments);

    this.saveComments(comments);
    return comments;
  } //Import the comments from a file in case not found in the local storage

  async loadComments() {
    let comments =
      this.loadCommentsFromLocalStorage() || (await this.importComments());
    comments = this.sortByChildren(comments);
    this._comments$.next(comments);
  } //Load comments and setting them in the comments observables(subscribed in relevent components)

  sortCommentsByDate(comments) {
    return comments.sort((comment1, comment2) => {
      const firstCommentTime = Date.parse(comment1.createdAt);
      const secondCommentTime = Date.parse(comment2.createdAt);
      return firstCommentTime - secondCommentTime;
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

  deleteComment(commentId: number) {
    const comments = this.loadCommentsFromLocalStorage();
    const comment = comments.find((comment) => comment.id === commentId);
    console.log(comment);
    comment.deletedAt = new Date().toString();
    this.saveComments(comments);
    this.loadComments();
  }
}
