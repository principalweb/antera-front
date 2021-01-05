import { BaseModel } from './base-model';

export class ProductionHistory extends BaseModel
{
    jobStatus: string;
    timerState: string;
    time: Date;
    reason: string;
    elapsed: string;

    setData(hist) {
        this.setString(hist, 'jobStatus');
        this.setString(hist, 'timerState');
        this.setDate(hist, 'time');
        this.setString(hist, 'reason');
        this.setString(hist, 'elapsed');
    }
}
