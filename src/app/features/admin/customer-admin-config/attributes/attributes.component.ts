import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { LabelsComponent } from './labels/labels.component';

import { ProductService } from 'app/core/services/product.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent implements OnInit {
  attributeTypes = [{name: 'Size'}];
  selectedAt: string;
  attributes = [];
  public ranked = [];
  public baseGroup = [];
  public filteredBaseGroup = [];
  groupRanksShow = [];
  groupRanks = [];
  nextGroupRank = 0;
  dataForm: FormGroup;
  productAttributeLabels = [];
  loading = false;
  constructor(
    private dialog: MatDialog,
    private pService: ProductService,
    private fb: FormBuilder,
    private msg: MessageService
    ) {
  }

  ngOnInit() {
    this.dataForm = this.fb.group(
                                  {
                                    searchText: new FormControl(''),
                                    show: new FormControl('50'),
                                    exactSearch: new FormControl(false)
                                  });
    this.selectedAt = 'Size';
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.baseGroup = [];
    this.filteredBaseGroup = [];
    this.groupRanksShow = [];
    this.groupRanks = [];
    this.ranked = [];
    this.pService.getLabelsListAll()
      .subscribe((response: any) => {
        this.productAttributeLabels = response;
      }, (err: any) => {
          this.msg.show('Error fetching values for attribute labels!!', 'error');
      });
    this.pService.getAttributeValues(this.selectedAt)
      .subscribe((response: any) => {
        console.log('request done');
        this.attributes = response;
        this.groupRanks = [];
        this.attributes.forEach(value => {
          if (value.rankGroup === '0') {
            this.baseGroup.push(value);
          } else {
            if (!this.ranked[Number(value.rankGroup) - 1]) {
              this.nextGroupRank++;
              this.groupRanks.push(Number(value.rankGroup) - 1);
              this.ranked[Number(value.rankGroup) - 1] = [];
              this.groupRanksShow[Number(value.rankGroup)] = false;
            }
            this.ranked[Number(value.rankGroup) - 1].push(value);
          }
        });
        if (this.groupRanks.length === 0 ) {
          this.groupRanks.push(this.nextGroupRank);
          this.ranked[this.nextGroupRank] = [];
          this.nextGroupRank++;
        }
        this.groupRanks = this.groupRanks.sort();
        this.processData();
        this.loading = false;
      }, (err: any) => {
        this.msg.show('Error fetching values for attribute' + this.selectedAt + '!', 'error');
        this.loading = false;
      });
  }

  processData() {
    if (this.dataForm.value.searchText !== '') {
      if (this.dataForm.value.exactSearch) {
        this.filteredBaseGroup = this.baseGroup.filter(r => r.value === this.dataForm.value.searchText);
      } else {
        this.filteredBaseGroup = this.baseGroup.filter(r => r.value.toLowerCase().indexOf(this.dataForm.value.searchText.toLowerCase()) !== -1);
      }
    } else {
      this.filteredBaseGroup = this.baseGroup;
    }
    this.filteredBaseGroup = this.filteredBaseGroup.slice(0, this.dataForm.value.show === '0' ? 50 : Number(this.dataForm.value.show));
  }

  addGroup() {
    this.groupRanks.push(this.nextGroupRank);
    this.ranked[this.nextGroupRank] = [];
    this.nextGroupRank++;
  }

  drop(event: CdkDragDrop<string[]>, group) {
    if (event.previousContainer.data === event.container.data) {
      if (group === 'base') {
        const f = this.baseGroup.findIndex(v => v.value === this.filteredBaseGroup[event.previousIndex].value);
        const t = this.baseGroup.findIndex(v => v.value === this.filteredBaseGroup[event.currentIndex].value);
        moveItemInArray(this.baseGroup, f, t);
        moveItemInArray(this.filteredBaseGroup, event.previousIndex, event.currentIndex);
      } else {
        moveItemInArray(this.ranked[Number(event.container.data)], event.previousIndex, event.currentIndex);
      }
    } else {
      console.log(event.previousContainer, event.container, event.previousIndex, event.currentIndex);
      if (group === 'base') {
        const fbgf = this.ranked[event.previousContainer.data[0]].splice(event.previousIndex, 1);
        fbgf[0].rankGroup = 0;
        this.baseGroup.push(fbgf[0]);
        this.filteredBaseGroup.push(fbgf[0]);
        const f = this.baseGroup.findIndex(v => v.value === this.filteredBaseGroup[event.currentIndex].value);
        moveItemInArray(this.baseGroup, this.baseGroup.length - 1, f);
        moveItemInArray(this.filteredBaseGroup, this.filteredBaseGroup.length - 1, event.currentIndex);
      } else {
        if (event.previousContainer.data[0] === 'base') {
          const fbgf = this.filteredBaseGroup.splice(event.previousIndex, 1);
          const f = this.baseGroup.findIndex(v => v.value === fbgf[0].value);
          this.baseGroup.splice(f, 1);
          fbgf[0].rankGroup = event.container.data[0];
          this.ranked[event.container.data[0]].push(fbgf[0]);
          moveItemInArray(this.ranked[event.container.data[0]], this.ranked[event.container.data[0]].length - 1, event.currentIndex);
        } else {
          const fbgf = this.ranked[event.previousContainer.data[0]].splice(event.previousIndex, 1);
          fbgf[0].rankGroup = event.container.data[0];
          this.ranked[event.container.data[0]].push(fbgf[0]);
          moveItemInArray(this.ranked[event.container.data[0]], this.ranked[event.container.data[0]].length - 1, event.currentIndex);
        }
      }
    }
    this.processData();
  }

  save() {
    this.loading = true;
    this.baseGroup = this.baseGroup.map((v, i) => {
      v.rank = i + 1;
      return v;
    });
    this.groupRanks.forEach(v => {
      this.ranked[v] = this.ranked[v].map((rv, i) => {
        rv.rank = i + 1;
        rv.rankGroup = v + 1;
        return rv;
      });
    }, this);
    let r = [...this.ranked];
    r.push([...this.baseGroup]);
    this.pService.updateAttributeRank(r)
      .subscribe((response: any) => {
        if (response.err === "0") {
          this.msg.show(response.msg, 'success');
          this.loading = false;
          this.loadData();
        }
      }, (err: any) => {
        this.loading = false;
        console.log(err);
      });
  }

  listLabels() {
    const dialogRef = this.dialog.open(LabelsComponent, {
      panelClass: 'antera-details-dialog',
      data: {
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      this.loadData();
    });
  }
}
