import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MailService } from '../../main/content/apps/mail/mail.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'environments/environment';
@Injectable()
export class ActionService {

    dialogRef: any;
    emailId :any;

    constructor(
        private http: HttpClient,
        public dialog: MatDialog,
        public api: ApiService,
    ){}

    getArtworkId(params) {
         return  this.api.getArtworkIdFromOrderIdVendorId(params);
    }

    isDecoratorVendor(vendorId) {
      return this.api.isDecoratorVendor(vendorId);
    }

    getShippingInfo(params) {
      return  this.api.getShippingInfo(params);
    }

    createOrderToShipStation(params) {
        return this.api.post('/content/ship-station-create-order', params);
    }
    
    getActionData(params): Promise<any> {
      return new Promise(
            (resolve, reject) => {
              this.http.post('protected/action/get-data', params)
                .subscribe((response: any) => {
                    resolve(response);
                    return response;
                }, reject);
            }
        );
    }
}
