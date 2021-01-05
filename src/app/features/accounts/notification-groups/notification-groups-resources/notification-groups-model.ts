import { INotificationGroup } from '../notification-groups-resources/notification-group-interface';


export class NotificationGroups {
    notificationGroups: INotificationGroup[];


    constructor(notificationGroups: INotificationGroup[]) {
      console.log(notificationGroups);
        //this.notificationGroups = notificationGroups;
/*
        for (let key in vendorAliases) {

            let vendorAlias: IVendorAlias = {
                name: key,
                aliaesString: vendorAliases[key].join(),
                aliaesArray: vendorAliases[key]
            };
            this.vendorAliases.push(vendorAlias);

        }
*/
    }
}
