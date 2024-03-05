import { PassportStrategy } from '@nestjs/passport';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { parseCookie } from 'src/utils/signage';


@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private authService: AuthService) {}

  async handleConnection(client: any, ...args: any[]) {
    try {

      const cookieString = client.handshake.headers.cookie;
      const token = parseCookie(cookieString, 'token');
      //console.log("TOKEN, ", token)
      if (!token) {
        throw new Error('Token is missing.');
      }
      
      const payload = this.authService.verifyToken(token);
      //console.log("Token Payload: ", payload);
      
      if (!payload.id) {
        throw new Error('Invalid token payload.');
      }
      
      const user = await this.authService.validateUserByJwt(payload.id);
      if (!user) {
        client.disconnect();
        //console.log('Invalid authentication');
        return;
      }

      const userId = client.handshake.query.userId;
      //console.log("USER ID:", userId);
      client.join(userId);
      if (!userId) {
        throw new Error('User ID is missing.');
      }


    } catch (error) {
      client.disconnect();
      console.error('Error during socket connection:', error);
    }
  }

  notifyFriendRequest(receiverId: string, data: any) {
    this.server.to(receiverId).emit('friendRequestReceived', data);
  }
  
  notifyFriendRequestCancellation(receiverId: string, data: any) {
    this.server.to(receiverId).emit('friendRequestCancelled', data);
  }

  notifyFriendRequestAcceptance(receiverId: string, data: any) {
    this.server.to(receiverId).emit('friendRequestAccepted', data);
  }

  notifySharedAlbum(receiverId: string, data: any) {
    this.server.to(receiverId).emit('sharedAlbumNotification', data);
  }

  notifyNewComment(receiverId: string, data: any) {
    this.server.to(receiverId).emit('newCommentNotification', data);
  }


  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendFriendRequestNotification(receiverId: string, data: any) {
    this.server.to(receiverId).emit('friendRequestReceived', data);
  }
}