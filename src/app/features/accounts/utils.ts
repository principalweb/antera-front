import { timezonesOLD } from './constants';

export const getTimezones = () => {
    const list = [];

    timezonesOLD.forEach(tz => {
        tz.utc.forEach(label => {
            let displayValue = '';

            if (tz.offset > 0) {
                displayValue = `${label} (UTC+${tz.offset})`;
            } else if (tz.offset < 0) {
                displayValue = `${label} (UTC${tz.offset})`;
            } else {
                displayValue = `${label} (UTC)`;
            }

            list.push({
                value: label,
                label: displayValue
            });
        })
    })

    return list;
}

export const getSearchTerm = (fields, filter) => {
    const rst = {};

    for (let f of fields) {
        rst[f] = filter;
    }

    return rst;
}

/*
* Filter wrote by Olena
*/ 
export const getFiltersTerm = (fields, filters) => {
    const rst = {};

    for (let _i = 0; _i < fields.length; _i++) {
        rst[fields[_i]] = filters[_i];
    }

    return rst;
}
