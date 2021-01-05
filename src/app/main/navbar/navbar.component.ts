import { Component, Input, OnDestroy, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';

import { navigation } from '../../navigation/navigation';
import { AuthService } from '../../core/services/auth.service';
import { ActivitiesService } from '../../core/services/activities.service';
import { ApiService } from '../../core/services/api.service';
import { PermissionService } from '../../core/services/permission.service';

import { MailService } from '../content/apps/mail/mail.service';
import { LogisticsService } from 'app/core/services/logistics.service';
import { FeaturesService } from 'app/core/services/features.service';
import { FuseNavigation } from '@fuse/types';

@Component({
    selector     : 'fuse-navbar',
    templateUrl  : './navbar.component.html',
    styleUrls    : ['./navbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseNavbarComponent implements OnDestroy
{
    private fusePerfectScrollbar: FusePerfectScrollbarDirective;

    @ViewChild(FusePerfectScrollbarDirective) set directive(theDirective: FusePerfectScrollbarDirective)
    {
        if ( !theDirective )
        {
            return;
        }

        this.fusePerfectScrollbar = theDirective;

        this.navigationServiceWatcher =
            this.navigationService.onItemCollapseToggled.subscribe(() => {
                this.fusePerfectScrollbarUpdateTimeout = setTimeout(() => {
                    this.fusePerfectScrollbar.update();
                }, 310);
            });
    }

    @Input() layout;
    navigation: any;
    navigationServiceWatcher: Subscription;
    timerMailSubscription: Subscription;
    timerActivitiesSubscription: Subscription;
    onActivityChangedSubscription: Subscription;

    fusePerfectScrollbarUpdateTimeout;

    restrictedItems = [
        {id: 'artwork', permission: 'Artwork'},
        {id: 'file-manager', permission: 'File Manager'},
        {id: 'order.inventory', permission: 'Inventory'},
        {id: 'order.receiving', permission: 'Receiving'},
        {id: 'order.production', permission: 'Production'},
        {id: 'order.vouching', permission: 'Vouching'},
        {id: 'order.apCredit', permission: 'Vouching'},
        {id: 'order.billing', permission: 'Billing'},
    ];

    constructor(
        private sidebarService: FuseSidebarService,
        private navigationService: FuseNavigationService,
        // Used for monitoring mail updates
        private mailService: MailService,
        private authService: AuthService,
        private permService: PermissionService,
        // Used for monitoring activities
        private activitiesService: ActivitiesService,
        private api: ApiService,
        private auth: AuthService,
        private features: FeaturesService,
        private cd: ChangeDetectorRef,
    )
    {
        // Navigation data
        this.navigation = navigation;
        this.api.getDisplayMenu().subscribe((menuList: any[]) => {
            // for (let navItem of this.navigation){
            //     this.updateMenuByDisplayOption(navItem, menuList);
            //     if (navItem.children){
            //         let childList = navItem.children;
            //         for (let childItem of childList){
            //             this.updateMenuByDisplayOption(childItem, menuList);
            //             if (childItem.children){
            //                 let subChildList = childItem.children;
            //                 for (let subChildItem of subChildList)
            //                 {
            //                     this.updateMenuByDisplayOption(subChildItem, menuList);
            //                 }
            //             }
            //         }
            //     }
            // }
            menuList.map((list)=>{
                    
                this.navigation.find((navigation) => {
                        if(navigation.children) {
                            navigation.children.some((children) => {
                            //^^^^^^
                                if(children.id === list.name){
                                    Object.assign(children,{cust_order:list.cust_order})
                                }
                                if(children.children) {
                                    children.children.some((subchildren) => {
                                        //^^^^^^
                                        if(subchildren.id === list.name){
                                            
                                            Object.assign(subchildren,{cust_order:list.cust_order})
                                        }
                                    });
                                }
                                
                           });
                        }
                })
            })
            this.navigationService.register('main', this.navigation);
            this.navigationService.setCurrentNavigation('main');
            this.setMenuItems()                          
        });

        // this.navigationService.register('main', this.navigation);
        // this.navigationService.setCurrentNavigation('main');

        // Default layout
        this.layout = 'vertical';
    }

    ngOnInit()
    {
        // Set Menu Items Based on User Permission
        this.setMenuItems();
        // Reset Mail Badge
        this.resetBage();

        this.configureLogisticsFeature();

        // Check latest unread email count after every XX seconds by Olena
        /*
        this.userService.isUserSignedIn().then((isLoggedIn) => {
            let isSignedIn = Boolean(isLoggedIn);
            if (isSignedIn == true)
            {
                this.mailService.getTotalCount('INBOX').then((response) => {
                    this.updateMailBadge(parseInt(response.messagesUnread));
                    this.timerMailSubscription = Observable.interval(300*1000)
                    .subscribe(() =>
                        this.mailService.getTotalCount('INBOX').then((response) => {
                            this.updateMailBadge(parseInt(response.messagesUnread));
                        }).catch((err) => {
                            console.error(err);
                        })
                    );
                }).catch((err) => {
                    console.error(err);
                })
            }
        }) ;
        */
        // Check latest activites assigned to logged user and status is pending
        this.updateActivityMenuBadgeCount();
        this.onActivityChangedSubscription = this.activitiesService.onActivityChanged.subscribe(message => {
            this.updateActivityMenuBadgeCount();
        })

    }

    private configureLogisticsFeature() {
        this.features.isLogisticsEnabled().subscribe((enabled) => {
            if (!enabled) {
                const orderMenu = this.navigation.find(x => x.id === 'order');
                const logisticsMenu = orderMenu.children.find(x => x.id === 'order.logistics');
                if (logisticsMenu) {
                    logisticsMenu.hidden = true;
                }
            }
        });
    }

    ngOnDestroy()
    {
        if ( this.fusePerfectScrollbarUpdateTimeout )
        {
            clearTimeout(this.fusePerfectScrollbarUpdateTimeout);
        }

        if ( this.navigationServiceWatcher )
        {
            this.navigationServiceWatcher.unsubscribe();
        }

        if (this.timerMailSubscription)
        {
            this.timerMailSubscription.unsubscribe();
        }

        if (this.onActivityChangedSubscription)
        {
            this.onActivityChangedSubscription.unsubscribe();
        }
    }

    toggleSidebarOpened(key)
    {
        this.sidebarService.getSidebar(key).toggleOpen();
    }

    toggleSidebarFolded(key)
    {
        this.sidebarService.getSidebar(key).toggleFold();
    }

    /*
    *  Olena: Update mail/acitvites badge
    */

    updateMailBadge(badgeCount)
    {
        // Get the mail nav item
        // const mailNavItem = this.navigation.find(x => x.id === 'mail');
        // mailNavItem.badge.title = badgeCount;
        this.navigationService.updateNavigationItem('mail', { badge: {title: badgeCount }});
    }

    updateActivitiesBage(badgeCount)
    {
        // Get the activities nav item
        // const activitiesNavItem = this.navigation.find(x => x.id === 'activities');
        // activitiesNavItem.badge.title = badgeCount;
        this.navigationService.updateNavigationItem('activities', { badge: {title: badgeCount }});
        this.cd.markForCheck();
    }

    resetBage()
    {
        // Get the mail nav item

        // const mailNavItem = this.navigation.find(x => x.id === 'mail');
        // mailNavItem.badge.title = 0;
        this.navigationService.updateNavigationItem('mail', { badge: {title: 0}});

        // Get the activities nav item
        // const activitiesNavItem = this.navigation.find(x => x.id === 'activities');
        // activitiesNavItem.badge.title = 0;
        this.navigationService.updateNavigationItem('activities', { badge: {title: 0}});
    }

    setMenuItems()
    {
        let userType = this.authService.getCurrentUser().userType;

        if (!userType) {
            this.navigationService.updateNavigationItem('antera', { hidden: true });
            this.navigationService.updateNavigationItem('admin', { hidden: true });
        }

        if (userType == "User")
        {
            this.navigationService.updateNavigationItem('antera', { hidden: true });
            this.navigationService.updateNavigationItem('admin', { hidden: true });
        }
        else if (userType == "CustomerAdmin")
        {
            this.navigationService.updateNavigationItem('antera', { hidden: true });
            this.navigationService.updateNavigationItem('admin', { hidden: false });
        }
        else{
            this.navigationService.updateNavigationItem('antera', { hidden: false });
            this.navigationService.updateNavigationItem('admin', { hidden: false });
        }

        if (userType !== 'AnteraAdmin') {
            this.api.getDisplayMenu().subscribe((menuList: any[]) => {
                for (let navItem of this.navigation){
                    this.updateMenuByDisplayOption(navItem, menuList);
                    if (navItem.children){
                        let childList = navItem.children;
                        for (let childItem of childList){
                            this.updateMenuByDisplayOption(childItem, menuList);
                            if (childItem.children){
                                let subChildList = childItem.children;
                                for (let subChildItem of subChildList)
                                {
                                    this.updateMenuByDisplayOption(subChildItem, menuList);
                                }
                            }
                        }
                    }
                }
            });
        } else {
            this.api.getDisplayMenu().subscribe((menuList: any[]) => {
                for (let navItem of this.navigation){
                    this.updateMenuByDisplayOptionCustom(navItem, menuList);
                    if (navItem.children){
                        let childList = navItem.children;
                        for (let childItem of childList){
                            this.updateMenuByDisplayOptionCustom(childItem, menuList);
                            if (childItem.children){
                                let subChildList = childItem.children;
                                for (let subChildItem of subChildList)
                                {
                                    this.updateMenuByDisplayOptionCustom(subChildItem, menuList);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    updateMenuByDisplayOption(navItem, menuList){
        if (navItem.id == 'antera' || navItem.id == 'admin') {
            return;
        }

        let menuItem = menuList.find(item => item.name == navItem.id);
        let restrictedItem = this.restrictedItems.find(item => item.id == navItem.id);
        
        // only do permission check if item is meant to be displayed and is possibly restricted
        if (restrictedItem && menuItem && menuItem.display == "1") {
            let res = this.permService.checkModuleAccess(this.authService.getCurrentUser().userId, restrictedItem.permission)
                .subscribe((res: any) => {
                        // gah
                        if (Number(res.data.allowEdit) == 0 &&
                            Number(res.data.allowView) == 0 &&
                            Number(res.data.allowDelete) == 0 &&
                            Number(res.data.allowPermission) == 0)
                        {
                            this.navigationService.updateNavigationItem(navItem.id, { hidden: true});
                            this.navigationService.updateNavigationItemCustom(navItem.id, { cust_name: menuItem.cust_name, cust_disp: menuItem.cust_disp, menu: true });
                        }
                });
        } else if(!menuItem) {
            this.navigationService.updateNavigationItemCustom(navItem.id, { cust_name: navItem.title, cust_disp: 0, menu: null });
        } else {
            
            const hidden: boolean = menuItem.display == "1" ? false : true;
            this.navigationService.updateNavigationItem(navItem.id, { hidden: hidden });
            this.navigationService.updateNavigationItemCustom(navItem.id, { cust_name: menuItem.cust_name, cust_disp: menuItem.cust_disp, menu: true });
        }
    }

    updateMenuByDisplayOptionCustom(navItem, menuList){
        
        let menuItem = menuList.find(item => item.name == navItem.id);
        
        // only do permission check if item is meant to be displayed and is possibly restricted
       if(!menuItem) {
            this.navigationService.updateNavigationItemCustom(navItem.id, { cust_name: navItem.title, cust_disp: 0, menu: null, cust_order: 0 });
        } else {
            
           this.navigationService.updateNavigationItemCustom(navItem.id, { cust_name: menuItem.cust_name, cust_disp: menuItem.cust_disp, menu: true, cust_order: menuItem.cust_order });
        }
    }

    updateActivityMenuBadgeCount(){

        const user = this.auth.getCurrentUser();
        this.api.post('/content/get-activity-count', {
            term: {
                userId: user.userId,
                status: '',
            }
        })
        .subscribe((count: any) => {
            this.updateActivitiesBage(parseInt(count));
        },(err)=> {
            console.log(err);
        });
    }
}
