import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './pages/app-root/app.component';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { ChooseUserComponent } from './components/choose-user/choose-user.component';
import { CommentPageComponent } from './pages/comment-page/comment-page.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';
import { CommentPreviewComponent } from './components/comment-preview/comment-preview.component';
import { TimeformatPipe } from './pipes/timeformat.pipe';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { FormsModule } from '@angular/forms';
import { UserMsgComponent } from './components/user-msg/user-msg.component';

@NgModule({
  declarations: [
    AppComponent,
    MainHeaderComponent,
    ChooseUserComponent,
    CommentPageComponent,
    CommentListComponent,
    CommentPreviewComponent,
    TimeformatPipe,
    AddCommentComponent,
    UserMsgComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
