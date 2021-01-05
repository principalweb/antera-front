import { find, values, map } from 'lodash';
import { Observable, Subject } from 'rxjs';

export const displayName = (val: any) => {
    if (!val) {
        return '';
    } else if (typeof val === 'string') {
        return val;
    }

    return val.name;
}

export const priorityValue = p => p ? p.value : '';

export const groupLineItems = lineItems => {
    const newLineItems = [];

    lineItems.forEach(li => {
        const item = find(newLineItems, {
            productId: li.productId
        });

        if (item) {
            li.matrixRows.forEach(r => {
                const row = find(item.matrixRows, { size: r.size, color: r.color });
                if (row) {
                    row.quantity += r.quantity;
                } else {
                    row.matrixRows.push(r);
                }
            });
        } else {
            newLineItems.push(li);
        }
    });

    return newLineItems;
}

export const chain = (obArr: Observable<any>[], shouldContinueOnFail = true) => {
    const trigger = new Subject();
    const finished = new Subject();
    const result = [];
    const failed = [];
    let curReq = null;

    trigger.subscribe((i: number) => {
        if (obArr[i]) {
            curReq = obArr[i].subscribe(
                res => {
                    result.push(res);
                    trigger.next(i + 1);
                },
                err => {
                    failed.push(i);
                    if (shouldContinueOnFail) {
                        trigger.next(i + 1);
                    } else {
                        finished.error({
                            err,
                            index: i,
                            result
                        })
                    }
                }
            );
        } else {
            finished.next({
                result,
                failed
            });
        }
    });

    if (obArr.length > 0) {
        trigger.next(0);
    } else {
        finished.next({
            result,
            failed
        });
    }

    return {
        finished,
        trigger,
        cancel: () => {
            if (curReq) {
                curReq.unsubscribe();
            }
            trigger.unsubscribe();
        }
    };
}

export const plural = (word, count, pluralWord = '') => {
    const w = count > 1 ? (
        pluralWord ? pluralWord : word + 's'
    ) : word;

    return count + ' ' + w;
};

export const numberWithCommas = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


export const fobCity = (fob) =>
    fob.fobState ? `${fob.fobCity}, ${fob.fobState}` : fob.fobCity;

export const numValues = (obj) =>
    map(values(obj), v => Number(v));

export const markup = (totalPrice: number, totalCost: number): String => {
    if (totalCost === 0) return (0).toString();
    let markup = (totalPrice - totalCost) * 100 / totalCost;
    return markup.toString();
}

export const calculateMargin = (totalPrice: number, totalCost: number, adminCost: number): String => {
    if (typeof totalPrice != 'number') totalPrice = parseFloat(totalPrice);
    if (typeof totalCost != 'number') totalCost = parseFloat(totalCost);
    if (adminCost) totalCost = adminCost;
    if (totalPrice === 0) return (0).toString();
    let margin = (totalPrice - totalCost) * 100 / totalPrice;
    return margin.toString();
}

export const calculateUnitCost = (unitPrice: number, unitCost: number,  adminFeeRate: number): String => {
    if (typeof unitPrice != 'number') unitPrice = parseFloat(unitPrice);
    if (typeof unitCost != 'number') unitCost = parseFloat(unitCost);
    if (typeof adminFeeRate != 'number') adminFeeRate = parseFloat(adminFeeRate);
   return  (unitCost + (unitPrice * (adminFeeRate / 100))).toFixed(2);
}