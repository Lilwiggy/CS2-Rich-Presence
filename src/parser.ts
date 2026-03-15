import type { Request } from 'express';
import type { GameState, GameStatePlaying, GameStateSpectating } from 'csgo-gsi-types';
import type { SetActivity } from '@xhayper/discord-rpc';
import { client } from './index.js'; 

interface GameClient {
    id: string;
    name: string;
    start: Date;
}

let gameClient: GameClient = {
    id: '',
    name: '',
    start: new Date(),
};

let mapStart: Date | undefined;
let presence: SetActivity = {};

export function parseInput(req: Request) {
    let gameState: GameState | GameStatePlaying | GameStateSpectating = req.body;
    // Long if statement but there are 3 important factors here
    // 1. We need to ensure that the player exists
    // 2. Make sure the player is in the menu before setting the steamid as it will guarantee player is not spectating
    // 3. Confirm the client has not already been initialized with a steamid, if so ignore and set menu presence
    if (gameState.player && gameState.player.activity === 'menu') {
        if (gameClient.id === '') {
            gameClient.id = gameState.player.steamid;
            gameClient.name =  gameState.player.name;
        }
        // This shows we are no longer playing in a game so the map timer should restart
        // (unless ofc you disconnect and reconnect but shhhhhhhhhhhhhhhhh)
        if (mapStart) mapStart = undefined;
        presence.startTimestamp = gameClient.start;
        presence.details = 'In menus';
        presence.largeImageKey = 'main-icon';
        client.user?.setActivity(presence);
        presence = {}; // Clean up our mess :)
        return;
    }
    // Check if player is loading into map still or joined the server
    if (gameState.map && !gameState.player) {
        if (!mapStart) {
            presence.details = 'Loading...';
            presence.largeImageKey = 'main-icon';
        } else {
            presence.details = 'Freecam';
            presence.startTimestamp = mapStart;
            // Valve has different names for certain maps and it needs to translated
            switch (gameState.map!.name) {
                default:
                    presence.largeImageKey = gameState.map!.name.substring(3);
                    presence.largeImageText = gameState.map!.name.substring(3).charAt(0).toUpperCase() + gameState.map!.name.slice(4);
                break;
                case 'de_ancient_night':
                case 'de_ancient_day':
                    presence.largeImageText = 'Ancient';
                    presence.largeImageKey = 'ancient';
                break;
                case 'de_nuke_night':
                case 'de_nuke_day':
                    presence.largeImageText = 'Nuke';
                    presence.largeImageText = 'nuke';
                break;
            }
        }
    } else {
        // We have confirmed in the above if statement that both map and player will exist on the gameState object
        // but TypeScript yells at me because 'player could be undefined' like stfu bro
        if (!mapStart) mapStart = new Date();
        presence.startTimestamp = mapStart;
        // Valve has different names for some game modes
        switch (gameState.map!.mode) {
            default:
                presence.details = `Playing ${capitalize(gameState.map!.mode)}`;
            break;
            case 'scrimcomp2v2':
                presence.details = 'Playing Wingman';
            break;
            case 'gungameprogressive':
                presence.details = 'Playing Arms Race'
            break;
        }
        let team = gameState.player!.team;
        presence.smallImageText = `Playing on ${team} side`;
        presence.smallImageKey = `${team.toLowerCase()}_logo`;
        // Valve has different names for certain maps and it needs to translated
        switch (gameState.map!.name) {
            default:
                presence.largeImageKey = gameState.map!.name.substring(3);
                presence.largeImageText = gameState.map!.name.substring(3).charAt(0).toUpperCase() + gameState.map!.name.slice(4);
            break;
            case 'de_ancient_night':
            case 'de_ancient_day':
                presence.largeImageText = 'Ancient';
                presence.largeImageKey = 'ancient';
            break;
            case 'de_nuke_night':
            case 'de_nuke_day':
                presence.largeImageText = 'Nuke';
                presence.largeImageText = 'nuke';
            break;
        }
        // Clarify if the player is playing or spectating 
        if (gameClient.id !== gameState.player!.steamid && gameClient.id !== '') {
            presence.details = 'Spectating...';
            // @ts-ignore The following line is correct but poor typings exist in the csgo-gsi-type library
            // <Player> contains the match_stats which has the KAD and extra info in the POST request made by CS2
            // but not in the typings library
            presence.state = `Spectated: K: ${gameState.player!.match_stats.kills} A: ${gameState.player!.match_stats.assists} D: ${gameState.player!.match_stats.deaths}`;
            client.user?.setActivity(presence);
            presence = {}; // Clean up our mess :)
            return;
        } else {
            // @ts-ignore The following line is correct but poor typings exist in the csgo-gsi-type library
            // <Player> contains the match_stats which has the KAD and extra info in the POST request made by CS2
            // but not in the typings library
            presence.state = `K: ${gameState.player!.match_stats.kills} A: ${gameState.player!.match_stats.assists} D: ${gameState.player!.match_stats.deaths}`;
        }
        presence.details += ` | T: ${gameState.map!.team_t.score} CT: ${gameState.map!.team_ct.score}`;

        // Fun lil easter eggs to display when the round is over or during freeze time
        if (gameState.round?.phase === 'over' || gameState.round?.phase === 'freezetime') {
            // Tease the team for choking :3
            if (gameState.player?.team === 'T' && gameState.map!.team_t.consecutive_round_losses > 5) {
                presence.details = 'The T side is throwing the match!';
                presence.state = `The Ts have lost ${gameState.map!.team_t.consecutive_round_losses} rounds in a row.`;
            } else if (gameState.player?.team === 'CT' && gameState.map!.team_ct.consecutive_round_losses > 5) {
                presence.details = 'The CT side is throwing the match!';
                presence.state = `The CTs have lost ${gameState.map!.team_ct.consecutive_round_losses} rounds in a row.`;
            }
            // Player gets an ace, easy work idk
            if (gameState.player!.state.round_kills >= 5) {
                presence.details = 'Ace!';
                presence.state = 'The player has killed the entire enemy team!';
            }
        }
    }

    client.user?.setActivity(presence);
    presence = {}; // Clean up our mess :)
}


function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}