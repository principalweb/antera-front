import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'app/core/services/message.service';
import { Observable, Subscription, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { FormGroup, FormBuilder } from '@angular/forms';
import { forEach, isEmpty } from 'lodash';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'app/core/services/auth.service';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';

@Component({
    selector: 'app-aws-file-manager',
    templateUrl: './aws-file-manager.component.html',
    styleUrls: ['./aws-file-manager.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    providers: [
        SelectionService
    ]
})
export class AwsFileManagerComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    Bucket: string;
    Prefix: string;
    Delimiter: string;
    restrictedRenaming = ["Artwork", "General", "Orders", "Quotes", "Sourcing", "Opportunities", "Projects", "Customers", "Finance", "Marketing", "Sales", "Operations", "Training", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    showFile = false;
    filePreview = false;
    tabLoading = false;
    metaData: any;
    isDoc = false;
    filePreviewUrl: string;
    selectedFiles: FileList;
    myFiles: string[] = [];
    //  fileUploads: Observable<Array<FileUpload>>;
    //  account: Account;
    //  @Input() artwork: any;
    @Input() accountId: any;
    @Input() recordId: any;
    @Input() artworkOrderId: any;
    @Input() artworkId: any;
    @Input() awsFileManagerType: any;
    @Input() isSharePopup: any;
    @Input() lastSharedPath: any;
    @Output() shareFiles = new EventEmitter();
    //accountId = 'a3c838eb-f680-11e8-b555-0242ac110004';
    //designNo = '';
    onSelectionChangedSubscription: Subscription;
    filterForm: FormGroup;
    dataSource: MatTableDataSource<any>;
    checkboxes: any = {};
    tempFiles: any = {};
    confirmKey: string;
    displayedColumns = ['checkbox', 'icon', 'name', 'author', 'dateModified', 'tags', 'email', 'size', 'buttons'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<AwsCreateDirComponent>;
    dialogRefPreview: MatDialogRef<AwsDocViewerComponent>;
    dialogRefTagging: MatDialogRef<AwsTaggingComponent>;
    dialogRefRenameDir: MatDialogRef<AwsRenameDirComponent>;
    currentFolder: string;
    lastFolder: string;
    defaultFolder: string;
    selectedCount = 0;
    loading = false;
    firstLoad = true;
    savedRecords = false;
    isRootDir = true;
    refresh = false;
    refreshFolder: string;
    loaded = () => {
        this.loading = false;
    };
    dialogRefMailComposeCustomerProof: MatDialogRef<FuseMailComposeDialogComponent>;

    constructor(
        private awsFileManagerService: AwsFileManagerService,
        public selection: SelectionService,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private api: ApiService,
        private msg: MessageService,
        private authService: AuthService,
    ) { }

    ngOnInit() {
        //this.currentFolder = "";
        if (this.isSharePopup) {
            this.isSharePopup = true;
            if (this.lastSharedPath) {
                this.currentFolder = this.lastSharedPath;
            }
        } else {
            if (this.lastSharedPath) {
                this.currentFolder = this.lastSharedPath;
            } else {
                if (this.accountId == 'root') {
                    this.currentFolder = "/";
                }
            }
        }
        console.log('this.lastSharedPath' + this.lastSharedPath);

        this.defaultFolder = "";
        this.refreshFolder = "";
        this.tabLoading = false;
        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });


        //this.firstLoad = true;
        this.lastFolder = "";
        this.filePreviewUrl = "";
        //console.log('this.accountId' + this.accountId);
        //console.log('this.recordId' + this.recordId);
        console.log('ACCOUNT ID', this.accountId);
        console.log('AWS_FILE MANAGER', this.awsFileManagerType)
        if (!isEmpty(this.accountId)) {
            switch (this.awsFileManagerType) {
                case 'orders':
                    if (this.recordId != '') {
                        this.getSubFolders('', 'folder');
                    } else {
                        this.dataSource = new MatTableDataSource([]);
                        this.loading = true;
                        this.savedRecords = false;
                    }
                    break;
                case 'sourcing':
                    if (this.recordId != '') {
                        this.getSubFolders('', 'folder');
                    } else {
                        this.dataSource = new MatTableDataSource([]);
                        this.loading = true;
                        this.savedRecords = false;
                    }
                    break;
                case 'opportunities':
                    if (this.recordId != '') {
                        this.getSubFolders('', 'folder');
                    } else {
                        this.dataSource = new MatTableDataSource([]);
                        this.loading = true;
                        this.savedRecords = false;
                    }
                    break;
                case 'artwork':
                    if (this.recordId != '') {
                        this.getSubFolders('', 'folder');
                    } else {
                        this.dataSource = new MatTableDataSource([]);
                        this.loading = true;
                        this.savedRecords = false;
                    }
                    break;
                case 'accounts':
                    this.getSubFolders('', 'folder');
                    break;
                case 'root':
                    this.getSubFolders('', 'folder');
                    break;
            }
        } else {
            this.dataSource = new MatTableDataSource([]);
            this.loading = true;
            this.savedRecords = false;
        }


    }

    getLevelUpFolders() {
        this.getSubFolders(this.lastFolder, 'folder');
    }

    reloadFolder() {
        this.getSubFolders(this.refreshFolder, 'folder');
    }

    getSubFolders(path, type, url = null) {
        this.tabLoading = true;
        this.savedRecords = true;
        this.filePreview = false;
        this.isDoc = false;
        if (type == 'file') {
            this.filePreviewUrl = url;
            this.isDoc = true;
            //this.filePreview = true;         
            if (this.checkImageUrl(url)) {
                this.isDoc = false;
            }
            this.previewDoc();
            return;
        }
        console.log('path ' + path);
        console.log('this.currentFolder ' + this.currentFolder);
        console.log('this.firstLoad ' + this.firstLoad);
        if (this.firstLoad) {
            this.dataSource = new MatTableDataSource([]);
        } else {
            //this.dataSource.data.splice(0,this.dataSource.data.length);
        }
        this.refresh = false;
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
                switch (this.awsFileManagerType) {
                    case 'orders':
                        if (this.recordId != '' && this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/Orders/' + this.recordId + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/Orders/';
                            this.currentFolder = 'Orders/' + this.recordId + '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                    case 'sourcing':
                        if (this.recordId != '' && this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/Sourcing/' + this.recordId + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/Sourcing/';
                            this.currentFolder = 'Sourcing/' + this.recordId + '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                    case 'opportunities':
                        if (this.recordId != '' && this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/Opportunities/' + this.recordId + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/Opportunities/';
                            this.currentFolder = 'Opportunities/' + this.recordId + '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                    case 'projects':
                        if (this.recordId != '' && this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/Projects/' + this.recordId + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/Projects/';
                            this.currentFolder = 'Projects/' + this.recordId + '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                    case 'artwork':
                        if (this.recordId != '' && this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/Artwork/' + this.recordId + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/Artwork/';
                            this.currentFolder = 'Artwork/' + this.recordId + '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                    case 'accounts':
                        if (this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/';
                            this.currentFolder = '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                    case 'root':
                        if (this.firstLoad === true) {
                            path = res.s3AccountDirectory + '/';
                            this.defaultFolder = path;
                            this.lastFolder = res.s3AccountDirectory + '/';
                            this.currentFolder = '/';
                            this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        }
                        break;
                }
                //console.log('this.defaultFolder '+this.defaultFolder);
                this.refreshFolder = path;
                if (path != '') {
                    path = path.slice(0, -1);
                    params.Prefix = path;

                } else {
                    if (this.awsFileManagerService.ROOT == '') {
                        this.awsFileManagerService.ROOT = res.s3AccountDirectory;
                        this.lastFolder = res.s3AccountDirectory;
                    }
                }
                this.awsFileManagerService.FOLDER = params.Prefix;
                if (this.awsFileManagerService.FOLDER == this.awsFileManagerService.ROOT) {
                    this.isRootDir = true;
                    this.currentFolder = this.awsFileManagerService.ROOT;
                } else {
                    var fileKey = this.awsFileManagerService.FOLDER;
                    fileKey = fileKey.replace(this.awsFileManagerService.ROOT + '/', "");
                    this.currentFolder = fileKey;
                    var fileKey = this.awsFileManagerService.FOLDER;
                    var n = fileKey.lastIndexOf("/");
                    this.lastFolder = fileKey.slice(0, n + 1);
                    this.isRootDir = false;
                }

                //this.fileUploads = this.awsFileManagerService.getFiles(params);

                this.Bucket = params.Bucket;
                this.Prefix = params.Prefix;
                this.Delimiter = params.Delimiter;

                //this.dataSource.data.splice(0,this.dataSource.data.length);
                //this.dataSource.data = this.awsFileManagerService.getFiles(params);
                if (!this.firstLoad) {
                    this.dataSource.data.splice(0, this.dataSource.data.length);
                }
                var isRoot = '0';
                if (this.accountId == 'root') {
                    isRoot = '1';
                }
                this.api.getAwsFiles(this.Prefix, 0, 100, isRoot)
                    .then((res: any) => {
                        this.loading = true;

                        this.dataSource.data = res.results;
                        this.loading = false;
                        this.selection.reset(false);
                        this.selection.init(this.dataSource.data);

                    }, (err) => {
                    });

                //this.dataSource.data = tableData;

                //                  this.selection.reset(false);              
                //                  this.selection.init(this.dataSource.data);
                //this.loading = false;
                this.firstLoad = false;

            }, (err) => {
                this.loading = false;
                this.firstLoad = false;
            });

    }
    showFiles(enable: boolean) {
        this.showFile = enable;

        if (enable) {

            this.api.getAccountAwsFilesLocation(this.accountId)
                .then((res: any) => {
                    const params = {
                        Bucket: res.s3Bucket,
                        Prefix: res.s3AccountDirectory,
                        Delimiter: '',
                    };
                    // this.fileUploads = this.awsFileManagerService.getFiles(params);
                }, (err) => {
                });

        }
    }

    destroy() {

    }
    ngOnDestroy() {

    }

    onSelectedChange(moduleName) {
        this.selection.toggle(moduleName);
    }

    toggleAll(ev) {
        console.log('changedd', ev)
        this.selection.reset(ev.checked);
    }

    uploadFiles() {

    }

    checkImageOnlyUrl(url) {
        var arr = ["jpeg", "jpg", "gif", "png", "JPEG", "JPG", "GIF", "PNG"];
        var ext = url.substring(url.lastIndexOf(".") + 1);
        if (arr.indexOf(ext) >= 0) {
            return true;
        }
        return false;
    }

    checkImageUrl(url) {
        var arr = ["jpeg", "jpg", "gif", "png", "JPEG", "JPG", "GIF", "PNG", "pdf", "PDF", "svg", "SVG", "ai", "AI", "eps", "EPS", "dst", "DST", "cdr", "CDR", "AFF", "aff", "CCX", "ccx", "CDT", "cdt", "CGM", "cgm", "CMX", "cmx", "DXF", "dxf", "EXP", "exp", "FIG", "fig", "PCS", "pcs", "PES", "pes", "PLT", "plt", "SK", "sk", "SK1", "sk1", "WMF", "wmf", "PSD", "psd"];
        var ext = url.substring(url.lastIndexOf(".") + 1);
        if (arr.indexOf(ext) >= 0) {
            return true;
        }
        return false;
    }
    previewDoc() {

        const gallary = [];
        var previewFileIndex = 0;
        var cnt = 0;
        var currentFilePreviewUrl = this.filePreviewUrl;
        this.dataSource.data.forEach(function (files) {
            if (files.type == 'file') {
                gallary.push(files);
                if (currentFilePreviewUrl == files.url) {
                    previewFileIndex = cnt;
                }
                cnt++;
            }
        });
        this.dialogRefPreview = this.dialog.open(AwsDocViewerComponent, {
            panelClass: 'app-account-aws-doc-viewer',
            data: {
                url: this.filePreviewUrl,
                isDoc: this.isDoc,
                previewFileIndex: previewFileIndex,
                gallary: gallary,
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((data) => {
                if (data) {

                };
            });
    }


    createFolder() {
        this.dialogRef = this.dialog.open(AwsCreateDirComponent, {
            panelClass: 'account-create-aws-dir',
            data: {
                action: 'new',
                folderPath: this.currentFolder
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((data) => {
                if (data) {
                    this.loading = true;
                    const frmData = new FormData();
                    frmData.append("path", this.awsFileManagerService.FOLDER);
                    frmData.append("accountId", this.accountId);
                    frmData.append("folderName", data.folderName);
                    this.api.createDirInFileManager(frmData)
                        .subscribe((res: any) => {
                            this.getSubFolders(this.awsFileManagerService.FOLDER + "/", 'folder');
                        }, (err => {
                            this.loading = false;
                        }));

                };
            });

    }


    deleteSelectedFilesFolder() {

        if (this.selection.selectedIds.length == 0) {
            this.msg.show('Please select file/folder to delete.', 'error');
        } else {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to remove selected files/folders?';
            this.confirmDialogRef.afterClosed().pipe(
                switchMap(res => {
                    if (res) {
                        this.loading = true;
                        const filesToDelete = this.dataSource.data.filter((row) => this.selection.selectedIds.indexOf(row.id) > -1 && !this.restrictedFilesFolder(row));
                        const selectedFilesFolders = filesToDelete.map(file => file.name);
                        return this.api.deleteFromFileManger(this.accountId, this.awsFileManagerService.FOLDER, selectedFilesFolders).pipe(
                            tap(_ => {
                                this.getSubFolders(this.awsFileManagerService.FOLDER + "/", 'folder');
                                this.loading = false;
                            })
                        )
                    }

                    return of(null);
                })
            )
                .subscribe(_ => this.confirmDialogRef = null);
        }
    }

    restrictedFilesFolder(data) {
        var predefinedFolders = ["Artwork", "General", "Orders", "Quotes", "Sourcing", "Opportunities", "Projects", "Royalty_Reports", "Customers", "Finance", "Marketing", "Sales", "Operations", "Training", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        if (predefinedFolders.indexOf(data.name) > -1) {
            return true;
        }
        return false;
    }

    deleteCurrntFilesFolder(data) {

        var predefinedFolders = ["Artwork", "General", "Orders", "Quotes", "Sourcing", "Opportunities", "Projects", "Royalty_Reports", "Customers", "Finance", "Marketing", "Sales", "Operations", "Training", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        if (predefinedFolders.indexOf(data.name) > -1) {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
            this.confirmDialogRef.componentInstance.confirmMessage = 'You are not allowed to remove selected file/folder';
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if (result) {
                }
                this.confirmDialogRef = null;
            });
        } else {

            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to remove?';
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.loading = true;
                    const frmData = new FormData();
                    frmData.append("path", this.awsFileManagerService.FOLDER);
                    frmData.append("accountId", this.accountId);
                    frmData.append("selectedFilesFolders[]", data.name);
                    var selectedFilesFolders = [data.name];
                    this.api.deleteFromFileManger(this.accountId, this.awsFileManagerService.FOLDER, selectedFilesFolders)
                        .subscribe((res) => {
                            this.getSubFolders(this.awsFileManagerService.FOLDER + "/", 'folder');
                        }, (err) => {
                            this.loading = false;
                        })
                }
                this.confirmDialogRef = null;
            });

        }
    }
    editTags(data) {
        if (data.metaData.tags !== undefined) {
            this.metaData = data.metaData.tags;
        } else {
            this.metaData = '';
        }
        this.dialogRefTagging = this.dialog.open(AwsTaggingComponent, {
            panelClass: 'app-aws-tagging',
            data: {
                fileKey: data.key,
                metaData: this.metaData
            }
        });

        this.dialogRefTagging.afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.loading = true;
                    this.api.updateAwsFilesTags(data.key, res.join(', '))
                        .subscribe((res) => {
                            this.getSubFolders(this.awsFileManagerService.FOLDER + "/", 'folder');
                        }, (err) => {
                            this.loading = false;
                        })
                };
            });
    }


    renameDir(data) {
        var predefinedFolders = ["Artwork", "General", "Orders", "Quotes", "Sourcing", "Opportunities", "Projects", "Royalty_Reports", "Customers", "Finance", "Marketing", "Sales", "Operations", "Training", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        if (predefinedFolders.indexOf(data.name) > -1) {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
            this.confirmDialogRef.componentInstance.confirmMessage = 'You are not allowed to rename selected file/folder';
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if (result) {
                }
                this.confirmDialogRef = null;
            });
        } else {

            this.dialogRefRenameDir = this.dialog.open(AwsRenameDirComponent, {
                panelClass: 'aws-rename-dir',
                data: {
                    mydir: data.name,
                    dirType: data.type,
                }
            });

            this.dialogRefRenameDir.afterClosed()
                .subscribe((res) => {
                    if (res) {
                        this.loading = true;
                        this.api.renameAwsEntry(data.key, res.folderName, data.type)
                            .subscribe((res) => {
                                this.getSubFolders(this.awsFileManagerService.FOLDER + "/", 'folder');
                            }, (err) => {
                                this.loading = false;
                            })
                    };
                });
        }
    }

    paginate(ev) {
        if (this.loading) {
            return;
        }
        this.loading = false;
    }


    upload() {
        const file = this.selectedFiles.item(0);
        this.loading = true;
        const frmData = new FormData();

        for (var i = 0; i < this.myFiles.length; i++) {
            frmData.append("fileUpload[]", this.myFiles[i]);
        }
        this.loading = true;
        frmData.append("path", this.awsFileManagerService.FOLDER);
        frmData.append("accountId", this.accountId);
        this.api.uploadToFileManger(frmData)
            .subscribe((res: any) => {
                this.myFiles = [];
                this.getSubFolders(this.awsFileManagerService.FOLDER + "/", 'folder');
            }, (err => {
                this.loading = false;
            }));
    }

    selectFile(e) {
        this.selectedFiles = e.target.files;
        for (var i = 0; i < e.target.files.length; i++) {
            this.myFiles.push(e.target.files[i]);
        }
        this.upload();
    }
    shareCurrentFile(row) {
        let imageUrls = [];
        if (row.type == 'file') {
            if (this.checkImageOnlyUrl(row.id)) {
                imageUrls.push(row.downloadUrl);
            } else {
                imageUrls.push(row.thumbnail);
            }
        }
        this.shareFiles.emit({ imageUrls: imageUrls, lastSharedPath: this.currentFolder + '/' })
    }
    shareSelectedFiles() {
        let imageUrls = [];
        this.selection.selectedIds.forEach((path) => {
            this.dataSource.data.forEach((files) => {
                if (files.type == 'file' && files.id == path) {
                    if (this.checkImageOnlyUrl(path)) {
                        imageUrls.push(files.downloadUrl);
                    } else {
                        imageUrls.push(files.thumbnail);
                    }
                }
            });

        });
        this.shareFiles.emit({ imageUrls: imageUrls, lastSharedPath: this.currentFolder + '/' })

    }

  composeDialog(row) {
    this.getEmailTemplateForCustomerProof(row);
  }
  getEmailTemplateForCustomerProof(row){
    this.loading = true;
    const basicMailData = {
        subject: 'Art Proof',
        };  
    let mail = new Mail(basicMailData);
    this.api.processEmailTemplateByName({ proofURL:  row.thumbnail, templateName: 'Art Proof Electronic', orderId: this.artworkOrderId, artworkId : this.artworkId, currentUserId: this.authService.getCurrentUser().userId }).subscribe((res: any) => {
        this.loading = false;
        mail.subject = res.subject;
        mail.body = res.bodyHtml;
        this.openMailDialog(mail);
    });
    
  }
  openMailDialog(mail: Mail) {
        this.loading = false;
        this.dialogRefMailComposeCustomerProof = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data: {
                action: 'Send',
                mail: mail,
            }
        });
        this.dialogRefMailComposeCustomerProof.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.loading = true;
                this.dialogRefMailComposeCustomerProof = null;
                mail = res.mail;
                const data = new FormData();
                const frmData = new FormData();
                data.append('userId', this.authService.getCurrentUser().userId);
                data.append('userName', this.authService.getCurrentUser().firstName + ' ' + this.authService.getCurrentUser().lastName);
                data.append('to', mail.to.join(','));
                data.append('cc', mail.cc.join(','));
                data.append('bcc', mail.bcc.join(','));
                data.append('from', mail.from);
                data.append('subject', mail.subject);
                data.append('body', mail.body);
                
                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                });

                this.api.sendMailSMTP(data)
                    .subscribe(
                        (res: any) => {
                              this.api.updateArtworkStatusByDesignId(this.artworkId, 4, '', '', mail.to.join(',')).subscribe((res) => {
                                  this.loading = false;
                                  this.msg.show('Email sent', 'success');
                              })
                            
                        },
                        (err: any) => {
                            this.loading = false;
                            this.msg.show(err.error.msg, 'error');
                            console.log(err);
                              this.api.updateArtworkStatusByDesignId(this.artworkId, 4, '', '', mail.to.join(',')).subscribe((res) => {
                              //still changing the status
                              })
                        });
            });
        return mail;
  }
}
