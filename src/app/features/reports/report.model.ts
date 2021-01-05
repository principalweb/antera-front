import { FuseUtils } from '@fuse/utils';

export class Report
{
    id: string;
    value: string;
    department: string;
//    departmentName: string;
    query: string;
    reportName: string;
    reportLabel: string;
    description: string;
    dateCreated: string;
    createdBy: string;
    filters: any;
    fields: any;
    orderBy: any;
    sort: any;
    header: any;
    timeinterval: any;
    enabled : boolean;
    data: any;

    constructor(report) {
        {
            this.id = report.id || '';
            //this.id = report.id || FuseUtils.generateGUID();
            if (report.reportName) {
                this.reportName = report.reportName;
            }
            if (report.header) {
                this.reportName = report.header.reportName || '';
            }
            this.reportLabel = report.reportLabel || '';
            this.description = report.description || '';
            this.value = report.value || '';
            this.query = report.query || '';
            this.department = report.department || '';
            //this.departmentName = report.departmentName || '';
            this.orderBy = report.orderBy || '';
            this.sort = report.sort || '';
            this.timeinterval = report.timeinterval || '';
            this.enabled = report.enabled || false;
            this.dateCreated = report.dateCreated || '';
            this.createdBy = report.createdBy || '';
            this.filters = report.filters || [];
            this.fields = report.fields || [];
            this.data = report.data || [];
            this.header = report.header;
        }
    }
}
