// import * as fs from 'fs';
// import * as https from 'https';
// //import * as websocket from 'websocket';
// import { Server } from 'ws';
// import { CommandExecutorServer } from './command-executor'

// var sslKeysDir = '/home/cadit/WTK/ssl_keys/';
// var privateKey = fs.readFileSync(sslKeysDir + 'key.pem', 'utf8');
// var certificate = fs.readFileSync(sslKeysDir + 'cert.pem', 'utf8');
// var credentials = {
//     key: privateKey,
//     cert: certificate
// };

// const wsPort: number = 1435;
// const wss: Server = new Server({ port: wsPort });

// //do not change the name 'server' it will cause error
// // const server = https.createServer(credentials);
// // const wss: Server = new Server({ server });
// // server.listen(1435);

// const commandExecutor: CommandExecutorServer = new CommandExecutorServer(wss);

import * as fs from 'fs';
import * as https from "https"
import * as ws from 'ws';
import { CommandExecutorServer } from './command-executor'

var sslKeysDir = '/home/cadit/WTK/ssl_keys/';
var privateKey = fs.readFileSync(sslKeysDir + 'key.pem', 'utf8');
var certificate = fs.readFileSync(sslKeysDir + 'cert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
const server = https.createServer(credentials);
//initialize the WebSocket server instance
const wss = new ws.Server({ server });
server.listen(1435);
const commandExecutor: CommandExecutorServer = new CommandExecutorServer(wss);