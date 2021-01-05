import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject ,  BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

import { AuthService } from '../../../../core/services/auth.service';

interface Activity {
  time: string;
  user: string;
  action: string;
}

@Injectable()
export class HistoryService {

  activities: Activity[] = [];
  public trackActivities: BehaviorSubject<any> = new BehaviorSubject([]);
  routeParams: any;
  constructor( private http: HttpClient, private auth: AuthService, private api: ApiService, ) {}

  recordActivity(orderId){
    //console.log("route.params",route)
    // let _newActivity : Activity = {
    //   time: this.setTimeFormat(new Date()),
    //   user: `${this.auth.getCurrentUser().firstName} ${this.auth.getCurrentUser().lastName}`,
    //   action: newActivity
    // };

    // this.activities.push(_newActivity);
    //this.getOrderHistory('96ab025c-b35c-0590-2ca2-568e5ef4ff6c');
    return Promise.all([
       this.getOrderHistory(orderId),
      // this.getActivitiesList()
    ]);
    //this.trackActivities.next(this.activities);
  }

  // getOrderHistory(id): Observable<any>
  //   {
  //     console.log(id)
  //     return this.api.getOrderHistory(id);
  //   }
    getOrderHistory(id): Promise<any> 
    {
        return new Promise(
            (resolve, reject) => {
                this.api.post('/api/v1/orders/order-history', { id })
                    .subscribe((response: any) => {
                      console.log("response",response);
                        this.activities = response
                        // this.activities = response.map(activity => {
                        //     let act = new Activity(activity);
                        //     return act;
                        // });
                        // console.log("this.activities", this.activities);
                        // this.onActivitiesChanged.next(this.activities);
                        this.trackActivities.next(this.activities);
                        resolve(this.activities);
                        
                    }, reject);
            }
        );
    }

  setTimeFormat(date: Date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const hr = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const mi = date.getMinutes();
    const se = date.getSeconds();
    const am_pm = date.getHours() > 12 ? 'PM' : 'AM';

    return `${y}-${m<10?'0'+m:m}-${d<10?'0'+d:d} ${hr<10?'0'+hr:hr}:${mi<10?'0'+mi:mi}:${se<10?'0'+se:se} ${am_pm}`;
  }

}
