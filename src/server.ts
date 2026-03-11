import express from 'express';

const app = express();

// Initialize the server
export function startServer(port: number = 7355) {
    app.listen(port, () => {
        console.log('[Debug] Server running on port', port);
    });
}