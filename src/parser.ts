import type { Request } from 'express';
import type { GameState } from 'csgo-gsi-types';

interface GameClient {
    id: string;
    name: string;
}

const client: GameClient = {
    id: '',
    name: '',
};

export function parseInput(req: Request) {
    let gameState: GameState = req.body;
    // Long if statement but there are 3 important factors here
    // 1. We need to ensure that the player exists
    // 2. Make sure the player is in the menu before setting the steamid as it will guarantee player is not spectating
    // 3. Confirm the client has not already been initialized with a steamid
    if (gameState.player && gameState.player.activity === 'menu' && client.id === '') {
        client.id = gameState.player.steamid;
        client.name =  gameState.player.name;
    }
    console.log(gameState)
}