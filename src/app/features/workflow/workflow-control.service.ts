import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject ,  Subject } from 'rxjs';
import { AuthService } from 'app/core/services/auth.service';

@Injectable()
export class WorkflowControlService
{
  allWorkflows: any[] = [];
  showWorkflows: any[] = [];
  filter: any;
  payload: {}; 
  total: number;
  params: any;

  public events: any;
  public processCates: any;
  public processTypes: any;
  public filterTerm = new Subject<any>();
  public filteredWorkflows: BehaviorSubject<any> = new BehaviorSubject([]);
  public onColumnsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  public onEventsChanged: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient, private auth: AuthService){
      this.payload = {limit:100, offset:0};
  }

    readWorkFlows(params = null){
        this.getWorkflowEvents();
        this.getWorkflowColumns();
        this.getWorkflows(params);
    }

    searchWorkflows(params = null) {
        this.getWorkflows(params);
    }

  /**
    Returns a process based on its ID
  **/
  eventHelper(id){
    console.log(id);
    return this.events.find(ev => ev.id == id);
  }

  filterProcesses(col){
    let filterlist = [];
    for(let workflow of this.showWorkflows){
      let wid = this.eventHelper(workflow[col]);
      if(filterlist.indexOf(wid) > -1)
        continue;

      filterlist.push(wid);
    }
    return filterlist;
  }

  applyFilter(res = null){
    if(res){
      // this.filter[res[0]][res[1]] != this.filter[res[0]][res[1]];
      // console.log(this.filter[res[0]][res[1]]);
    }
    this.showWorkflows = [];
    for(let workflow of this.allWorkflows){
      let f =  false;
      for(let cate of this.processCates){
        let id = workflow[cate.name];
        if(!this.filter[cate.name][id]){
          f = true;
          break;
        }
      }

      if(!f)
        this.showWorkflows.push(workflow);
    }
    this.filteredWorkflows.next(this.showWorkflows);
  }

  changeEvent(coliId, stageId, eventId){
      console.log(coliId, stageId, eventId);
  }

  getWorkflows(params = null): Promise<any> {
    params = (params ? params : this.payload);
    this.params = params;
    this.params.permUserId = this.auth.getCurrentUser().userId;
    return new Promise(
      (resolve, reject) => {
        this.http.post('/protected/content/workflow-list', params)
          .subscribe((response: any) => {
            this.filteredWorkflows.next(response);
            resolve(response);
          }, reject);
      }
    );
  }

  getWorkflowColumns(): Promise<any> {
      return new Promise(
        (resolve, reject) => {
            this.http.get('protected/content/workflow-columns')
                .subscribe((response: any) => {
                    this.onColumnsChanged.next(response);
                    resolve(response);
          }, reject);
      }
    );
  }

  getWorkflowEvents(): Promise<any> {
      return new Promise(
        (resolve, reject) => {
            this.http.get('protected/content/workflow-events')
                .subscribe((response: any) => {
                    this.events = response;
                    this.onEventsChanged.next(response);
                    resolve(response);
                },reject);
        }
      );
  }

  updateWorkflowEvent(orderId, vendorId, stageId, eventId) {
    var data = {
      vendorId: vendorId,
      orderId: orderId,
      stageId: stageId,
      eventId: eventId
    };

    this.http.post('protected/content/update-step-record', data)
        .subscribe((response: any) => {
           // console.log(response);
         });
  }
}
