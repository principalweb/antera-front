import { Component, OnInit, ViewEncapsulation, OnDestroy, OnChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ContactsService } from 'app/core/services/contacts.service';
import { Subject } from 'rxjs/internal/Subject';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { IRelatedAccount } from "app/models/related-account";
import { MatCheckboxChange } from '@angular/material/checkbox';
import { customerPortalPermissionAPIService } from 'app/core/services/customerPortalPermissionAPI.service';
@Component({
  selector: "customer-portal-settings",
  templateUrl: "./customer-portal-settings.component.html",
  styleUrls: ["./customer-portal-settings.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CustomerPortalSettingsComponent implements OnInit, OnDestroy, OnChanges {

    public isLoading = false;
    public isForm = false;
    public statuses = [];
    public modules = [];
    public storeID;
    private isSave;
    contactId = "";
    destroyed$: Subject<boolean> = new Subject<boolean>();



  constructor(public contactsService: ContactsService, 
    private route: ActivatedRoute, 
    private api: ApiService,
      private message: MessageService,
      private permissions: customerPortalPermissionAPIService) { }

  

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  ngOnChanges(){
    
  }

    ngOnInit() {
        this.isLoading = false;
    this.contactId = this.route.snapshot.params.id;
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe((params: Params) => this.contactId = params.id);

     
  }

  


    public handleCustomerPortalChange = async ($event) => {
        this.storeID = $event.value;
        this.isLoading = true;
        this.statuses = [];
        this.modules = [];
        this.permissions.getByCustomerPortalID($event.value).subscribe((list: any) => {
            for (let i = 0; i < list.statuses.length; i++) {
                if (list.statuses[i].isCustomerPortalPermissionDisplay === "0") {
                    continue;
                }
                if (this.statuses[list.statuses[i].module] === undefined) {
                    this.statuses[list.statuses[i].module] = [];
                    this.modules[this.modules.length] = {
                        index: this.modules.length,
                        name: list.statuses[i].module,
                        isShow: false,
                        isContactShow: false,
                        showPermissions: [],
                        showContactPermissions: [],
                        isSaved:true
                    };
                }
                let datadata = { id: list.statuses[i].id, name: list.statuses[i].name}
                this.statuses[list.statuses[i].module].push(datadata);
              
            }
            this.isSave = true;
            for (let i = 0; i < list.permissions.length; i++) {
                this.isSave = false;
                for (let j = 0; j < this.modules.length; j++) {
                    if (this.modules[j].name === list.permissions[i].module) {
                        let data = JSON.parse(list.permissions[i].permissions);
                        this.modules[j].isShow = data.isShow;
                        this.modules[j].isContactShow = data.isContactShow;
                        this.modules[j].showPermissions = data.showPermissions;
                        this.modules[j].showContactPermissions = data.showContactPermissions;
                        this.modules[j].isSaved = false;
                        break;
                    }
                }



            }
            this.isLoading = false;
            this.isForm = true;

        },
            error => {
                if (error.status === 400) {
                    error = error.error;
                    if (error.logged === "success") {
                        this.message.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                    }
                    else {
                        this.message.show("The System timed out, please login again.", 'error');
                    }
                }
                else {
                    this.message.show('The System timed out, please login again.', 'error');


                    this.isLoading = false;
                    this.isForm = false;



                }
            });

    }

    showPermissionCheck = ($event, index) => {
        this.modules[index].showPermissions = []; 
        this.modules[index].isShow = $event.checked;
    }
    showContactPermissionCheck = ($event, index) => {
        this.modules[index].showContactPermissions = [];
        this.modules[index].isContactShow = $event.checked;
    }

    save = () => {
        this.isForm = false;
        this.isLoading = true;
        console.log(this.modules);
        this.permissions.save(this.storeID, this.modules, this.isSave).subscribe((list: any) => {
            this.message.show("Information has been saved", 'success');
            this.isLoading = false;
            this.isForm = true;
            this.handleCustomerPortalChange({ value: this.storeID });
            },
                error => {
                    if (error.status === 400) {
                        error = error.error;
                        if (error.logged === "success") {
                            this.message.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                        }
                        else {
                            this.message.show("The System timed out, please login again.", 'error');
                        }
                    }
                    else {
                        this.message.show('The System timed out, please login again.', 'error');


                        this.isLoading = false;
                        this.isForm = true;



                    }
                });
        
        
    }


}

