import { Component, HostBinding, Input, OnDestroy, OnInit, PipeTransform, Pipe } from '@angular/core';
import { Mail } from 'app/models/mail';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ActivityFormDialogComponent } from 'app/shared/activity-form/activity-form.component';
import { ActivitiesService } from 'app/core/services/activities.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from 'app/core/services/api.service';
import { find, endsWith, lowerCase } from 'lodash';
import { MessageService } from 'app/core/services/message.service';

@Component({
    selector   : 'fuse-mail-list-item',
    templateUrl: './mail-list-item.component.html',
    styleUrls  : ['./mail-list-item.component.scss']
})
export class FuseMailListItemComponent implements OnInit, OnDestroy
{
    @Input() mail: Mail;
    @HostBinding('class.selected') selected: boolean = false;
    @HostBinding('class.unread') unread: boolean = false;

    dialogRef: MatDialogRef<ActivityFormDialogComponent>;
    shortDescription: string = '';

    constructor(
        private dialog: MatDialog,
        private actvitiyService: ActivitiesService,
        private api: ApiService,
        private msg: MessageService
    )
    {
    }

    ngOnInit()
    {
        this.shortDescription = this.mail.body.slice(0,150);
        this.shortDescription = this.mail.body.length > 150 ? this.shortDescription + '...' : this.shortDescription + '';
    }

    ngOnDestroy()
    {

    }

    saveEmail()
    {
        const dropdowns = [
            'sys_activity_types_list'
            ];
        this.api.getDropdownOptions({dropdown:dropdowns})
            .subscribe((res: any[]) => {
                const taskTypes = find(res, {name: 'sys_activity_types_list'}).options;
                let mailType;
                taskTypes.forEach((taskType: any) => {
                    if (endsWith(lowerCase(taskType.label), 'mail'))
                    {
                        mailType = taskType.label;
                        this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
                            panelClass: 'activity-form-dialog',
                            data      : {
                                action: 'new',
                                type: mailType,
                                mail: this.mail,
                                service : this.actvitiyService
                            }
                        });
                    }    
                });
            }, () => {
                this.msg.show('Server Connection Error', 'error');
            });
    }

}

//@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
