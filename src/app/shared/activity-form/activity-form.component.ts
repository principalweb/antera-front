import { Component, Inject, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/services/auth.service';
import { find } from 'lodash-es';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { Activity, User } from 'app/models';
import { b64toBlob } from 'app/utils/utils';
import * as FileSaver from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Contact } from 'app/models/contact';
import { NoteService } from 'app/main/note.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector     : 'activity-form-dialog',
    templateUrl  : './activity-form.component.html',
    styleUrls    : ['./activity-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class ActivityFormDialogComponent
{
    currentType = 'Task';
    currentItemType = '';
    activityForm: FormGroup;
    action: string;
    activity: Activity;
    service: any;
    filteredCustomers: Observable<any[]>;
    loading = false;
    featureImageLoading = false;
    isReadOnly = true; 
    projectTaskItemType = ['Custom', 'Domestic'];
    projectTaskItemFirmDirection = ['Yes', 'No'];
    types = [];
    activityStatus = [];
    relates = [];
    selectedDecoType: any = {};
    isNewOrderActivity : boolean;
    currentContact: Contact;
    currentUser: User;

    featureImage = '';
    thumbnail = '';

    // Tasks
    priorities = [];
    metrics = [];
    when = [];
    taskTypes = [];

    // Quality Controls
    reasons = [];
    impacts = [];
    departments = [];
    
    //Notes
    orderTabList = [];
    orderDocList = [];
    
    filteredUsers = [];
    filteredRefs = [];
    filteredDecoType = [];
    assignedTypes = [{id:0,text:"User"}, {id:1,text:"Group"}];

    b64toBlob = b64toBlob;
    callDirections = [];
    dateModel: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    constructor(
        public dialogRef: MatDialogRef<ActivityFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        public noteService: NoteService,
        private authService: AuthService,
        private msg: MessageService,
        private api: ApiService,
        public dialog: MatDialog
    )
    {
        this.action = data.action;
        this.service = data.service;
        if (this.data.order && this.data.action === "new") this.isNewOrderActivity = true;
        console.log("data", data);
        console.log("this.data", this.data);

        this.api.getAllDesignTypes()
            .subscribe((res: any[]) => {
                this.filteredDecoType = res;
            });
        if ( this.action === 'edit' )
        {
            this.activity = data.activity.clone();
            this.activity.activity = data.activity.type;
            this.activity.due_date = data.activity.dueDate;
            this.activity.dueDate = data.activity.dueDate;
            this.activity.dateEntered = data.activity.dateEntered;
            this.activity.id = data.activity.id;
            this.activity.ref_id = data.activity.refId;
            this.activity.ref_name = data.activity.refName;
            this.activity.ref_type = data.activity.refType;
            this.activity.status = data.activity.status;
            this.activity.value = data.activity.value;
            this.activity.assignedName = data.activity.assignedName.slice(3, data.activity.assignedName.length);
            console.log(this.activity.assignedName);
            this.activity.ownerName = data.activity.ownerName;
            this.activity.featureImage =  data.activity.featureImage;
            this.activity.thumbnail = data.activity.thumbnail;
            this.currentItemType = data.activity.value.itemType;
            this.activity.assignedType = data.activity.assignedType;
            console.log(this.activity.assignedType);
            
        }
        else
        {
            this.activity = new Activity();
            this.activity.activity = data.type;
            this.activity.status = 'Pending';
            const user = this.authService.getCurrentUser();
            this.activity.value.assigned.name =
                `${user.firstName} ${user.lastName}`;
            this.activity.value.assigned.id = `${user.userId}`;
            if (data.order) {
                this.activity.ref_type = (data.order.orderType == 'Quote') ? 'Quote' : 'Order';
                this.activity.ref_name = data.order.orderNo;
                this.activity.ref_id = data.order.id;
                //this.activity.orderTab = data.order.orderTab;
                //this.activity.orderDoc = data.order.orderDoc;
                if (data.order.subject) {
                  this.activity.value.name = data.order.subject;
                }
            }

            if (data.account) {
                this.activity.ref_type = 'Account';
                this.activity.ref_id = data.account.id;
                this.activity.ref_name = data.account.accountName;
            }

            if (data.project) {
                this.activity.ref_type = 'Project';
                this.activity.ref_id = data.project.id;
                this.activity.ref_name = data.project.name;
                this.activity.value.artworkCustomerId = data.project.accountId;        
                this.activity.value.artworkCustomerName = data.project.accountName;
            }

            if (data.projectTask) {
                this.activity.ref_type = 'Project Task';
                this.activity.ref_id = data.projectTask.id;
                this.activity.ref_name = data.projectTask.value.name;
            }

            if (data.contact) {
                this.activity.ref_type = 'Contact';
                this.activity.ref_id = data.contact.id;
                this.activity.ref_name = `${data.contact.firstName} ${data.contact.lastName}`;
            }

            if (data.mail) {
                this.activity.value.name = data.mail.subject;
                this.activity.value.description = data.mail.body;
                this.activity.value.dueDate = data.mail.date;
                this.activity.value.emailUid = data.mail.uid;
                this.activity.value.emailAttachments = data.mail.attachments;
                this.activity.value.emailUserId = this.authService.getCurrentUser().userId;
            }

            if (data.assigned) {
                // this.activity.assigned
            }
        }
        this.currentType = this.activity.activity;
        if (this.currentType == '')
            this.currentType = 'Activity';
        this.activityForm = this.createActivityForm();

        this.dialogRef.disableClose = true;
        this.dialogRef.backdropClick().subscribe(() => {
            // this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            //     disableClose: true
            // });
            // this.confirmDialogRef.componentInstance.confirmMessage = 'Do you want to save ?';
            // if(confirm("Do you want to save? ")) {
                
            // } else {
            //     this.dialogRef.close()
            // }
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: true
            });
            this.confirmDialogRef.componentInstance.confirmMessage = 'Do you want to save ?';
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if(result) {
                  //console.log('Yes clicked');
                  // DO SOMETHING
                } else {
                    this.dialogRef.close()
                }
            })
        }); 
       
      
    }

    refTypeEqualsOrder() {
        this.activityForm.controls.refType.value.toLowerCase() === 'order';
    }

    fetchContactPhoneNumberAndEmail(contactId){
        this.api.getContactDetails(contactId).subscribe((contact: Contact) => {
            this.currentContact = contact;
            this.activityForm.controls.contactEmail.setValue(this.currentContact.email);
            this.activityForm.controls.phone.setValue(this.currentContact.phone);
        }, error => console.log("error", error));
    }

    ngOnInit()
    {
        this.currentUser = this.authService.getCurrentUser();
        if (this.action === "edit") {
            this.activityForm.controls.owner.patchValue(this.activity.ownerName);
            this.activityForm.controls.assigned.patchValue(this.activity.assignedName);
        }
        else {
            this.activityForm.controls.owner.patchValue({id:this.currentUser.userId,name:`${this.currentUser.firstName} ${this.currentUser.lastName}`});
        }
        this.activityForm.get('owner').valueChanges.pipe(
            debounceTime(400),
        ).subscribe(keyword => {
            this.service.autocompleteUsers(keyword).subscribe(res => {
                this.filteredUsers = res;
            });
        });

        if (this.data.order && this.data.order.contactId) this.fetchContactPhoneNumberAndEmail(this.data.order.contactId);

        this.activityForm.get('assigned').valueChanges.pipe(
            debounceTime(400)
        ).subscribe(keyword => {
            if(this.activityForm.value.assigned === ""){
                return;
            }
            if(this.activityForm.value.assignedType === 0){
                this.service.autocompleteUsers(keyword).subscribe(res => {
                    this.filteredUsers = res;
                });
            }
            else{
                this.service.autocompleteNotificationGroup(keyword).subscribe(res => {
                    this.filteredUsers = res;
                });

            }
        });

        this.activityForm.get('artworkCustomerName').valueChanges.pipe(
            debounceTime(400)
        ).subscribe(keyword => {
            this.service.autocompleteAccounts(keyword).subscribe(res => {
                this.filteredCustomers = res;
            });
        });

        this.activityForm.get('refName').valueChanges.pipe(
            debounceTime(100),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if (this.activityForm.value.refType === 'Account') {
                this.service.autocompleteAccounts(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Vendor') {
                this.service.autocompleteVendors(keyword).subscribe(res => {
                        this.filteredRefs = res;
                })
            } else if (this.activityForm.value.refType === 'Order') {
                this.service.autocompleteOrders(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Quote') {
                this.service.autocompleteQuotes(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Project') {
                this.service.autocompleteProjects(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Project Task') {
                this.service.autocompleteProjects(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Opportunity') {
                this.service.autocompleteOpportunitiesByName(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Leads') {
                this.service.autocompleteLeads(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Artwork') {
                this.service.autocompleteArtworks(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else if (this.activityForm.value.refType === 'Sourcing') {
                this.service.autocompleteSourcing(keyword).subscribe(res => {
                    this.filteredRefs = res;
                });
            } else {
                this.service.autocompleteContacts(keyword, true).subscribe(res => {
                    this.filteredRefs = res;
                });
            }
        });
        
        const dropdowns = [
            'sys_activity_types_list',
            'sys_activity_status_list', 
            'sys_activity_relates_list',
            'sys_activity_priorities_list',
            'sys_activity_metrics_list',
            'sys_activity_when_list',
            'sys_activity_task_types_list',
            'sys_activity_reasons_list',
            'sys_activity_impacts_list',
            'sys_activity_departments_list',
            'sys_activity_order_tab_type_list',
            'sys_activity_order_doc_type_list',
            'sys_call_direction_list',
            ];

        this.loading = true;
        this.api.getDropdownOptions({dropdown:dropdowns})
            .subscribe((res: any[]) => {
                console.log("dropdown response", res);
                this.loading = false;
                this.types = find(res, {name: 'sys_activity_types_list'}).options;
                this.activityStatus = find(res, {name: 'sys_activity_status_list'}).options;
                this.relates = find(res, {name: 'sys_activity_relates_list'}).options;
                this.priorities = find(res, {name: 'sys_activity_priorities_list'}).options;
                this.metrics = find(res, {name: 'sys_activity_metrics_list'}).options;
                this.when = find(res, {name: 'sys_activity_when_list'}).options;
                this.taskTypes = find(res, {name: 'sys_activity_task_types_list'}).options;
                this.reasons = find(res, {name: 'sys_activity_reasons_list'}).options;
                this.impacts = find(res, {name: 'sys_activity_impacts_list'}).options;
                this.departments = find(res, {name: 'sys_activity_departments_list'}).options;
                this.orderTabList = find(res, {name: 'sys_activity_order_tab_type_list'}).options;
                this.orderDocList = find(res, {name: 'sys_activity_order_doc_type_list'}).options;
                this.callDirections = find(res, {name: 'sys_call_direction_list'}).options;
            });

       
    }
    
    createActivityForm()
    {
        const activityId = this.activity.assignedType == "" ? 0 : parseInt(this.activity.assignedType);
        return this.formBuilder.group({
            id                : [this.activity.id],
            type              : [(this.action == 'edit' || this.activity.activity == 'Project Task') ? {value: this.activity.activity, disabled: true} : this.activity.activity, Validators.required],
            subject           : [this.activity.value.name, Validators.required],
            owner             : [this.activity.value.owner],
            assigned          : [this.activity.value.assigned],
            assignedType      : [activityId],
            refType           : [this.action == 'edit' ? {value: this.activity.ref_type, disabled: true} : this.activity.ref_type, Validators.required],
            dueDate           : [this.activity.dueDate, Validators.required],
            dateEntered       : [this.activity.dateEntered],
            description       : [this.activity.value.description],
            refId             : [(this.action == 'edit' || this.activity.ref_name == 'Project' || this.activity.ref_name == 'Project Task') ? {value: this.activity.ref_id, disabled: true} : this.activity.ref_id, Validators.required],
            refName           : [(this.action == 'edit' || this.activity.ref_name == 'Project' || this.activity.ref_name == 'Project Task') ? {value: this.activity.ref_name, disabled: true} : this.activity.ref_name, Validators.required],
            // description       : [this.activity.value.description],
            phone             : [this.activity.value.phone],
            contactEmail      : [""],
            // Task and Project Task
            priority          : [this.activity.value.priority],
            status            : [this.activity.status, Validators.required],
            taskType          : [this.activity.value.type],
            reminderTimeInt   : [this.activity.value.reminderTimeInt], 
            reminderTimeMetric: [this.activity.value.reminderTimeMetric],
            reminderTimeWhen  : [this.activity.value.reminderTimeWhen],
            featureImage      : [this.activity.value.featureImage],
            thumbnail         : [this.activity.value.thumbnail],
            artworkCustomerId : [this.activity.value.artworkCustomerId],
            artworkCustomerName: [this.activity.value.artworkCustomerName],
            approved          : [this.activity.value.approved],
            approvalDate      : [this.activity.value.approvalDate],
            artworkRefId      : [this.activity.value.artworkRefId],
            itemType          : [this.activity.value.itemType],
            decoTypeId        : [this.activity.value.decoTypeId],
            decoType          : [this.activity.value.decoType],
            decoColor         : [this.activity.value.decoColor],
            itemColor         : [this.activity.value.itemColor],
            firmDirection     : [this.activity.value.firmDirection],
            itemLink     : [this.activity.value.itemLink],

            // Meeting
            hours             : [this.activity.value.hours],
            minutes           : [this.activity.value.minutes],
            location          : [this.activity.value.location],

            // Note
            file              : [this.activity.value.file],
            notesFile         : [''],
            note              : [this.activity.value.note],
            orderTab          : [this.activity.value.orderTab],
            orderDoc          : [this.activity.value.orderDoc],
            // Quality Control
            lostMinutes       : [this.activity.value.lostMinutes],
            notify            : [this.activity.value.notifyUsers],
            department        : [this.activity.value.department],
            impact            : [this.activity.value.impact],
            reason            : [this.activity.value.reason],

            // Email
            emailUid          : [this.activity.value.emailUid],
            emailUserId       : [this.activity.value.emailUserId],
            emailAttachments  : [this.activity.value.emailAttachments],
            
            //Call
            direction         : [this.activity.value.direction],
            uploadAwsFile     : ['']
            

        });
    }  

    create()
    {
        if(this.currentItemType =='Custom'){
            this.activityForm.get('decoTypeId').setValue('');
            this.activityForm.get('itemColor').setValue('');
            this.activityForm.get('decoColor').setValue('');
        }
        
        if( this.activityForm.controls.type.value =='Note' ){
    

            if(this.activityForm.controls.subject.invalid){
                this.msg.show('Subject is required', 'error');
                return;   
            }
            if(this.activityForm.controls.type.invalid){
                this.msg.show('Type is required', 'error');
                return;   
            }
            
            if(this.activityForm.controls.refType.invalid){
                this.msg.show('"Related To" is required', 'error');
                return;   
            }
    
            if(this.activityForm.controls.refName.invalid){
                this.msg.show( this.activityForm.getRawValue().refType + ' is required', 'error');
                return;   
            }
    
            if(this.activityForm.controls.dueDate.invalid){
                this.msg.show( 'Due Date is required', 'error');
                return;   
            }
        } 
        else if (this.activityForm.invalid) {
          this.msg.show('Please complete the form first', 'error');
          return;
        }

        this.activity.updateFromForm(this.activityForm.value);
        console.log("formValue", this.activityForm.value);
        console.log("this.activity", this.activity);
        let data = {
            ...this.activity,
            refId: this.activity.ref_id,
            refName: this.activity.ref_name,
            refType: this.activity.ref_type,
            type: this.currentType,
            activity: this.currentType
        }
        this.loading = true;
        console.log('actual data being send ------------ ', data);
        this.service.createActivity(data)
            .subscribe(data => {
                console.log(data);
                if (data && data.status === 'success')
                {
                    this.msg.show('New activity created','success');
                    this.service.onActivityChanged.next("Created"); // Update navbar to update badge title
                    forkJoin([
                        this.service.getActivitiesList(),
                        this.service.getTotalCount()
                    ]).subscribe(() => {
                        this.loading = false;
                        this.noteService.refresh.next(true);
                        this.dialogRef.close();
                    });
                }
                else{
                    this.msg.show(data.msg,'error');
                    this.loading = false;
                }
            },
                error => {
                    this.loading = false;
                    if (error.status === 400) {
                        error = error.error;
                        if (error.logged === "success") {
                            this.msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                        }
                        else {
                            this.msg.show("The System timed out, please login again.", 'error');
                        }
                    }
                    else {
                        this.msg.show('te.', 'error');

                    }

                    this.loading = false;
                })
    }

    update(isImageUpload = false)
    {

        if(this.currentItemType =='Custom'){
            this.activityForm.get('decoTypeId').setValue('');
            this.activityForm.get('itemColor').setValue('');
            this.activityForm.get('decoColor').setValue('');
        }

                if( this.activityForm.controls.type.value =='Note' ){
    

            if(this.activityForm.controls.subject.invalid){
                this.msg.show('Subject is required', 'error');
                return;   
            }
            if(this.activityForm.controls.type.invalid){
                this.msg.show('Type is required', 'error');
                return;   
            }
            
            if(this.activityForm.controls.refType.invalid){
                this.msg.show('"Related To" is required', 'error');
                return;   
            }
    
            if(this.activityForm.controls.refName.invalid){
                this.msg.show( this.activityForm.getRawValue().refType + ' is required', 'error');
                return;   
            }
    
            if(this.activityForm.controls.dueDate.invalid){
                this.msg.show( 'Due Date is required', 'error');
                return;   
            }
        } 
        
        if (this.activityForm.invalid) {
          this.msg.show('Please complete the form first', 'error');
          return;
        }

        if (this.activityForm.get('dueDate').value instanceof Date) {
            this.activity.dateString = moment(this.activityForm.get('dueDate').value).format()
        }

        
        this.activity.updateFromForm(this.activityForm.getRawValue());
        
        this.loading = true;
        this.service.updateActivity(this.activity).pipe(
            switchMap(() =>
                this.service.getActivitiesList()
            )
        ).subscribe(() => {
            this.loading = false;
            if(!isImageUpload){
                this.dialogRef.close();
            }
        },
            error => {
                this.loading = false;
                if (error.status === 400) {
                    error = error.error;
                    if (error.logged === "success") {
                        this.msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                    }
                    else {
                        this.msg.show("The System timed out, please login again.", 'error');
                    }
                }
                else {
                    this.msg.show('The System timed out, please login again.', 'error');

                }

                this.loading = false;
            })
    }

    displayName(val: any) {
        if (!val) {
            return '';
        } else if (typeof val === 'string') {
            return val;
        }
    
        return val.name;
    }

    selectRef(ev) {
        const ref = ev.option.value;
        this.activity.ref_name = ref.name;
        this.activity.ref_id = ref.id;        
        this.activityForm.patchValue({
            refId: ref.id,
            refName: ref.name
        });
        if(this.activityForm.value.refType =='Contact'){
            this.activityForm.patchValue({
                phone: ref.phone
            });        
        }

        if(this.activityForm.value.refType =='Account'){
            this.activityForm.patchValue({
                phone: ref.phone
            });        
        }

        if(this.activityForm.value.refType =='Order' || this.activityForm.value.refType =='Quote'){
            this.activityForm.patchValue({
                phone: ref.phone
            });        
        }
        
    }

  selectDecoType(ev) {
    this.selectedDecoType = find(this.filteredDecoType, { id: ev.value })
    this.activity.value.decoType = this.selectedDecoType.name;
    this.activity.value.decoTypeId = this.selectedDecoType.id;
    this.activityForm.patchValue({
      decoTypeId: this.selectedDecoType.id,
      decoType: this.selectedDecoType.name
    });
  }


    selectCustomerRef(ev) {
        const ref = ev.option.value;
        this.activity.value.artworkCustomerName = ref.name;
        this.activity.value.artworkCustomerId = ref.id;        
        this.activityForm.patchValue({
            artworkCustomerId: ref.id,
            artworkCustomerName: ref.name
        });   
    }

    changeType(ev) {
        this.currentType = ev.value;
    }
    changeItemType(ev) {
        this.currentItemType = ev.value;
    }

    download(filename)
    {
        const params = {
            userId: this.activity.value.emailUserId,
            uid: this.activity.value.emailUid,
            filename: filename
        }

        this.api.getAttachmentData(params)
            .subscribe((res: any) => {
                let blob = this.b64toBlob(res.data.data, res.data.mimetype, 0);
                FileSaver.saveAs(blob, res.data.filename);
            });
    }

  selectCustomer(ev) {
    const customer = ev.option.value;
    this.activityForm.patchValue({
      artworkCustomerId: customer.id,
      artworkCustomerName: customer.name
    });
  }
  
  onFileUploadEventForAws(event) {

    
    if (this.activity.value.artworkCustomerName == '' || this.activity.value.artworkCustomerId == '') {
        this.activityForm.patchValue({
            uploadAwsFile: '',
        });
       this.msg.show('Please choose customer to upload artwork/file', 'error');
       return;
    }

    if (this.activityForm.getRawValue().refName == '') {
       this.msg.show('Please choose project to upload artwork/file', 'error');
       return;
    }
    if (event.target.files.length > 0) {
      this.loading = true;
      let file = event.target.files[0];
      const data = new FormData();
      data.append('artworkFile', file);
      data.append("accountId", this.activity.value.artworkCustomerId);
      data.append("fileType", 'Project');
      data.append("projectName", this.activityForm.getRawValue().refName);
      this.api.uploadProjectFileToFileManager(data)
        .subscribe((res: any) => {
          this.loading = false;
          this.featureImage = res.url;
          this.thumbnail = res.thumbnail;
          this.activityForm.patchValue({
            featureImage: this.featureImage,
            thumbnail: this.thumbnail,
            uploadAwsFile: '',
          });
          this.activity.value.featureImage = this.featureImage;
          this.activity.value.thumbnail = this.thumbnail;

          this.update(true);
        }, (err => {
          this.loading = false;
        }));
    }

  }

  removeFeaturedImage() {
    this.activityForm.patchValue({
      featureImage: '',
      thumbnail: ''
    });
    this.activity.value.featureImage = '';
    this.activity.value.thumbnail = '';
    this.update(true);
  }

  GetFeaturedImageFilename(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query ?  query.split('&') : '';
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return this.GetFilenameFromUrl(params['thumbKey']);
  }

  GetFilenameFromUrl(url) {

    if (url != '') {
      var filename = url.substring(url.lastIndexOf('/') + 1);
      if (filename != '') {
        return filename;
      }
    }
    return "";

  }

  private autoCompleteWith(field, func): Observable<any[]> {
    console.log('test');
    return this.activityForm.get(field).valueChanges.pipe(
      map(val => this.displayName(val).trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(func)
    )
  }
  onFileUploadEventForNote(event) {
  console.log('onFileUploadEventForNote');
        if(event.target.files.length > 0) {
            this.loading = true;
            const data = new FormData();
            console.log(event.target.files);
            data.append('File', event.target.files[0]);
            this.api.uploadAnyFile(data)
                .subscribe((res: any) => {
                    this.activity.value.file = res.url;
		    this.activityForm.patchValue({
		      file: res.url,
		      notesFile: ''
		    });
                    this.loading = false;
                }, (err => {
                    this.loading = false;
                }));                
        }
  }

  removeNoteImage() {
    this.activityForm.patchValue({
      notesFile: '',
      file: '',
    });
    this.activity.value.file = '';
    this.update(true);
  }

  GetNoteImageFilename(url) {
     let filename = url.split('/').pop();
     return filename;
  }
  assignedTypeChange = function (event){
    this.activityForm.controls.assigned.setValue("");

  }
}

@Pipe({ name: 'cleanHtml'})
export class CleanHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
