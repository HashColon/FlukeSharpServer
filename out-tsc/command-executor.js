"use strict";
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
exports.CommandExecutorServer = exports.CommandExecutorSocket = void 0;
var child_process_1 = require("child_process");
//import * as https from 'https';
var glob_1 = require("glob");
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var flukesharp_message_1 = require("./flukesharp-message");
var CommandExecutorSocket = /** @class */ (function () {
    function CommandExecutorSocket(wsSocket) {
        var _this = this;
        this.wsSocket = wsSocket;
        wsSocket.on('message', function (cmdstr) {
            var cmd = JSON.parse(cmdstr);
            if (+cmd.messageType != undefined && cmd.messageType != null) {
                switch (cmd.messageType) {
                    case flukesharp_message_1.FlukeSharpMessageType.req_filelist:
                        _this.request_filelist(cmd.messageKey, cmd.messageContent);
                        break;
                    case flukesharp_message_1.FlukeSharpMessageType.req_dirlist:
                        _this.request_dirlist(cmd.messageKey, cmd.messageContent);
                        break;
                    case flukesharp_message_1.FlukeSharpMessageType.req_geojson:
                        _this.request_geojson(cmd.messageKey, cmd.messageContent);
                        break;
                    case flukesharp_message_1.FlukeSharpMessageType.bash:
                        _this.bash(cmd.messageKey, cmd.messageContent);
                        break;
                    default:
                        break;
                }
            }
            else {
                _this.InvalidMessageReturn(cmd.messageKey, cmd);
            }
        });
    }
    CommandExecutorSocket.prototype.InvalidMessageReturn = function (key, cmd, msg) {
        if (msg === void 0) { msg = "Invalid message."; }
        console.error('Invalid message received: \n' + JSON.stringify(cmd));
        this.wsSocket.send(JSON.stringify({
            messageKey: key,
            messageType: flukesharp_message_1.FlukeSharpMessageType.error,
            messageContent: msg
        }));
    };
    CommandExecutorSocket.prototype.ErrorMessageReturn = function (key, error) {
        console.error(error.toString());
        this.wsSocket.send(JSON.stringify({
            messageKey: key,
            messageType: flukesharp_message_1.FlukeSharpMessageType.error,
            messageContent: error.toString()
        }));
    };
    CommandExecutorSocket.prototype.request_geojson = function (key, msg) {
        try {
            var geojsons = [];
            for (var _i = 0, _a = msg.filepaths; _i < _a.length; _i++) {
                var afile = _a[_i];
                geojsons.push({
                    filename: path.basename(afile),
                    geojson: fs.readFileSync(afile).toString()
                });
            }
            this.wsSocket.send(JSON.stringify({
                messageKey: key,
                messageType: flukesharp_message_1.FlukeSharpMessageType.return,
                messageContent: geojsons
            }));
            console.log('Return message of req_geojson returned.');
        }
        catch (e) {
            this.ErrorMessageReturn(key, e);
        }
    };
    CommandExecutorSocket.prototype.request_dirlist = function (key, msg) {
        try {
            var root = msg.root.endsWith('/') ? msg.root.slice(0, -1) : msg.root;
            this.wsSocket.send(JSON.stringify({
                messageKey: key,
                messageType: flukesharp_message_1.FlukeSharpMessageType.return,
                messageContent: fs.readdirSync(root, { withFileTypes: true })
                    .filter(function (item) { return item.isDirectory(); })
                    .map(function (item) { return (root + "/" + item.name); })
            }));
            console.log('Return message of req_dirlist returned.');
        }
        catch (e) {
            this.ErrorMessageReturn(key, e);
        }
    };
    CommandExecutorSocket.prototype.request_filelist = function (key, msg) {
        var _this = this;
        var globmsg = msg.root + '/*' + (msg.recursive ? '*/*' : '') + msg.extension;
        if (msg.globoptions) {
            glob_1.glob(globmsg, msg.globoptions, function (error, files) {
                if (error) {
                    _this.ErrorMessageReturn(key, error);
                }
                _this.wsSocket.send(JSON.stringify({
                    messageKey: key,
                    messageType: flukesharp_message_1.FlukeSharpMessageType.return,
                    messageContent: files.map(function (file) {
                        return path.relative(msg.root, file);
                    })
                }));
                console.log('Return message of req_filelist returned.');
            });
        }
        else {
            glob_1.glob(globmsg, function (error, files) {
                if (error) {
                    _this.ErrorMessageReturn(key, error);
                }
                _this.wsSocket.send(JSON.stringify({
                    messageKey: key,
                    messageType: flukesharp_message_1.FlukeSharpMessageType.return,
                    messageContent: files.map(function (file) {
                        return path.relative(msg.root, file);
                    })
                }));
                console.log('Return message of req_filelist returned.');
            });
        }
    };
    CommandExecutorSocket.prototype.bash = function (key, msg) {
        var _this = this;
        child_process_1.exec(msg, { maxBuffer: 1024 * 1024 * 10 }, function (error, stdout, stderr) {
            if (error) {
                console.error(error.toString());
                console.log(error.toString());
                var re_err = {
                    messageKey: key,
                    messageType: flukesharp_message_1.FlukeSharpMessageType.error,
                    messageContent: error.toString() + '\n' +
                        stderr.toString() + '\n' +
                        stdout.toString()
                };
                _this.wsSocket.send(JSON.stringify(re_err));
            }
            var re = {
                messageKey: key,
                messageType: flukesharp_message_1.FlukeSharpMessageType.return,
                messageContent: stdout.toString()
            };
            _this.wsSocket.send(JSON.stringify(re));
            console.log('Return message of bash returned.');
        });
    };
    return CommandExecutorSocket;
}());
exports.CommandExecutorSocket = CommandExecutorSocket;
var CommandExecutorServer = /** @class */ (function () {
    function CommandExecutorServer(wsServer) {
        this.wsServer = wsServer;
        console.log(wsServer.address());
        console.log('WebSocket server is listening on port ' + wsServer.address()["port"].toString());
        wsServer.on('connection', function (websocket) {
            var ws = new CommandExecutorSocket(websocket);
        });
    }
    return CommandExecutorServer;
}());
exports.CommandExecutorServer = CommandExecutorServer;
