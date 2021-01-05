import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MessageService } from 'app/core/services/message.service';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';



@Component({
  selector: 'aws-file-manager-dialog',
  templateUrl: './aws-file-manager-dialog.component.html',
  styleUrls: ['./aws-file-manager-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AwsFileManagerDialogComponent implements OnInit {
  @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
  @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
  @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
  @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
  @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;
  accountId = 'root';
  awsFileManagerType = 'root';
  loading = false;
  lastSharedPath = '';
  isSharePopup = true;
  order = null;

  constructor(
    public dialogRef: MatDialogRef<AwsFileManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private msg: MessageService
  ) { 
     if(this.data.lastSharedPath){
         this.lastSharedPath = this.data.lastSharedPath;
     }

  }

  ngOnInit() {
    this.accountId = 'root';
    
  }

  shareFiles(event) {
      this.dialogRef.close(event);
  }
}
