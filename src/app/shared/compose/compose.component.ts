import { Component, Inject, ViewEncapsulation, ViewChild, ElementRef, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MailService } from '../../main/content/apps/mail/mail.service';
import { MessageService } from 'app/core/services/message.service';
import { Mail, Attachment } from 'app/models/mail';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { AuthService } from 'app/core/services/auth.service';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { ApiService } from 'app/core/services/api.service';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { ContactsListDialogComponent } from 'app/shared/contacts-list-dialog/contacts-list-dialog.component';
import { b64toBlob } from 'app/utils/utils';
@Component({
    selector     : 'fuse-mail-compose',
    templateUrl  : './compose.component.html',
    styleUrls    : ['./compose.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseMailComposeDialogComponent implements OnInit
{
    Editor = ClassicEditor;
    @ViewChild('editor') editor: ElementRef;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    showExtraToFields = false;
    mailForm: FormGroup;
    action: string;
    mail: Mail;
    accountId: string;
    recordId: string;
    orderNo: string;
    orderId: string;
    docTypeSentEmailStatus: string;
    dialogTitle: string;
    dialogRef2: any;
    loading = false;
    enableContacts = false;
    cloudFiles = false;
    displayedColumns = ['icon', 'name', 'author', 'dateModified', 'tags', 'size', 'buttons'];
    restrictedRenaming = ["Artwork", "General", "Orders", "Quotes", "Sourcing", "Opportunities", "Projects"];
    dataSource: MatTableDataSource<any>;
    firstLoad = true;
    currentFolder: string;
    savedRecords = false;
    showFile = false;
    filePreview = false;
    metaData : any;
    isDoc = false;
    filePreviewUrl: string;
    lastFolder: string;
    Bucket: string;
    Prefix: string;
    Delimiter: string;
    confirmKey: string;
    awsFileManagerType: string;
    isRootDir = true;
    clDialogRef: MatDialogRef<ContactsListDialogComponent>
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    mailCredentialsList: any[] = [];
    CC = false;
    BCC = false;

    constructor(
        public dialogRef: MatDialogRef<FuseMailComposeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public mailService: MailService,
        private msg: MessageService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private auth: AuthService,
        private awsFileManagerService: AwsFileManagerService,
        private api: ApiService,
        private http: HttpClient
    )
    {
        this.firstLoad = true;
        this.lastFolder = "";
        this.filePreviewUrl = "";

        this.action = data.action;
        this.mail = data.mail;
        if(data.accountId !== undefined){
            this.accountId = data.accountId;
            this.recordId = data.recordId;
        }else{
            this.accountId = '';
        }
        if(data.enableContacts !== undefined){
            this.enableContacts = data.enableContacts;
        }
        this.enableContacts = false;
        if(data.orderNo !== undefined){
            this.orderNo = data.orderNo;
        }else{
            this.orderNo = '';
        }

        if(data.docTypeSentEmailStatus !== undefined){
            this.docTypeSentEmailStatus = data.docTypeSentEmailStatus;
        }else{
            this.docTypeSentEmailStatus = '';
        }

        if(data.orderId !== undefined){
            this.orderId = data.orderId;
        }else{
            this.orderId = '';
        }
        
        if ( this.action === 'Reply' )
        {
            this.dialogTitle = 'Reply Message';
        }
        else if ( this.action === 'Forward' )
        {
            this.dialogTitle = 'Forward Message';
        }
        else if (this.action === 'Send')
        {
            this.dialogTitle = 'New Message';
        }
        else
        {
            this.dialogTitle = 'New Message';
            this.mail = new Mail();
        }
        this.getUserEmailSetting();
        this.mail.from = this.auth.getCurrentUser().email;
        this.mailForm = this.createComposeForm();

    }

    ngOnInit()
    {

    }

    ngOnDestroy()
    {

    }

    createComposeForm()
    {   
        if(this.mail.bccEmail !== "") {
            this.mail.bcc.push(this.mail.bccEmail);
            this.onBCC();
        }
        if(this.mail.ccEmail !== "") {
            this.mail.cc.push(this.mail.ccEmail);
            this.onCC();
        }
        
        
        return this.fb.group({
            from        : [{value: this.mail.from}, Validators.required],
            to          : [this.mail.to],
            cc          : [this.mail.cc],
            bcc          : [this.mail.bcc],
            subject     : [this.mail.subject, Validators.required],
            body        : [this.mail.body, Validators.required],
        })
    }

    toggleExtraToFields()
    {
        this.showExtraToFields = !this.showExtraToFields;
    }

    onFileChange(event)
    {
        if(event.target.files.length > 0)
        {
            let file = event.target.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload=()=>{
                const base64str = (reader.result as string).split('base64,')[1];
                const blob = b64toBlob(base64str, file.type, 0);
                this.mail.attachments.push(new Attachment({
                    filename: file.name,
                    size: file.size,
                    data: blob,
                    mimetype: file.type
                }));
            };

        }
     }

    deleteArtworkLink(artworkIndex, fileIndex)
    {
        this.data.artworkResponses[artworkIndex].results.splice(fileIndex, 1);
        if (this.data.artworkResponses[artworkIndex].results.length === 0) {
            this.data.artworkResponses.splice(artworkIndex, 1);
        }
    }

    deleteAttachment(index)
    {
        this.mail.attachments.splice(index, 1);
    }

    send() {
        if (this.mailForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (this.mail.to.length == 0)
        {
            this.msg.show('Please specify at least one recipient.', 'error');
            return;
        }
        const data = {
            ...this.mailForm.getRawValue(),
            attachments: this.mail.attachments,
        }

        if (this.data.artworkResponses && this.data.artworkResponses.length) {

            const hasAttachments = this.data.artworkResponses.some(response => response.results && response.results.length > 0);

            if (hasAttachments) {
                // Setup artwork attachments
                if (!data.appendHtml) {
                    data.appendHtml = '';
                }
                data.appendHtml = data.appendHtml + `<br><h4>Artwork Attachments</h4>`;
                data.appendHtml = data.appendHtml + `<table>
                    <thead>
                        <tr>
                            <th colspan="2">Name</th>
                            <th>Tags</th>
                        </tr>
                    </thead>
                    <tbody>`;

                // Add to mail body
                this.data.artworkResponses.forEach((response) => {
                    if (response.results && response.results.length) {

                        response.results.forEach(file => {
                            data.appendHtml = data.appendHtml + `<tr>
                        <td style="width:50px"><a href="${file.downloadUrl}"> <img src="${file.thumbnail}" width="50" alt="${file.name}"></a></td>
                        <td><a href="${file.downloadUrl}">${file.name}</a></td>
                        <td>${file.metaData.tags}</td>
                    </tr>`;
                        });
                        data.appendHtml = data.appendHtml + `</tbody></table>`;
                    }
                });
            }
        }


        this.mail.setData(data);
        this.dialogRef.close({action: this.action, mail: this.mail});
    }

    addTo(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim()) {
            this.mail.to.push(value);
        }
        if (input) {
          input.value = '';
        }
    }

    removeTo(to: string): void {
        const index = this.mail.to.indexOf(to);
        if (index >= 0) {
            this.mail.to.splice(index, 1);
        }
    }
    addCc(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim()) {
            this.mail.cc.push(value);
        }
        if (input) {
          input.value = '';
        }
    }

    removeCc(cc: string): void {
        const index = this.mail.cc.indexOf(cc);
        if (index >= 0) {
            this.mail.cc.splice(index, 1);
        }
    }

    addBcc(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim()) {
            this.mail.bcc.push(value);
        }
        if (input) {
          input.value = '';
        }
    }

    removeBcc(bcc: string): void {
        const index = this.mail.bcc.indexOf(bcc);
        if (index >= 0) {
            this.mail.bcc.splice(index, 1);
        }
    }

    onCC(){
      this.CC = !this.CC;
    }
    onBCC(){
      this.BCC = !this.BCC;
    }
    browseCloud()
    {
        this.loading = true;
        this.cloudFiles = true;
	if(this.accountId!=''){


                  this.api.getAccountAwsFilesLocation(this.accountId)
                      .then((res: any) => {
                              this.Bucket = res.s3Bucket;
                              this.Prefix = res.s3AccountDirectory;
                              this.Delimiter = '';
                      }, (err) => {
                      this.loading = false;
                      this.firstLoad = false;
                    });

	    this.getSubFolders('','folder');
	}else{
	    this.dataSource = new MatTableDataSource([]);
	    this.loading = true;
	    this.savedRecords = false;
	}
    }

  getLevelUpFolders(){
      this.getSubFolders(this.lastFolder,'folder');
  }
  getSubFolders(path,type,url = null){
      this.savedRecords = true;
      this.filePreview = false;
      this.isDoc = false;
      if(type =='file'){
         this.filePreviewUrl = url;
         this.isDoc = true;
         if(this.checkImageUrl(url)){
             this.isDoc = false;
         }
       return;
      }
      this.dataSource = new MatTableDataSource([]);
      const tableData = [];
      this.confirmKey = "";
      const data = new FormData();
      this.loading = true;

                  this.api.getAccountAwsFilesLocation(this.accountId)
                      .then((res: any) => {
                              const params = {
                                Bucket: res.s3Bucket,
                                Prefix: res.s3AccountDirectory,
                                Delimiter: '',
                              };
                              switch(this.awsFileManagerType){
                              case 'sourcing':
				      if(this.recordId !='' && this.firstLoad === true ){
					  path = res.s3AccountDirectory+'/Sourcing/'+this.recordId+'/';
					  this.lastFolder = res.s3AccountDirectory+'/Sourcing/';
					  this.currentFolder = 'Sourcing/'+this.recordId+'/';
					  this.awsFileManagerService.ROOT = res.s3AccountDirectory;
				      }
                              break;
                              case 'opportunities':
				      if(this.recordId !='' && this.firstLoad === true ){
					  path = res.s3AccountDirectory+'/Opportunities/'+this.recordId+'/';
					  this.lastFolder = res.s3AccountDirectory+'/Opportunities/';
					  this.currentFolder = 'Opportunities/'+this.recordId+'/';
					  this.awsFileManagerService.ROOT = res.s3AccountDirectory;
				      }
                              break;
                              case 'projects':
				      if(this.recordId !='' && this.firstLoad === true ){
					  path = res.s3AccountDirectory+'/Projects/'+this.recordId+'/';
					  this.lastFolder = res.s3AccountDirectory+'/Projects/';
					  this.currentFolder = 'Projects/'+this.recordId+'/';
					  this.awsFileManagerService.ROOT = res.s3AccountDirectory;
				      }
                              break;
                              case 'artwork':
				      if(this.recordId !='' && this.firstLoad === true ){
					  path = res.s3AccountDirectory+'/Artwork/'+this.recordId+'/';
					  this.lastFolder = res.s3AccountDirectory+'/Artwork/';
					  this.currentFolder = 'Artwork/'+this.recordId+'/';
					  this.awsFileManagerService.ROOT = res.s3AccountDirectory;
				      }
                              break;
                              case 'accounts':
				      if(this.firstLoad === true ){
					  path = res.s3AccountDirectory+'/';
					  this.lastFolder = res.s3AccountDirectory+'/';
					  this.currentFolder = '/';
					  this.awsFileManagerService.ROOT = res.s3AccountDirectory;
				      }
                              break;
                              }


                              if(path!=''){
                                  path = path.slice(0, -1);
                                  params.Prefix = path;

                              }else{
                               if(this.awsFileManagerService.ROOT ==''){
                                   this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                                   this.lastFolder = res.s3AccountDirectory;
                               }
                              }
                              this.awsFileManagerService.FOLDER = params.Prefix;
                              if(this.awsFileManagerService.FOLDER == this.awsFileManagerService.ROOT){
                                  this.isRootDir = true;
                                  this.currentFolder = this.awsFileManagerService.ROOT;
                              }else{
                                var fileKey = this.awsFileManagerService.FOLDER;
                                fileKey = fileKey.replace(this.awsFileManagerService.ROOT+'/',"");
                                  this.currentFolder = fileKey;
                                var fileKey = this.awsFileManagerService.FOLDER;
                                var n = fileKey.lastIndexOf("/");
                                  this.lastFolder = fileKey.slice(0, n+1);
                                  this.isRootDir = false;
                              }

                                //this.fileUploads = this.awsFileManagerService.getFiles(params);

                                   this.Bucket = params.Bucket;
                                   this.Prefix = params.Prefix;
                                   this.Delimiter = params.Delimiter;

                                //this.dataSource.data.splice(0,this.dataSource.data.length);
                                //this.dataSource.data = this.awsFileManagerService.getFiles(params);
				this.api.getAwsFiles(this.Prefix,0,100)
				    .then((res: any) => {
				        this.dataSource.data = res.results;
				    }, (err) => {
				    });

                                //this.dataSource.data = tableData;



                  this.loading = false;
                  this.firstLoad = false;

                      }, (err) => {
                      this.loading = false;
                      this.firstLoad = false;
                    });

  }
  attachToEmail(img){

      //const imageUrl = img.url.replace('https://bmrefactor.anterasoftware.com','http://bhm001.anterasaas.com:9009');
      const imageUrl = img.url;
      this.getImage(imageUrl).subscribe(data => {
		  var file = new File([data], img.name);
		    let reader = new FileReader();
		    reader.readAsDataURL(file);
		    reader.onload=()=>{
			const base64str = (reader.result as string).split('base64,')[1];
			const blob = b64toBlob(base64str, file.type, 0);
			this.mail.attachments.push(new Attachment({
			    filename: file.name,
			    size: file.size,
			    data: blob,
			    mimetype: file.type
			}));
			this.loading = false;
		    }
      }, error => {

        console.log(error);
      });

/*
        this.loading = true;
	this.http.get(img.url,  {responseType:'blob'})
	      .subscribe(resp => {


	      });
*/


  }

  getImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
  }

  checkImageUrl(url){
   var arr = [ "jpeg", "jpg", "gif", "png", "JPEG", "JPG", "GIF", "PNG" ];
   var ext = url.substring(url.lastIndexOf(".")+1);
   if(arr.indexOf(ext) >= 0){
     return true;
    }
    return false;
  }

  showContactsDialog() {


        this.clDialogRef = this.dialog.open(ContactsListDialogComponent, {
            panelClass: 'contacts-list-dialog',
            data: {
            accountId : this.accountId
                }
        });

        this.clDialogRef.afterClosed().subscribe(res => {
            if (res) {
            }
        });
  }
  getUserEmailSetting() {
      this.api.getUserEmailSetting(this.auth.getCurrentUser().userId).subscribe((res: any) => {
          this.loading = false;
          this.mailCredentialsList = res;
          const credentials = this.mailCredentialsList.find(mailCredentials => mailCredentials.isPrimary > 0);
          if (!credentials) return '';
          this.mailForm.get('from').setValue(credentials.email);
      });
    }
  selectmailCredentialsFrom(ev){
      this.mail.from = ev.value;
  }
}

