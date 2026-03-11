import express from 'express';
import { parseInput } from './parser.js';

const app = express();
app.use(express.json());

app.post('/', (req, res) => {
    res.sendStatus(200);
    parseInput(req);
});


// Initialize the server
export function startServer(port: number = 7355) {
    app.listen(port, () => {
        console.log('[Debug] Server running on port', port);
    });
}