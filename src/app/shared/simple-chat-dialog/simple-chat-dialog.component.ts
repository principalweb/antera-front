import { Component, OnInit, OnDestroy, Inject, AfterViewChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from 'app/core/services/socket.service';
import { SocketMessage } from 'app/models/socket-message';
import { Subscription  } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'app/core/services/auth.service';

@Component({
  selector: 'simple-chat-dialog',
  templateUrl: './simple-chat-dialog.component.html',
  styleUrls: ['./simple-chat-dialog.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class SimpleChatDialogComponent implements OnInit {

  // Users displayed in top left of chat dialog
  public users: string[];
  public user: any;
  // Message history
  public messages: Array<any>;
  // The content a user is emitting
  public chatBox: string;
  // The tit you want displayed on top of the chat dialog
  public header: string;
  // sub to the chat message
  private _socketSub: Subscription;
  // formulate a unique socket id in the data passed to this dialog
  // this will be used to connect user rooms
  // ie socketId = [orderId]
  public socketId: any;

  container: HTMLElement;

  constructor(
    public dialogRef: MatDialogRef<SimpleChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private socket: SocketService,
    private auth: AuthService,
  ) {
      this.users = data.users;
      this.header = data.header;
      this.socketId = 'chat-' + data.socketId;
  }

  ngOnInit() {
      this.messages = [];
      this.user = this.auth.getCurrentUser();

      this._socketSub = this.socket.chatMessage.pipe(
        map(message => {
            const msgOut = message.data.user + ': ' + message.data.message;
            this.messages = [...this.messages, msgOut];
        }),
      ).subscribe();
      this.socket.joinRoom(this.socketId);
      this.socket.message({id: this.socketId, data: {message: '[Joined Chat]', user: this.user.userName}});
  }

  ngOnDestroy() {
      this.socket.message({id: this.socketId, data: {message: '[Left Chat]', user: this.user.userName}});
      if (this._socketSub) this._socketSub.unsubscribe();
      this.socket.leaveRoom(this.socketId);
  }

  ngAfterViewChecked() {         
	  this.container = document.getElementById("messageContainer");
	  this.container.scrollTop = this.container.scrollHeight;
  }  

  send() {
      if (this.chatBox == '') {
          return;
      }
      const msg = {
          id: this.socketId,
          data: {
              message: this.chatBox,
              user: this.user.userName
          }
      }
      const msgSent = msg.data.user + ': ' + this.chatBox;
      this.messages = [...this.messages, msgSent];
      this.chatBox ='';
      this.socket.message(msg);
  }

  public isSystemMessage(message: string) {
    return message.startsWith("/") ? "<strong>" + message.substring(1) + "</strong>" : message;
  }
}
