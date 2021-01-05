import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { map, switchMap } from 'rxjs/operators';
import { MessageService } from 'app/core/services/message.service';

@Injectable()
export class PaymentMethodService {

  onDropdownOptionsChanged: BehaviorSubject<any> = new BehaviorSubject({});
  route: ActivatedRouteSnapshot;

  constructor(
    private api: ApiService,
    private msg: MessageService
  ) { 

  }

      /**
     * The Contacts App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
      this.route = route;
      /* return forkJoin([
        this.getDropdownOptions('payment_methods_list')
      ]); */
    }

    getPaymentMethods() {
      return this.api.getPaymentMethods({});
    }

    updatePaymentMethodStatus(data) {
      console.log("data",data)
      return this.api.updatePaymentMethodStatus(data).subscribe((res) => {
                
      });
    }

    createPaymentMethod(data) {
      console.log("data",data)
      return this.api.createPaymentMethod(data);
    }

    updatePaymentMethod(data) {
      return this.api.updatePaymentMethod(data);
    }
    
    deletePaymentMethod(data) {
      return this.api.deletePaymentMethod(data);
    }

    /* createDropdownOption(option) {
      return this.api.createDropdownOption(option).pipe(
        switchMap(() => this.getDropdownOptions('payment_methods_list'))
      );
    }

    updateDropdownOption(option) {
      return this.api.updateDropdownOption(option).pipe(
        switchMap(() => this.getDropdownOptions('payment_methods_list'))
      );
    }

    deleteDropdownOption(ids) {
      return this.api.deleteDropdownOption(ids).pipe(
        switchMap(() => this.getDropdownOptions('payment_methods_list'))
      );
    } */
}
