import CheddarClass from '../env/class';

import BehaviorOperator from './op/number';
import BehaviorCast from './cast/number';

export default class CheddarNumber extends CheddarClass {
    static Name = "Number";

    constructor(base, bitshift, value) {
        super();

        // TODO: Optimize
        if (bitshift)
            value += "0".repeat(bitshift);

        if (typeof value === "string") {
            let [INT, DEC] = value.split(".");

            if (base !== 10)
                this.value = DEC ? parseInt(INT, base) + parseInt(DEC, base) / Math.pow(base, DEC.length) : parseInt(value, base)
            else
                this.value = +value;
        } else {
            this.value = value;
        }
    }

    // String is the lowest level class
    //  meaning operators can have directly
    //  defined behavior
    static Operator = new Map([...CheddarClass.Operator, ...BehaviorOperator]);
    static Cast = BehaviorCast;
}