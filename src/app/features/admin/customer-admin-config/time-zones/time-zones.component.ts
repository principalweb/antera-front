import { Component, OnInit } from '@angular/core';
import { TimezonesService } from './timezones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time-zones',
  templateUrl: './time-zones.component.html',
  styleUrls: ['./time-zones.component.scss']
})
export class TimeZonesComponent implements OnInit {

  timezones = [];
  onTimeZonesChangedSubscription: Subscription;

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  constructor(private timezoneService: TimezonesService) 
  {

  }

  ngOnInit() {
    this.onTimeZonesChangedSubscription = 
      this.timezoneService.onTimeZonesChanged
        .subscribe((response: any[]) => {
          this.timezones = response;
        });

    this.timezoneService.getTimeZones()
        .subscribe(this.loaded, this.loaded);
  }

  ngOnDestory() {
    this.onTimeZonesChangedSubscription.unsubscribe();
  }

  updateDefault(timezone, ev) {
    ev.stopPropagation();
    if (timezone.isDefault == '1')
      timezone.isDefault = '0';
    else 
      timezone.isDefault = '1';
    this.updateTimeZone(timezone);
  }

  updateStatus(timezone, ev) {
    ev.stopPropagation();
    if (timezone.status == '1')
      timezone.status = '0';
    else 
      timezone.status = '1';
    this.updateTimeZone(timezone);
  }

  updateTimeZone(timezone) {
    this.loading = true;
    this.timezoneService.updateTimeZone(timezone)
      .subscribe(this.loaded, this.loaded);
  }
}
