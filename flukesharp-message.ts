export enum FlukeSharpMessageType {
    error, return,
    req_filelist, req_dirlist, req_geojson,
    bash
}

export class FlukeSharpMessage {
    messageType: FlukeSharpMessageType;
    messageKey: string;
    messageContent: any;
}