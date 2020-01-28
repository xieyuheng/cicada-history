"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Report extends Error {
    constructor(message_list) {
        super(merge_message_list(message_list));
        this.message_list = message_list;
    }
    append(message) {
        new Report([
            ...this.message_list,
            message,
        ]);
    }
    prepend(message) {
        new Report([
            message,
            ...this.message_list,
        ]);
    }
}
exports.Report = Report;
function merge_message_list(message_list) {
    let s = "";
    s += "------\n";
    for (let message of message_list) {
        s += message;
        s += "------\n";
    }
    return s;
}