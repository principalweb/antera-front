import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyword'
})
export class SearchKeywordPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value && args) {
      const regExp = new RegExp(args, 'ig');

      return value.replace(regExp, `<span class="text-bold">$&</span>`)
    }

    return value;
  }

}
