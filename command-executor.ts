import { exec } from 'child_process'
import * as WebSocket from 'ws';
//import * as https from 'https';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

import { FlukeSharpMessage, FlukeSharpMessageType } from './flukesharp-message';
import { strict } from 'assert';

export class CommandExecutorSocket {

    InvalidMessageReturn(key: string, cmd, msg: string = "Invalid message."): void {
        console.error('Invalid message received: \n' + JSON.stringify(cmd));
        this.wsSocket.send(JSON.stringify({
            messageKey: key,
            messageType: FlukeSharpMessageType.error,
            messageContent: msg
        }));
    }

    ErrorMessageReturn(key: string, error: any): void {
        console.error(error.toString());
        this.wsSocket.send(JSON.stringify({
            messageKey: key,
            messageType: FlukeSharpMessageType.error,
            messageContent: error.toString()
        }));
    }

    constructor(
        public wsSocket: WebSocket
    ) {
        wsSocket.on('message', cmdstr => {
            var cmd: FlukeSharpMessage = JSON.parse(cmdstr);
            if (+cmd.messageType != undefined && cmd.messageType != null) {

                switch (cmd.messageType) {
                    case FlukeSharpMessageType.req_filelist:
                        this.request_filelist(cmd.messageKey, cmd.messageContent);
                        break;
                    case FlukeSharpMessageType.req_dirlist:
                        this.request_dirlist(cmd.messageKey, cmd.messageContent);
                        break;
                    case FlukeSharpMessageType.req_geojson:
                        this.request_geojson(cmd.messageKey, cmd.messageContent);
                        break;
                    case FlukeSharpMessageType.bash:
                        this.bash(cmd.messageKey, cmd.messageContent);
                        break;
                    default:
                        break;
                }
            }
            else {
                this.InvalidMessageReturn(cmd.messageKey, cmd);
            }
        });
    }

    request_geojson(key: string, msg: any) {
        try {
            var geojsons: { filename: string, geojson: string }[] = [];
            for (var afile of msg.filepaths) {
                geojsons.push({
                    filename: path.basename(afile),
                    geojson: fs.readFileSync(afile).toString()
                });
            }

            this.wsSocket.send(
                JSON.stringify({
                    messageKey: key,
                    messageType: FlukeSharpMessageType.return,
                    messageContent: geojsons
                }));
            console.log('Return message of req_geojson returned.');
        } catch (e) { this.ErrorMessageReturn(key, e); }
    }


    request_dirlist(key: string, msg: any) {
        try {
            var root = msg.root.endsWith('/') ? msg.root.slice(0, -1) : msg.root;
            this.wsSocket.send(
                JSON.stringify({
                    messageKey: key,
                    messageType: FlukeSharpMessageType.return,
                    messageContent:
                        fs.readdirSync(root, { withFileTypes: true })
                            .filter(item => item.isDirectory())
                            .map(item => (root + "/" + item.name))
                }));
            console.log('Return message of req_dirlist returned.');
        } catch (e) { this.ErrorMessageReturn(key, e); }
    }

    request_filelist(key: string, msg: any) {
        var globmsg = msg.root + '/*' + (msg.recursive ? '*/*' : '') + msg.extension;

        if (msg.globoptions) {
            glob(globmsg, msg.globoptions, (error, files) => {
                if (error) {
                    this.ErrorMessageReturn(key, error);
                }
                this.wsSocket.send(JSON.stringify({
                    messageKey: key,
                    messageType: FlukeSharpMessageType.return,
                    messageContent: files.map(file => {
                        return path.relative(msg.root, file);
                    })
                }));
                console.log('Return message of req_filelist returned.');
            });
        }
        else {
            glob(globmsg, (error, files) => {
                if (error) {
                    this.ErrorMessageReturn(key, error);
                }
                this.wsSocket.send(JSON.stringify({
                    messageKey: key,
                    messageType: FlukeSharpMessageType.return,
                    messageContent: files.map(file => {
                        return path.relative(msg.root, file);
                    })
                }));
                console.log('Return message of req_filelist returned.');
            });
        }
    }


    bash(key: string, msg: any) {
        exec(msg,
            { maxBuffer: 1024 * 1024 * 10 },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(error.toString());
                    console.log(error.toString());
                    var re_err: FlukeSharpMessage = {
                        messageKey: key,
                        messageType: FlukeSharpMessageType.error,
                        messageContent: error.toString() + '\n' +
                            stderr.toString() + '\n' +
                            stdout.toString()
                    }
                    this.wsSocket.send(JSON.stringify(re_err));
                }
                var re: FlukeSharpMessage = {
                    messageKey: key,
                    messageType: FlukeSharpMessageType.return,
                    messageContent: stdout.toString()
                };
                this.wsSocket.send(JSON.stringify(re));
                console.log('Return message of bash returned.');
            });
    }


}

export class CommandExecutorServer {

    constructor(
        private wsServer: WebSocket.Server

    ) {
        console.log(wsServer.address());
        console.log('WebSocket server is listening on port ' + wsServer.address()["port"].toString());
        wsServer.on('connection', websocket => {
            let ws: CommandExecutorSocket = new CommandExecutorSocket(websocket);
        });
    }
}