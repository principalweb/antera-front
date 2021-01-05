import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { dashlets } from '../../../fuse-fake-db/admin-executive';

@Component({
  selector: 'app-executive',
  templateUrl: './executive.component.html',
  styleUrls: ['./executive.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExecutiveComponent implements OnInit {

  isChecked = true;

  dashlets: any;
  disabled: boolean;
  constructor() { }

  ngOnInit() {
      this.dashlets = JSON.parse(localStorage.getItem("executive"));
      if(!this.dashlets)
        this.dashlets = dashlets;
      this.dashlets = this.sortJsonArrayByKey(this.dashlets, "name", "ascend");
  }

  sliderToggled(dashlet, event){
      this.dashlets.find(item=> item == dashlet)['show'] = event.checked;
  }

  saveChanges(){
    localStorage.removeItem("executive");
    localStorage.setItem("executive", JSON.stringify(this.dashlets));
  }

  sortJsonArrayByKey(array, sortby, direc){
      array.sort((i1,i2) => {
          if(i1[sortby] < i2[sortby])
              return direc == 'ascend'  ? -1 : 1;
          else if(i1[sortby] > i2[sortby])
              return direc == 'descend' ? -1 : 1;
          else
              return 0;
      });
      return array;
  }

}
