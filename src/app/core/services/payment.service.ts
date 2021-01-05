import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject } from 'rxjs';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';

@Injectable()
export class PaymentService implements Resolve<any>{

  routeParams: any;
  onSandboxChanged: BehaviorSubject<any> = new BehaviorSubject('');
  constructor(
    private api: ApiService,
    private fuseSplashScreen: FuseSplashScreenService

  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any>{
    this.fuseSplashScreen.hide();    
    this.routeParams = route.queryParams;
    return new Promise((resolve, reject) => {

      Promise.all([
          this.isSandbox()
      ]).then(
          () => {
              resolve();
          },
          reject
      );
    });
  }

  doPayment(data): Promise<any> 
  {
    return new Promise((resolve, reject) => {
        this.api.doPayment(data)
          .subscribe((response) => {
            resolve(response);
          },(err) => {
            reject(err);
          });
    });
  }

  confirmPayment(oId): Promise<any>
  {
    return new Promise((resolve, reject) => {
      this.api.post('/content/confirm-payment', {oId: oId})
        .subscribe((response) => {
          resolve(response);
        },(err) => {
          reject(err);
        });
    });
  }

  getPaymentDetails(id): Promise<any>
  {
      return new Promise((resolve, reject) => {
          this.api.post('/content/retrieve-payment-info', {oId: id})
              .subscribe((response: any) => {
                  resolve(response);
              }, err => reject(err));
      });
  }

  isSandbox(): Promise<any>
  {
    return new Promise((resolve, reject) => {
        this.api.isSandbox()
          .subscribe((res) => {
            this.onSandboxChanged.next(res);
            resolve(res);
          }, reject);
    });
  }
}
