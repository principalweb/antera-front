import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { navigation } from '../../../navigation/navigation';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { ManageMenuService } from './manage-menu.service';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';

@Component({
    selector: 'admin-manage-menu',
    templateUrl: './manage-menu.component.html',
    styleUrls: ['./manage-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ManageMenuComponent implements OnInit {

    isChecked = true;

    navigationItems: any;
    disabled: boolean;
    onDisplayMenuChanged: Subscription;
    defaultMenuList = [
        {
            "name": "home",
            "display": "1"
        },

        // CRM
        {
            "name": "crm",
            "display": "1"
        },
        {
            "name": "crm.accounts",
            "display": "1"
        },
        {
            "name": "crm.contacts",
            "display": "1"
        },
        {
            "name": "crm.locations",
            "display": "1"
        },
        {
            "name": "crm.leads",
            "display": "1"
        },
        {
            "name": "crm.opportunities",
            "display": "1"
        },
        {
            "name": "crm.projects",
            "display": "1"
        },
        {
            "name": "crm.cases",
            "display": "1"
        },

        // Order Management
        {
            "name": "order",
            "display": "1"
        },
        {
            "name": "order.products",
            "display": "1"
        },
        {
            "name": "order.purchaseOrders",
            "display": "1"
        },
        {
            "name": "order.arInvoice",
            "display": "1"
        },
        {
            "name": "order.sourcing",
            "display": "1"
        },
        {
            "name": "order.quotes",
            "display": "1"
        },
        {
            "name": "order.orders",
            "display": "1"
        },
        {
            "name": "order.billing",
            "display": "1"
        },
        {
            "name": "order.workflow",
            "display": "1"
        },
        {
            "name": "order.inventory",
            "display": "1"
        },
        {
            "name": "order.receiving",
            "display": "1"
        },
        {
            "name": "order.production",
            "display": "1"
        },
        {
            "name": "order.vouching",
            "display": "1"
        },
        {
            "name": "order.apCredit",
            "display": "1"
        },

        // Others
        {
            "name": "artwork",
            "display": "1"
        },
        {
            "name": "calendar",
            "display": "1"
        },
        {
            "name": "activities",
            "display": "1"
        },
        {
            "name": "mail",
            "display": "1"
        },
        {
            "name": "chat",
            "display": "1"
        },
        {
            "name": "reports",
            "display": "1"
        },
        {
            "name": "file",
            "display": "1"
        },
        {
            "name": "webstore",
            "display": "1"
        },
        {
            "name": "support",
            "display": "1"
        },
        {
            "name": "support.knowledge",
            "display": "1"
        },
        {
            "name": "support.faq",
            "display": "1"
        },
        {
            "name": "support.training",
            "display": "1"
        },
        // Guided Sessions
        // {
        //     "name": "support.sessions",
        //     "display": "1"
        // },

        // Admin
        {
            "name": "admin",
            "display": "1"
        },
        // {
        //     "name": "admin.myaccount",
        //     "display": "1"
        // },

        {
            'name': 'admin.config',
            "display": "1"
        },
        {
            "name": "admin.kpi-dashboard",
            "display": "1"
        },
        {
            "name": "admin.kpi-dashboard.execu",
            "display": "1"
        },
        {
            "name": "admin.kpi-dashboard.marke",
            "display": "1"
        },
        {
            "name": "admin.kpi-dashboard.produ",
            "display": "1"
        },
        {
            "name": "admin.commission",
            "display": "1"
        },
        {
            "name": "admin.decoration_fees",
            "display": "1"
        },
        {
            "name": "admin.brands",
            "display": "1"
        },
        {
            "name": "admin.promo_standards",
            "display": "1"
        },
        {
            "name": "admin.documents",
            "display": "1"
        },
        {
            "name": "admin.currency",
            "display": "1"
        },
        {
            "name": "admin.promo_standards_adm",
            "display": "1"
        },
        {
            "name": "admin.users",
            "display": "1"
        },
        {
            "name": "admin.settings",
            "display": "1"
        },
        {
            "name": "admin.imports",
            "display": "1"
        },
        {
            "name": "admin.purgerecords",
            "display": "1"
        }
    ];
    displayList = [];
    loading = false;

    constructor(
        private menuService: ManageMenuService,
        private msg: MessageService
    ) { }

    ngOnInit() {
        this.navigationItems = navigation;
        this.onDisplayMenuChanged =
            this.menuService.onDisplayMenuChanged
                .subscribe(list => {
                    
                    if (!list || (list.length < this.defaultMenuList.length))
                    {
                       
                        const batch = [];
                        this.defaultMenuList.forEach((item) => {
                            let menuItem;
                            const oldItem = find(this.defaultMenuList, {name: item.name});
                            if (oldItem)
                                menuItem = {name: item.name, option: Number(oldItem.display)};
                            else
                                menuItem = {name: item.name, option: Number(item.display)};
                            batch.push(this.menuService.updateMenu(menuItem));
                        });
                        this.loading = true;
                        forkJoin(...batch)
                            .subscribe(
                                () => {
                                    this.loading = false;
                                    this.displayList = this.defaultMenuList;
                                }
                            );
                    }
                    else{
                        this.displayList = list;
                    }
                });
                // let testLeads = this.navigationItems.find((navigation) => {
                //     if(navigation.children) {
                //         navigation.children.some((children) => {
                //         //^^^^^^
                //             return children.id === 'crm.leads';
                //         });
                //     }
                  
                //   });
                // console.log("testLeads",testLeads)
                this.displayList.map((list)=>{
                    
                    this.navigationItems.find((navigation) => {
                            if(navigation.children) {
                                navigation.children.some((children) => {
                                //^^^^^^
                                    if(children.id === list.name){
                                        
                                        Object.assign(children,{cust_name:list.cust_name, cust_disp: list.cust_disp})
                                    }
                                    if(children.children) {
                                        children.children.some((subchildren) => {
                                            //^^^^^^
                                            if(subchildren.id === list.name){
                                                
                                                Object.assign(subchildren,{cust_name:list.cust_name, cust_disp: list.cust_disp})
                                            }
                                        });
                                    }
                                    
                               });
                            }
                    })
                })
                
    }

    ngOnDestroy() {
        this.onDisplayMenuChanged.unsubscribe();
    }

    sliderToggled(navItem, event){

        let menuItem = {name: navItem.id, option: Number(event.checked)};
        this.menuService.updateMenu(menuItem)
            .subscribe((res: any) => {
                this.msg.show(`${navItem.title} updated`,'success');
            }, (err) => {
                this.msg.show(err.message,'error');
            });
    }

    sliderToggledCustom(navItem, event){
        
        let menuItem = {name: navItem.id, cust_name: navItem.cust_name, cust_disp: Number(event.checked),cust_menu: true};
        this.menuService.updateMenu(menuItem)
            .subscribe((res: any) => {
                this.msg.show(`${navItem.title} updated`,'success');
            }, (err) => {
                this.msg.show(err.message,'error');
            });
    }

    changeCustomLabel(navItem, event) {
        Object.assign(navItem,{cust_name: event.target.value})
        let menuItem = {name: navItem.id, cust_name: event.target.value, cust_disp: Number(navItem.cust_disp),cust_menu: true};
        this.menuService.updateMenu(menuItem)
            .subscribe((res: any) => {
                this.msg.show(`${navItem.title} updated`,'success');
            }, (err) => {
                this.msg.show(err.message,'error');
            });
    }

    changeOrderNo(navItem, event) {
        Object.assign(navItem,{cust_order: event.target.value})
        let menuItem = {name: navItem.id, cust_order: event.target.value,cust_menu: true};
        this.menuService.updateMenu(menuItem)
        .subscribe((res: any) => {
            this.msg.show(`${navItem.title} updated`,'success');
        }, (err) => {
            this.msg.show(err.message,'error');
        });
    }

    setNavItem(navId, toggled){
        const anteraAdminMenu = this.navigationItems.find(x => x.id === navId);
        anteraAdminMenu.hidden = toggled;
    }

    checkDisplay(navItem) {
        const menuItem = find(this.displayList,{'name': navItem.id});
        if (!menuItem)
        {
            // console.log("Nav Item ID ->",navItem.id);
            // console.log("Menu Items in Navigation.ts -> ", this.navigationItems);
            // console.log("Menu Item Not Found ->",navItem);
            // console.log("Display List -> ",this.displayList);
            return true;
        }

        return menuItem.display == "1" ? true: false;
    }


    checkDisplayCustom(navItem) {
        // console.log("this.displayList",this.displayList)
        // return
        const menuItem = find(this.displayList,{'name': navItem.id});
        if (!menuItem)
        {
            // console.log("Nav Item ID ->",navItem.id);
            // console.log("Menu Items in Navigation.ts -> ", this.navigationItems);
            // console.log("Menu Item Not Found ->",navItem);
            // console.log("Display List -> ",this.displayList);
            return true;
        }

        return menuItem.cust_disp == "1" ? true: false;
    }

}
