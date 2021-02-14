"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var command_executor_1 = require("./command-executor");
var wsPort = 1435;
var wsServer = new ws_1.Server({ port: wsPort });
var commandExecutor = new command_executor_1.CommandExecutorServer(wsServer);
