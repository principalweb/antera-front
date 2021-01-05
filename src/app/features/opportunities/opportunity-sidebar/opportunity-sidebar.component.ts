import { Component } from '@angular/core';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
    selector   : 'opportunities-main-sidenav',
    templateUrl: './opportunity-sidebar.component.html',
    styleUrls  : ['./opportunity-sidebar.component.scss']
})
export class OpportunitiesMainSidenavComponent
{
    options = {
        spanGaps           : false,
        legend             : {
            display: false
        },
        maintainAspectRatio: false,
        layout             : {
            padding: {
                top   : 24,
                left  : 16,
                right : 16,
                bottom: 16
            }
        },
        scales             : {
            xAxes: [
                {
                    display: false,
                    ticks  : {
                        min: 0,
                        max: 100
                    }
                }
            ],
            yAxes: [
                {
                    display: false,
                    // gridLines: {
                    //     drawTicks: false,
                    //     drawOnChartArea: false,
                    //     drawBorder: false,
                    // },
                    // scaleLabel: {
                    //     padding: 10
                    // }
                }
            ]
        },
        tooltips: {
            enabled: true
        },
        plugins: {
            datalabels: {
                color: '#333',
                display: true,
                font: {
                  weight: 'bold'
                },
                formatter: (v) => v + 'k',
                align: 'right',
                anchor: 'end',
                offset: 4
            }
        }
    };
    colors = [{
        borderColor    : '#41a6f5',
        backgroundColor: '#41a6f5'
    }];

    opportunities = [
        {
            label: 'Opportunities',
            data: [38]
        }
    ];

    sales = [
        {
            label: 'Sales',
            data : [24, 56, 75]
        }
    ];

    scheme = {
        domain: ['#d50000', '#00c853']
    };
    credits = [{
        "name": "Used",
        "value": 24
    },
    {
        "name": "Available",
        "value": 76
    }];

    constructor()
    {
    }

    ngOnInit() {
                // TODO ChartLabels changed to ChartDataLabels 
        // there is an unregister option - not sure if that was used or not previously
        // 
        // This plugin registers itself globally, meaning that once imported, all charts will display labels. In case you want it enabled only for a few charts, you first need to unregister it globally:

        // NOTE: when imported as a <script> tag, use the global property 'ChartDataLabels'
        // Chart.plugins.unregister(ChartDataLabels);
        // Then, you can enabled the plugin only for specific charts:

        // var chart = new Chart(ctx, {
        //     plugins: [ChartDataLabels],
        //     options: {
        //         // ...
        //     }
        // })
        Chart.plugins.register(ChartDataLabels);
    }
}
