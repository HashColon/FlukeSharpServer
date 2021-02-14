"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlukeSharpMessage = exports.FlukeSharpMessageType = void 0;
var FlukeSharpMessageType;
(function (FlukeSharpMessageType) {
    FlukeSharpMessageType[FlukeSharpMessageType["error"] = 0] = "error";
    FlukeSharpMessageType[FlukeSharpMessageType["return"] = 1] = "return";
    FlukeSharpMessageType[FlukeSharpMessageType["req_filelist"] = 2] = "req_filelist";
    FlukeSharpMessageType[FlukeSharpMessageType["req_dirlist"] = 3] = "req_dirlist";
    FlukeSharpMessageType[FlukeSharpMessageType["req_geojson"] = 4] = "req_geojson";
    FlukeSharpMessageType[FlukeSharpMessageType["bash"] = 5] = "bash";
})(FlukeSharpMessageType = exports.FlukeSharpMessageType || (exports.FlukeSharpMessageType = {}));
var FlukeSharpMessage = /** @class */ (function () {
    function FlukeSharpMessage() {
    }
    return FlukeSharpMessage;
}());
exports.FlukeSharpMessage = FlukeSharpMessage;
