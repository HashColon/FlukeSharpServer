import { Server } from 'ws';
import { CommandExecutorServer } from './command-executor'

const wsPort: number = 1435;
const wsServer: Server = new Server({ port: wsPort });

const commandExecutor: CommandExecutorServer = new CommandExecutorServer(wsServer);