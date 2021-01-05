import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { findIndex } from 'lodash';

import { INotificationGroup } from './notification-group-interface';
import { ApiService } from '../../../../core/services/api.service';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class NotificationGroupsService {

    private notificationGroups: INotificationGroup[]=[];

    constructor(
        private api: ApiService,
        private authService: AuthService
    ) {
    }
    update(data,msg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.put('/notification-groups/update',data)
                .subscribe((list: any) => {
                    resolve(list);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('The System timed out, please login again.', 'error');

                        }
                        resolve(error)


                    });

        });
    }
    save(data, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.post('/notification-groups/save',data)
                .subscribe((list: any) => {
                    resolve(list);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('The System timed out, please login again.', 'error');

                        }
                        resolve(error)


                    });

        });
    }
    delete(vendors, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.put('/notification-groups/delete-multiple', vendors)
                .subscribe((list: any) => {

                    resolve(list);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('The System timed out, please login again.', 'error');

                        }
                        resolve(error)


                    });

        });
    }
    getByID(id, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/notification-groups/get?id=' + encodeURIComponent(id))
                .subscribe((list: any) => {
                    resolve(list);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('Something has gone wrong. We apologies for this, please contact support if required.', 'error');

                        }
                        resolve(error)


                    });

        });
    }
    getAccounts(accountName, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.getUserAutocomplete(accountName)
                .subscribe((list: any) => {
                    resolve(list);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('Something has gone wrong. We apologies for this, please contact support if required.', 'error');

                        }
                        resolve(error)


                    });

        });
    }
    checkUnique(groupName, msg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/notification-groups/get-unique-group-check?name=' + encodeURIComponent(groupName))
                .subscribe((list: any) => {
                    resolve(list);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('Something has gone wrong. We apologies for this, please contact support if required.', 'error');

                        }
                        resolve(error)


                    });

        });
    }
    get(msg): Promise<any> {

        return new Promise((resolve, reject) => {            
            this.api.get('/notification-groups/get-all')
                .subscribe((list:any[]) => {
                    this.notificationGroups= [];
                    for (let i = 0 ; i < list.length; i++) {
                        let notificationGroup: INotificationGroup = {
                            notificationGroupID: list[i].notificationGroupID,
                            groupName: list[i].groupName,
                            accounts: list[i].accounts
                        };

                        this.notificationGroups.push(notificationGroup);
                    }
                    resolve(this.notificationGroups);
                },
                    error => {
                        if (error.status === 400) {
                            error = error.error;
                            if (error.logged === "success") {
                                msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                            }
                            else {
                                msg.show("The System timed out, please login again.", 'error');
                            }
                        }
                        else {
                            msg.show('Something has gone wrong. We apologies for this, please contact support if required.', 'error');

                        }
                        resolve(error)


                    });

        });
    }

   
}
