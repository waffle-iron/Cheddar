import CheddarClass from '../env/class';
import XRegExp from 'xregexp';

import BehaviorOperator from './op/regex';
import BehaviorCast from './cast/regex';

export default class CheddarRegex extends CheddarClass {
    static Name = "Regex";

    init(source, flags) {
        if (!source)
            return "Regex source not provided";
        else if (source.constructor.Name === 'String')
            source = source.value;

        if (!flags)
            flags = "";
        else if (flags.constructor.Name === 'String')
            flags = flags.value;

        if (typeof source !== 'string' || typeof flags !== 'string')
            return "Regex source and flags must be string. Flags are optional";

        try {
            this.value = XRegExp(source, flags);
        } catch(e) {
            return e.message || "error during regex instantiation";
        }
        this.source = source;
        this.flags = this.value.xregexp.flags;
        return true;
    }

    static Operator = new Map([...CheddarClass.Operator, ...BehaviorOperator])
    static Cast = BehaviorCast;
}