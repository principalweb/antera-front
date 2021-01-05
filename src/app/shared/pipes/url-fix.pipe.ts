import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlFix'
})
export class UrlFixPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      return value.replace(/https:\/\/devdemo\.anterasoftware\.com\/https/, 'https')
    }

    return '';
  }

}
