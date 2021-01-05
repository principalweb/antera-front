import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';

@Injectable()
export class ProductionFileUtilService
{
  public fileUploadSuccess: Subject<any> = new Subject<any>();
  public fileUploadDeleted: Subject<any> = new Subject<any>();

  constructor(){
  }

  convertFileSize(size) {

    let units = ['B', 'KB', 'MB', 'GB'];
    let unit = 0;

    while( size >= 1024 ) {

      size = Math.round(size / 1024 * 10) / 10;
      unit += 1;
    }

    return size + ' ' + units[unit];
  }
}
