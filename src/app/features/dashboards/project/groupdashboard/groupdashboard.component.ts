import { Component, OnInit, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/services/auth.service';
@Component({
  selector: 'groupdashboard-dashboard',
  templateUrl: './groupdashboard.component.html',
  animations   : fuseAnimations,
  styleUrls: ['./groupdashboard.component.css']
})
export class GroupdashboardComponent implements OnInit {
  @Input() widgetData:any;
  currentrange: string = 'TW';
  todayshipped: any = '0';
  constructor(private router: Router,
    private auth: AuthService) {
    }
    
    ngOnInit() {
      if(this.currentrange=="TW"){
        this.todayshipped = this.widgetData.groupdashboarddata.billed.total_cost_week;
      }else if(this.currentrange=="TM"){
        this.todayshipped = this.widgetData.groupdashboarddata.billed.total_cost_month;
      }else if(this.currentrange=="TY"){
        this.todayshipped = this.widgetData.groupdashboarddata.billed.total_cost_year;
      }  
  }
  changeDue(ev) {
    // this.currentrange = ev.value;      
    // this.todayshipped = this.widgetData.groupdashboarddata.(this.currentrange);  
    if(this.currentrange=="TW"){
      this.todayshipped = this.widgetData.groupdashboarddata.billed.total_cost_week;
    }else if(this.currentrange=="TM"){
      this.todayshipped = this.widgetData.groupdashboarddata.billed.total_cost_month;
    }else if(this.currentrange=="TY"){
      this.todayshipped = this.widgetData.groupdashboarddata.billed.total_cost_year;
    }       
  }
  goto(link, status = '', paymentStatus = '') {
    const user = this.auth.getCurrentUser();
    let queryParams = {};
    switch(link)
    {
       
      case '/artworks':
        queryParams = {refType:'User', duefilter: status, userName: `${user.firstName} ${user.lastName}`}
      break;
 
      default:
      break;
    }
    this.router.navigate([link], {queryParams});
  }
}
