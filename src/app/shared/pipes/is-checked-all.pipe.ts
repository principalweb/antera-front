import { Pipe, PipeTransform } from '@angular/core';
import { values, every } from 'lodash';

@Pipe({
  name: 'isCheckedAll'
})
export class IsCheckedAllPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const varr = values(value);

    return (varr.length >= args) && every(varr, Boolean);
  }

}
