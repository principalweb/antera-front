import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/services/auth.service';
import { fuseAnimations } from '@fuse/animations';
import * as shape from 'd3-shape';
@Component({
  selector: 'artwork-dashboard',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.css'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ArtworkComponent implements OnInit {
  @Input() widgetArtData:any;
  widgetart1: any = {};

  constructor(private router: Router,
    private auth: AuthService) {

       /**
       * Widget 5
       */
        this.widgetart1 = {
          currentRange: 'TPD',
          xAxis: true,
          yAxis: true,
          gradient: false,
          legend: false,
          showXAxisLabel: false,
          xAxisLabel: 'Days',
          allowDecimals:false,
          showYAxisLabel: false,
          yAxisLabel: 'Due',
          scheme: {
            domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
          },
          onSelect: (ev) => {
            console.log(ev);
          },
          supporting: {
            currentRange: '',
            xAxis: false,
            yAxis: false,
            gradient: false,
            legend: false,
            showXAxisLabel: false,
            xAxisLabel: 'Days',
            showYAxisLabel: false,
            yAxisLabel: 'Isues',
            scheme: {
              domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            curve: shape.curveBasis
          }
        };
     }

  ngOnInit() {
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
