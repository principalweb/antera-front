import { Pipe } from '@angular/core';

@Pipe({
    name: 'roundString'
})
export class RoundStringPipe {
    transform(val, args){
        if (args === undefined){
            return val;
        }
        if (typeof val === 'string'){
            return parseFloat(val).toLocaleString("en-US", {
                minimumFractionDigits: args,
                maximumFractionDigits: args
            })
        }
        else if (typeof val === 'number'){
            return val.toLocaleString("en-US", {
                minimumFractionDigits: args,
                maximumFractionDigits: args
            })
        } else {
            const number: number = 0;
            return number.toLocaleString("en-US", {
                minimumFractionDigits: args,
                maximumFractionDigits: args
            })
        }
    }
}