import express from 'express';
import { matchRouter } from './routes/matches.js';
import { commentaryRouter } from './routes/commentary.js';
import http from 'http'

import { attachWebSocketServer } from './ws/server.js'
import { securityMiddleware } from './arcjet.js';
const app = express();
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';


const server = http.createServer(app);
app.use(express.json());

app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);

app.get('/', (req, res) => {
	res.status(200).json({ message: 'Hello from the Sportz server!' });
});

app.use(securityMiddleware());


const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;


server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket Server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});
