"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("@forchange/partech/lib/error");
const earley_1 = require("@forchange/partech/lib/earley");
const parser_1 = require("@forchange/partech/lib/parser");
const ptc = __importStar(require("@forchange/partech/lib/predefined"));
const CMD = __importStar(require("./cmd"));
const API = __importStar(require("./api"));
const grammar = __importStar(require("./grammar"));
const pkg = require("../package.json");
class CicadaCommandLine extends CMD.CommandLine {
    name() {
        return pkg.name;
    }
    version() {
        return pkg.version;
    }
    run_code(code) {
        const lexer = ptc.common_lexer_with_indentation;
        const partech = new earley_1.Earley();
        const parser = new parser_1.Parser(lexer, partech, grammar.top_list());
        try {
            let tree = parser.parse(code);
            let top_list = grammar.top_list_matcher(tree);
            API.run(top_list);
        }
        catch (error) {
            if (error instanceof error_1.ErrorDuringParsing) {
                console.log(`parsing error, at ${error.span.repr()}`);
                error.span.report_in_context(code);
                console.log(`${error.message}`);
            }
            else {
                throw error;
            }
        }
    }
}
let cicada = new CicadaCommandLine();
cicada.run();