import WebSocket from 'ws';
import { TaskEngine } from '../infrastructure/task-engine/taskEngine';

export class WebSocketManager {
  private wss: WebSocket.Server;
  private taskEngine: TaskEngine;

  constructor(server: any, taskEngine: TaskEngine) {
    this.wss = new WebSocket.Server({ server });
    this.taskEngine = taskEngine;
    this.init();
  }

  private init(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'subscribe' && data.taskId) {
            console.log(`Client subscribed to task: ${data.taskId}`);
            this.taskEngine.subscribeToTask(data.taskId, ws);
            ws.send(JSON.stringify({ type: 'subscribed', taskId: data.taskId }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
  }
}
