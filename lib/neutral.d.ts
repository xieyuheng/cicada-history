import * as Value from "./value";
export declare abstract class Neutral extends Value.Value {
}
export declare class Var extends Neutral {
    name: string;
    constructor(name: string);
}
export declare class Ap extends Neutral {
    target: Neutral;
    args: Array<Value.Value>;
    constructor(target: Neutral, args: Array<Value.Value>);
}
export declare class Dot extends Neutral {
    target: Neutral;
    field: string;
    constructor(target: Neutral, field: string);
}