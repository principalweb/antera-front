import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { findIndex } from 'lodash';

import { IVendorAlias } from '../vendor-aliases-resources/vendor-alias-interface';
import { ApiService } from '../../../../core/services/api.service';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class VendorsService {

    private vendors: IVendorAlias[]=[];

    constructor(
        private api: ApiService,
        private authService: AuthService
    ) {
    }
    saveAliases(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.post('/content/save-aliases-vendor',data)
                .subscribe((list: any) => {
                  
                    resolve(list);
                }, err => reject(err));

        });
    }
    deleteAliasesVendor(vendors): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.post('/content/delete-aliases-vendors', vendors)
                .subscribe((list: any) => {

                    resolve(list);
                }, err => reject(err));

        });
    }
    getAliases(vendor): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-aliases-vendor?vendor=' + encodeURIComponent(vendor))
                .subscribe((list: any) => {
                    resolve(list);
                }, err => reject(err));

        });
    }
    getVendors(vendor): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-aliases-vendors?vendor=' + encodeURIComponent(vendor))
                .subscribe((list: any) => {
                    resolve(list);
                }, err => reject(err));

        });
    }
    searchVendor(vendor): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/content/alias-match?vendor=' + encodeURIComponent(vendor))
                .subscribe((list: any) => {
                    resolve(list);
                }, err => reject(err));

        });
    }
    get(): Promise<any> {
        return new Promise((resolve, reject) => {            
            this.api.get('/content/get-aliases')
                .subscribe((list: any) => {
                    this.vendors = [];
                    let vendors= null;
                    for (let key in list) {
                        let vendor: IVendorAlias = {
                            name: key,
                            aliaesString: list[key].join(),
                            aliaesArray: list[key]
                        };

                        this.vendors.push(vendor);
                    }
                    resolve(this.vendors);
                }, err => reject(err));

        });
    }

   
}
