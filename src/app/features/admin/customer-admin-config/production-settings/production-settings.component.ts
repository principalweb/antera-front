import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ProductionsService } from 'app/core/services/productions.service';
import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'production-settings',
  templateUrl: './production-settings.component.html',
  styleUrls: ['./production-settings.component.css']
})
export class ProductionSettingsComponent implements OnInit {

  settingsForm: FormGroup;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  constructor(
    private service: ProductionsService,
    private api: ApiService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private msg: MessageService,
  ) { }

  ngOnInit() {
    this.api.getAdvanceSystemConfigAll({module: 'Production'})
      .subscribe((res: any) => {
        if (res.settings) {
          let config = res.settings;
          if (config.autoBatchByDesign) {
            config.autoBatchByDesign = config.autoBatchByDesign == false || config.autoBatchByDesign == "0" ? false : true;
          }
          if(config.allowNoEquipment) {
            config.allowNoEquipment = config.allowNoEquipment == false || config.allowNoEquipment == "0" ? false : true;
          }
          this.settingsForm = this.fb.group(config);
        }
      });

  }

  batchAllByDesign() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
        disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to batch all jobs by design? This operation is irreversible.';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.batchAllByDesign().subscribe((res: any) => {
          this.msg.show(res.msg, 'success');
        })
      }
    })
  }

  unbatchAll() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
        disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to unbatch jobs by design? This operation is irreversible.';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.unbatchAll().subscribe((res: any) => {
          this.msg.show(res.msg, 'success');
        })
      }
    })
  }

  save() {
    const config = this.settingsForm.value;
    const postData = {
      module: 'Production',
      settings: {
        ...config
      }
    };

    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.msg.show('Production Settings updated', 'success');
        },(err) => {
          this.msg.show(err, 'success');
        });
  }
}