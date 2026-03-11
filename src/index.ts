import { existsSync, copyFileSync } from 'node:fs'
import * as os from 'os'; // Required for detecting platform usage
import { startServer } from './server.js';

let platform = os.platform();
let defaultSteamDir = ''; // The default directory in which CS2 is installed to. Will be set after detecting platform

switch (platform) {
    // TODO: Check for multiple install locations across multiple drives on the machine eg. D:\, F:\, sdb2, etc.
    case 'linux':
        // :D
        defaultSteamDir = `${os.homedir}/.var/app/com.valvesoftware.Steam/.local/share/Steam/steamapps/common/Counter-Strike\ Global\ Offensive/game/csgo/cfg`;
    break;
    case 'win32':
        // :c (at least you can lose in faceit lobbies instead of MM now :3)
        defaultSteamDir = 'C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike\ Global\ Offensive\game\csgo\cfg';
    break;
    case 'darwin':
        // huh
        console.log('Unfortunately Counter Strike 2 is not supported on Mac OSX at this time.\nIf you are running CS2 on Mac somehow, please make an issue and lmk how you did this.');
    break;
}

// Check if config exists, if not then create one
if (!existsSync(`${defaultSteamDir}/gamestate_integration_cs2rpc.cfg`)) {
    console.log('============================== No config found. Writing one now... ==============================');
    copyFileSync('./src/gamestate_integration_cs2rpc.cfg', `${defaultSteamDir}/gamestate_integration_cs2rpc.cfg`);
    console.log('============================== Done writing config ==============================');
}

startServer();