import { existsSync, copyFileSync, readFile } from 'node:fs'
import * as os from 'os'; // Required for detecting platform usage
import { startServer } from './server.js';
import { Client } from "@xhayper/discord-rpc";
import { clearDate } from './parser.js';

let platform = os.platform();
let lastHeartbeat: Date;

switch (platform) {
    case 'linux':
        // :D
        if (!existsSync(`${os.homedir}/.local/state/csrpc.txt`)) {
            console.log('Please run the install script prior to launching the application.');
            break;
        }
        readFile(`${os.homedir}/.local/state/csrpc.txt`, (err, data) => {
            if (err) console.error(err);
            checkConfig(data.toString().replace('\n', ''));
        });
    break;
    case 'win32':
        // :c (at least you can lose in faceit lobbies instead of MM now :3)
        checkConfig('C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike\ Global\ Offensive\game\csgo\cfg');
    break;
    case 'darwin':
        // huh
        console.log('Unfortunately Counter Strike 2 is not supported on Mac OSX at this time.\nIf you are running CS2 on Mac somehow, please make an issue and lmk how you did this.');
    break;
}

// Start webserver for Game State Integration (GSI) communication
startServer();

// Initialize the discord Rich Presence Client (RPC)
const discordClient = new Client({
    clientId: '494943194165805082'
});

discordClient.login().catch(() => {
    console.log('Discord is not running, ignore until open....');
});

// This function will run every 
setInterval(() => {
    if (!lastHeartbeat) return; // Game is probably taking too long to launch
    if (Math.abs(new Date().getTime() - lastHeartbeat.getTime()) / 1000 >= 15) {
        clearDate(); // Clears the start date for the gameClient
        discordClient.destroy();
    } else if (!discordClient.isConnected) {
        discordClient.connect().catch(() => {
            console.log('Discord is not running, ignore until open...');
            return;
        });
    }
}, 15000);

function updateHeartbeat (heartBeat: Date) {
    lastHeartbeat = heartBeat;
}
// We need to check if the GSI config exists
function checkConfig(path: string) {
    path = path.replaceAll(' ', '\ ');
    if (!existsSync(`${path}/gamestate_integration_cs2rpc.cfg`)) {
        console.log('============================== No config found. Writing one now... ==============================');
        copyFileSync('../src/gamestate_integration_cs2rpc.cfg', `${path}/gamestate_integration_cs2rpc.cfg`);
        console.log('============================== Done writing config ==============================');
    }
}

export { discordClient as client, updateHeartbeat };