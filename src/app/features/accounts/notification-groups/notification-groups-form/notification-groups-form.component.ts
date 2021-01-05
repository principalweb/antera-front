import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { INotificationGroup } from '../notification-groups-resources/notification-group-interface';
import { NotificationGroupsService } from '../notification-groups-resources/notification-groups.service';
import { AuthService } from 'app/core/services/auth.service';
import { fuseAnimations } from '@fuse/animations';
import { map, startWith,debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'notification-groups-form',
  templateUrl: './notification-groups-form.component.html',
    styleUrls: ['./notification-groups-form.component.scss'],
    animations: fuseAnimations
})
export class NotificationGroupsFormComponent implements OnInit {

    public aForm: FormGroup;
    public accountData = [];
    public accountList: Array<any>;
    public newText: string = '';
    public aliasError: boolean = false;
    private editID: string = null;
    public isUniqueBlur: boolean = false;
    public uniqueCheck:boolean = false;
    private selectedAccount:any;

    constructor(
        private formBuilder: FormBuilder,
        private notificationGroupsService: NotificationGroupsService,
        private router: Router,
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private msg: MessageService,
        private auth: AuthService) { }

    ngOnInit() {

        this.editID = this.activatedRoute.snapshot.paramMap.get('id');
        let builder = null;
        this.accountList = [];
            builder = {
                'name': ['', Validators.required],
                'accountName': ['']
            }
            this.aForm = this.formBuilder.group(builder);
            this.accountList = [];
            this.aForm.controls.accountName.valueChanges.subscribe(val => {
                this.loadData(this.aForm.value.accountName);
            });

        if(this.editID !== null) {
            this.processData();

        }
    }
    processData = async function () { 
        this.loading = true;
        let list = await this.notificationGroupsService.getByID(this.editID, this.msg);
        
        if (list.status !== undefined && !(list.status > 199 && list.status < 300)) {
            this.loading = false;
            return;
        }
            
        let builder = {
            'name': [{ value:list.groupName, disabled: true}],
            'accountName': ['']
        }
        this.aForm = this.formBuilder.group(builder);
        if (list.accounts.length > 0){
            this.accountList = [];
            for (let i = 0; i < list.accounts.length; i++) {
                this.accountList.unshift({
                    text: {id:list.accounts[i].accountID,name:list.accounts[i].name}
                });
            }
        }
        this.aForm.controls.accountName.valueChanges.subscribe(val => {
            this.loadData(this.aForm.value.accountName);
        });
        this.loading = false;
    }
    loadData = async function (accountname: string) {
        if (accountname === null || accountname === "") {
            this.accountData = [];
            return;
        }
        this.accountData = await this.notificationGroupsService.getAccounts(accountname, this.msg);
        if (this.accountData.status !== undefined && !(this.accountData.status > 199 && this.accountData.status < 300)) {
            this.loading = false;
            return;
        }
    }

  getName(account: string) {
      this.selectedAccount=account;
     return account["name"];
  }


    public getNotDeleted = function() {
        return this.accountList.filter((item: any) => {
            return !item.deleted
        })
    }

    public addItem = function($event) {
        if (this.selectedAccount.length !== 0) {
            this.accountList.unshift({
                text: this.selectedAccount
            });
            this.selectedAccount = [];
            this.aForm.controls.accountName.setValue("");

        }

    }
    public save = async function () {
        this.loading = true;
        if (!this.aForm.value) {
            return false;
        }
        let accountIDs = [];
        for(let i=0; i <  this.accountList.length; i++){
            if(!this.accountList[i].deleted){
                accountIDs.push(this.accountList[i].text.id);
            }
        }
        let postData = {};

        let data = null;
        if (this.editID !== null) {
            postData = 
                            {
                                "notificationGroupID":this.editID,
                                "name":this.aForm.value.name,
                                "accountIDs":accountIDs
                            };
            data = await this.notificationGroupsService.update(postData, this.msg);
            if (data.status !== undefined && !(data.status > 199 && data.status < 300)) {
                this.loading = false;
                return;
            }

        }
        else{
            postData = 
                            {
                                "name":this.aForm.value.name,
                                "accountIDs":accountIDs
                            };
            data = await this.notificationGroupsService.save(postData, this.msg);
            if (data.status !== undefined && !(data.status > 199 && data.status < 300)) {
                this.loading = false;
                return;
            }

        }
        this.loading = false;
        if(data.status === "failed"){
            this.uniqueCheck = true;
            return;
        }
        this.router.navigate([`/accounts/notification/groups`]);

        
    }
    async checkUnique() {
        if (this.aForm.value.name === "")
            return;
        let data = await this.notificationGroupsService.checkUnique(this.aForm.value.name, this.msg);

        this.isUniqueBlur = data.status;
        this.uniqueCheck = false;
    }
    showUnique(){
        if (this.isUniqueBlur) {
            this.uniqueCheck = true;
        }
        
    }
}
