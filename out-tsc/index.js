"use strict";
// import * as fs from 'fs';
// import * as https from 'https';
// //import * as websocket from 'websocket';
// import { Server } from 'ws';
// import { CommandExecutorServer } from './command-executor'
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
var fs = __importStar(require("fs"));
var https = __importStar(require("https"));
var ws = __importStar(require("ws"));
var command_executor_1 = require("./command-executor");
var sslKeysDir = '/home/cadit/WTK/ssl_keys/';
var privateKey = fs.readFileSync(sslKeysDir + 'key.pem', 'utf8');
var certificate = fs.readFileSync(sslKeysDir + 'cert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var server = https.createServer(credentials);
//initialize the WebSocket server instance
var wss = new ws.Server({ server: server });
server.listen(1435);
var commandExecutor = new command_executor_1.CommandExecutorServer(wss);
