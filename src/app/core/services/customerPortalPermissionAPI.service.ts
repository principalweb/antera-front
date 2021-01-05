import { Injectable } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';

@Injectable()
export class customerPortalPermissionAPIService {

    constructor(
        private api: ApiService
    ) { }

    getByCustomerPortalID = function (id) {
        return this.api.get('/customer-portal-permissions/get-by-customer-portal-id?id=' + encodeURIComponent(id));
    }
    save = function (storeID, modules, isSave) {
        if (isSave) {
            let data = { storeID: storeID,modules:modules }
            return this.api.post('/customer-portal-permissions/save-customer-portal-permissions', data);
        }
        return this.api.put('/customer-portal-permissions/update-customer-portal-permissions?id=' + encodeURIComponent(storeID), modules);
        
    }

    login = function (data) {
        return this.api.put('/login-settings/login', data);
    }
}
