import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SocketMessage } from 'app/models/socket-message';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  currentOrder = this.socket.fromEvent<SocketMessage>('order-edited');
  chatMessage = this.socket.fromEvent<SocketMessage>('message-received');
  orderRemoteChange = this.socket.fromEvent<SocketMessage>('order-changed');

  constructor(private socket: Socket) { }

  // call this in the parent module
  // if you're using the simple chat dialog then it expects the socket
  // will have already connected
  // at that point you should just be joining/leaving rooms
  // call disconnect in ngOnDestroy in the module that you connected the socket
  connect() {
      this.socket.connect();
  }
  // orders
  orderEdited(data: any) {
    this.socket.emit('orderEdited', data);
  }

  orderChanged(data: any) {
      this.socket.emit('orderChanged', data);
  }

  orderExited(data: any) {
      this.socket.emit('orderExited', data);
  }

  // simple chat
  message(data: any) {
      this.socket.emit('message', data);
  }

  disconnect(roomId) {
      this.socket.emit('exit', roomId);
  }

  joinRoom(roomId) {
      this.socket.emit('joinRoom', roomId);
  }
  
  leaveRoom(roomId) {
      this.socket.emit('leaveRoom', roomId);
  }
}
