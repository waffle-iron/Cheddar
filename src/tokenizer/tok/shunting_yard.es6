import CheddarPrimitive from '../literals/primitive';
import CheddarOperatorToken from '../literals/op';
import {PRECEDENCE, UNARY_PRECEDENCE} from '../consts/ops';
import * as CheddarError from '../consts/err';
import CheddarLexer from './lex';

//TODO: use isPrimitive() if not deleted

//TODO: rename
//how about CheddarExpressionStackGen?
export default class CheddarShuntingYard extends CheddarLexer {
    exec(expression) {
        if (expression && expression.Code)
            this.Code = expression.Code;
        if (expression && expression.Index)
            this.Index = expression.Index;

        // Flatten the expression
        let current = expression;
        let tokens = [];
        if (!current ||
            !current.isExpression ||
            current._Tokens.length > 2
        )
            return this.close(expression);

        while (
            current &&
            current._Tokens.length === 2 &&
            (current.tok(1).isExpression || // prevents import recursion
                current.tok(1) instanceof CheddarShuntingYard)
        ) {
            if (current.tok().isExpression) //TODO: code, index
                tokens.push(new CheddarShuntingYard().exec(current.tok()));
            else
                tokens.push(current.tok());
            if (current.tok(1) instanceof CheddarShuntingYard) {
                tokens.push(current.tok(1));
                current = null;
                break;
            } else
                current = current.tok(1);
            //TODO: make sure this covers all cases; otherwise, see when this doesn't work
        }

        if (current && current._Tokens.length > 1)
            return this.error(CheddarError.UNEXPECTED_TOKEN);

        if (current &&
            current._Tokens.length === 1) {
            if (current.tok().isExpression)
                tokens.push(new CheddarShuntingYard().exec(current.tok()));
            else
                tokens.push(current.tok());
        }

        // Reorder tokens
        let operators = [],
            precedences = [],
            unary = true;
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i],
                previousPrecedence = 0;
            if (token instanceof CheddarShuntingYard) {
                for (let i = 0; i < token._Tokens.length; i++)
                    this.Tokens = token.tok(i);
                unary = false;
            } else if (token instanceof CheddarOperatorToken) { // It's an operator
                if (unary)
                    token.Tokens = true;

                let precedence = (token.tok(1) ? UNARY_PRECEDENCE : PRECEDENCE).get(token);

                while (precedence <= previousPrecedence) {
                    this.Tokens = operators.pop();
                    precedences.pop();
                    previousPrecedence = precedences[precedence.length];
                }

                operators.push(token);
                precedences.push(precedence);
                previousPrecedence = precedence;
                unary = true;
            } else {
                this.Tokens = token;
                unary = false;
            }
        }

        let operator = 0;
        while (operator = operators.pop())
            this.Tokens = operator;

        return this.close();
    }
}