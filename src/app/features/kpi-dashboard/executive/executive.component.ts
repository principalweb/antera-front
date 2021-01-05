import { Component, OnInit, AfterViewInit, ViewChild, ViewChildren, ElementRef, ViewEncapsulation } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts'
import * as shape from 'd3-shape';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-executive',
  templateUrl: './executive.component.html',
  styleUrls: ['./executive.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ExecutiveComponent implements OnInit {

  @ViewChild("charts")
  canvas: ElementRef;

  @ViewChildren(BaseChartDirective)
  baseCharts;

  dashlets = [];
  dashlets1: any;
  dashlets2: any;
  dashlets3: any;
  charts_config : any;

  constructor() { }

  ngOnInit() {
    this.charts_config = JSON.parse(localStorage.getItem("executive"));
    console.log(this.charts_config);
    setTimeout(() => this.setChart(), 100);
  }

  setChart() {

    let gradient1 = this.canvas.nativeElement.getContext('2d').createLinearGradient(0, 0, 1000, 0);
    let gradient2 = this.canvas.nativeElement.getContext('2d').createLinearGradient(0, 0, 0, 200);
    let gradient3 = this.canvas.nativeElement.getContext('2d').createLinearGradient(0, 0, 0, 150);

    gradient1.addColorStop(0, '#4597d7');
    gradient1.addColorStop(1, '#FFFFFF');

    gradient2.addColorStop(0, 'rgba(21,235,114, 0.2)');
    gradient2.addColorStop(1, 'rgba(0, 243, 98, 0.5)');

    gradient3.addColorStop(0, 'rgba(255,255,255, 0.9)');
    gradient3.addColorStop(1, 'rgba(69,151,215,0.9)');

    var dashlets:any = [
      {
        title: "Customer Satisfication",
        chartType: "gauge",
        show: true,
        showNumber: true,
        value: 76.9,
        width: {
          responsive: 33,
          normal: 19
        },
        column: 1
      },
      {
        title: "Active Customers",
        show: true,
        showNumber: true,
        value: 226,
        width: {
          responsive: 33,
          normal: 20
        },
        column: 1
      },
      {
        title: "Growth Rate",
        show: true,
        showNumber: true,
        value: 22.87,
        unit: '%',
        subtitle: 'Growth',
        width: {
          responsive: 33,
          normal: 20
        },
        column: 1
      },
      {
        title: "Processed Orders",
        show: true,
        showNumber: true,
        value: 1240,
        width: {
          responsive: 49,
          normal: 20
        },
        column: 1
      },
      {
        title: "Net Income vs Projection",
        show: true,
        showNumber: true,
        value: 302.5,
        subtitle: "YTD Net Income",
        income :{
          tag: 'K',
          value: 52
        },
        width: {
          responsive: 49,
          normal: 19
        },
        column: 1
      },
      {
        title: "Sales Distribution",
        show: true,
        view : [400, 350],
        width: {
          responsive: 49,
          normal: 33
        },
        column: 2,
        chartType: 'pie',
        legend: true,
        legendTitle: '',
        explodeSlices: false,
        labels: true,
        arcWidth: 0.4,
        doughnut: true,
        gradient: false,
        scheme: {
          domain: ['#2ad4f3', '#00c5c9', '#15db86', '#00f362']
        },
        onSelect: (ev) => {
          console.log(ev);
        },
        labelFormatting : () => {

        },
        datas: [
          {
            name: 'Apparel',
            value: 67.46
          },
          {
            name: 'Promotional',
            value: 14.20
          },
          {
            name: 'Program',
            value: 13.91
          },
          {
            name: 'Print',
            value: 4.44
          }
        ]
      },
      {
        title: "Customer Geographic",
        show: true,
        width: {
          responsive: 49,
          normal: 33
        },
        column: 2,
        chartType: 'map',
        datasets: [
          {
            data: [40000, 38000, 36000, 34000, 30000],
            fill: 'start'
          }
        ],
        labels: ['USA', 'Canada', 'Australia', 'New Zealand', 'England'],
        colors: [
          {
            borderColor: 'rgba(0,0,0,0)',
            hoverBackgroundColor: gradient1,
            backgroundColor: gradient1,
          }
        ],
        options  : {
            legend             : {
                display: false
            },
            maintainAspectRatio : false,
            scales             : {
                yAxes: [
                    {
                        display: true,
                        gridLines: {
                            display       : true,
                            drawBorder    : false,
                            tickMarkLength: 18,
                            color: "#2c2c2c"
                        },
                        ticks    : {
                            fontColor: '#ffffff',
                            min: 0,
                            stepSize: 10000,
                            callback: function(value, index, values) {
                                return value/1000 + 'k';
                            }
                        }
                    }
                ],
                xAxes: [
                    {
                        barPercentage: 0.3,
                        gridLines: {
                          display: false,
                        },
                        ticks  : {
                          fontColor: '#ffffff'
                        }
                    }
                ]
            }
        }
      },
      {
        title: "Sales by Representative",
        show: true,
        width: {
          responsive: 49,
          normal: 33
        },
        column: 2,
        chartType: 'horizontalBar',
        datasets: [
          {
            data: [40000, 38000, 36000, 34000, 30000, 28000, 24000, 20000, 19000, 18000, 17000],
          }
        ],
        labels: ['Steve Jenkins', 'Alan Cozza', 'Steph Kimball', 'Jasan Jones', 'Jeremy Hinklel', 'Jody Kimbrell', 'Michelle Stevens', 'Mike Covey', 'Diego Garcia', 'Shelly Smith'],
        colors: [
          {
            borderColor: 'rgba(0,0,0,0)',
            hoverBackgroundColor: gradient1,
            backgroundColor: gradient1,
          }
        ],
        options  : {
            legend             : {
                display: false
            },
            maintainAspectRatio : false,
            scales             : {
                xAxes: [
                    {
                        display: true,
                        gridLines: {
                            display       : false,
                            drawBorder    : false,
                            tickMarkLength: 18
                        },
                        ticks    : {
                            fontColor: '#ffffff',
                            min: 0,
                            stepSize: 10000,
                            callback: function(value, index, values) {
                                return value/1000 + 'k';
                            }
                        }
                    }
                ],
                yAxes: [
                    {
                        barPercentage: 0.7,
                        gridLines: {
                            display: false
                        },
                        ticks  : {
                            min     : 0,
                            stepSize: 200,
                            fontColor: '#ffffff'
                        }
                    }
                ]
            }
        }
      },
      {
        title: "Inbound Leads",
        show: true,
        showNumber: true,
        width: {
          responsive: 49,
          normal: 33
        },
        column: 3,
        align: "start center",
        value: 371,
        income :{
          value: 39
        },
        chartType: 'line',
        datasets : [
            {
                label: 'Sales',
                data : [53, 390, 374, 247 ,408, 500, 510, 558, 571],
                borderWidth: 1,
                fill : 'start'
            }
        ],
        labels   : ['May 1', 'May 2', 'May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9'],
        colors   : [
            {
                borderColor              : '#00f362',
                backgroundColor          : gradient2,
                pointBackgroundColor     : '#fff',
                pointHoverBackgroundColor: '#fff',
                pointBorderColor         : '#00f362',
                pointHoverBorderColor    : '#00f362'
            }
        ],
        options  : {
            spanGaps           : false,
            legend             : {
                display: false
            },
            maintainAspectRatio: false,
            elements           : {
                point: {
                    radius          : 4,
                    borderWidth     : 2,
                    hoverRadius     : 4,
                    hoverBorderWidth: 2
                },
                line : {
                    tension: 0
                }
            },
            scales             : {
                xAxes: [
                    {
                        gridLines: {
                            display       : false,
                            drawBorder    : false,
                            tickMarkLength: 18
                        },
                        ticks    : {
                            fontColor: '#ffffff'
                        }
                    }
                ],
                yAxes: [
                    {
                        gridLines: {
                            display: true,
                            color: "#2c2c2c"
                        },
                        ticks  : {
                            min     : 0,
                            stepSize: 200,
                            fontColor: '#ffffff'
                        }
                    }
                ]
            },
            plugins            : {
                filler      : {
                    propagate: false
                },
                xLabelsOnTop: {
                    active: true
                }
            }
        }
      },
      {
        title: "Site Visitors Overview",
        show: true,
        width: {
          responsive: 49,
          normal: 33
        },
        column: 3,
        chartType: 'line',
        chartId: 'chart_site_visitors_overview',
        showNumber: true,
        datasets : [
            {
                label: 'Unique Visitors',
                data : [530, 3900, 7374, 2247 , 4408, 5000, 2510, 3558, 9571],
                borderWidth: 2,
                borderColor: '#036fd1',
                fill : true
            },
            {
                label: 'Site Visitors',
                data : [9571, 530, 3900, 7374, 2247 , 4408, 5000, 2510, 3558],
                borderColor: '#08acdd',
                borderWidth: 2,
                fill : true
            },
            {
                label: 'Page Views',
                data : [3558, 9571, 530, 3900, 7374, 2247 , 4408, 5000, 2510],
                borderColor: '#1feb73',
                borderWidth: 2,
                fill : true
            }
        ],
        labels   : ['May 1', 'May 2', 'May 3', 'May 4', 'May 5', 'May 6', 'May 7', 'May 8', 'May 9'],
        colors   : [
            {
              borderColor              : '#036fd1',
              backgroundColor          : gradient3
            },
            {
              borderColor              : '#08acdd',
              backgroundColor          : 'rgba(8,172,221, 0.4)'
            },
            {
              borderColor              : '#1feb73',
              backgroundColor          : 'rgba(31,235,115, 0.4)'
            }
        ],
        options  : {
            spanGaps           : false,
            legend: false,
            legendCallback: function(chart) {
              var text = [];
              text.push('<ul id="' + chart.id + '-legend">');
              for (var i = 0; i < chart.data.datasets.length; i++) {
                text.push('<li><span style="background-color:' + chart.data.datasets[i].borderColor + '"></span>');
                text.push(chart.data.datasets[i].label);
                text.push('</li>');
              }
              text.push('</ul>');
              return text.join("");
            },
            tooltips: {
              mode: 'index',
              enabled: true,
              intersect: false
            },
            maintainAspectRatio: false,
            elements           : {
                point: {
                    radius          : 0,
                    borderWidth     : 0,
                    hoverRadius     : 0,
                    hoverBorderWidth: 0
                },
                line : {
                    tension: 0
                }
            },
            scales             : {
                xAxes: [
                    {
                        gridLines: {
                            display       : false,
                            drawBorder    : false,
                            tickMarkLength: 18
                        },
                        ticks    : {
                            fontColor: '#ffffff'
                        }
                    }
                ],
                yAxes: [
                    {
                        gridLines: {
                            display: true,
                            color: "#2c2c2c"
                        },
                        ticks  : {
                            min     : 0,
                            stepSize: 2000,
                            fontColor: '#ffffff',
                            callback: function(value, index, values) {
                                return value/1000 + 'k';
                            }
                        }
                    }
                ]
            },
            plugins            : {
                filler      : {
                    propagate: false
                },
                xLabelsOnTop: {
                    active: true
                }
            }
        }
      },
      {
        title: "Revenue by Type",
        show: true,
        width: {
          responsive: 49,
          normal: 33
        },
        column: 3,
        view : [400, 350],
        chartType: 'pie',
        legend: true,
        legendTitle: '',
        explodeSlices: false,
        labels: true,
        arcWidth: 0.4,
        doughnut: false,
        gradient: false,
        scheme: {
          domain: ['#2ad4f3', '#00c5c9', '#15db86', '#00f362']
        },
        onSelect: (ev) => {
          console.log(ev);
        },
        labelFormatting : () => {

        },
        datas: [
          {
            name: 'Embroidery',
            value: 600
          },
          {
            name: 'Screenprint',
            value: 400
          },
          {
            name: 'Heat Press',
            value: 200
          },
          {
            name: 'Etching',
            value: 300
          }
        ]
      }
    ];

    if(this.charts_config){
      for(let item of this.charts_config)
        dashlets.find(dashlet => dashlet.title == item.name)['show'] = item.show;
    }

    let column1 = [], column2 = [], column3 = [];
    for(let dashlet of dashlets){

      switch(dashlet.column){
        case 1:
          column1.push(dashlet);
          continue;
        case 2:
          column2.push(dashlet);
          continue;
        case 3:
          column2.push(dashlet);
          continue;
        default:
          continue;
      }
    }

    if(column1.length)
      this.dashlets.push(column1);

    if(column2.length)
      this.dashlets.push(column2);

    if(column3.length)
      this.dashlets.push(column3);

    setTimeout(() => {
      this.baseCharts.forEach(baseChart => {
        console.log(baseChart);
        if(baseChart.element.nativeElement.id.indexOf("chart") != -1){
          document.getElementById(baseChart.element.nativeElement.id+"-legend").innerHTML = baseChart.chart.generateLegend();
          baseChart.chart.update();
        }
      });
    }, 100);
  }

}
