import { Injectable } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class TimezonesService {

  onTimeZonesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor( 
    private api: ApiService,
    ) { }

  getTimeZones() {
    return this.api.getTimeZonesDropdown().pipe(
      map((response: any) => {
        this.onTimeZonesChanged.next(response);
        return response;
      }),
    );
  }

  createTimeZone(timeZone) {
    return this.api.createTimeZone(timeZone).pipe(
      switchMap(() => this.getTimeZones())
    );
  }

  updateTimeZone(timeZone) {
    return this.api.updateTimeZone(timeZone).pipe(
      switchMap(() => this.getTimeZones())
    );
  }
}
