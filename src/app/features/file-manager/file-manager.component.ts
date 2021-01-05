import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';


@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class FileManagerComponent implements OnInit {
  @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
  @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
  @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
  @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
  @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;
  accountId = 'root';
  awsFileManagerType = 'root';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private msg: MessageService
  ) { }

  ngOnInit() {
    this.accountId = 'root';
  }

}
