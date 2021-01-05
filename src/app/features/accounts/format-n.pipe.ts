import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatN'
})
export class FormatNPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (value < 1000) {
      return value;
    }

    const v = Math.floor((+value) / 1000);

    return v + 'k';
  }

}
