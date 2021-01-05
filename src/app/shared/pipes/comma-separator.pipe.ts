import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'comma'
})

export class CommaSeparatorPipe implements PipeTransform {
    transform(val: string[]){
        let str = "";
        val.forEach((el, i) => {
            str += el;
            if (i != val.length - 1) str += ", ";
        });
        return str;
    }
}