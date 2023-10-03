import * as WebSocket from 'ws';
import * as http from 'http';

interface Avatar {
    x: number;
    y: number;
}

const PORT = 8080;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server running');
});

const wss = new WebSocket.Server({ server });

const avatars: { [id: string]: Avatar } = {};

wss.on('connection', ws => {
    ws.on('message', (data: WebSocket.Data) => {
        const message = JSON.parse(data.toString());

        switch (message.action) {
            case 'spawn':
                if (message.x >= 0 && message.x <= 200 && message.y >= 0 && message.y <= 200) {
                    avatars[message.id] = { x: message.x, y: message.y };
                    ws.send('success');
                } else {
                    ws.send('error: Out of bounds');
                }
                break;

            case 'moveUp':
                const avatarUp = avatars[message.id];
                if (avatarUp) {
                    avatarUp.x = Math.min(200, Math.max(0, avatarUp.x + message.distance));
                    avatars[message.id] = avatarUp;
                    ws.send('success');
                } else {
                    ws.send('error: Avatar not found');
                }
                break;

            case 'moveRight':
                const avatarRight = avatars[message.id];
                if (avatarRight) {
                    avatarRight.y = Math.min(200, Math.max(0, avatarRight.y + message.distance));
                    avatars[message.id] = avatarRight;
                    ws.send('success');
                } else {
                    ws.send('error: Avatar not found');
                }
                break;

            case 'position':
                const avatarPosition = avatars[message.id];
                if (avatarPosition) {
                    ws.send(JSON.stringify(avatarPosition));
                } else {
                    ws.send('error: Avatar not found');
                }
                break;

            default:
                ws.send('error: Invalid action');
                break;
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
