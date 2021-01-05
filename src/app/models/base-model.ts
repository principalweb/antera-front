import * as moment from 'moment';

export class BaseModel {

    constructor(data?) {
        this.setData(data || {});
    }

    setInt(data, field, value = 0) {
        this[field] = parseInt(data[field] || value);
    }
setFloat(data, field, value = 0) {
        this[field] = parseFloat(data[field] || value);
    }

    setBoolean(data, field) {
        this[field] = this.toBoolean(data[field]);
    }

    setEmptyArray(field){
        this[field] = [];
    }

    setString(data, field, _default = '') {
        this[field] = data[field] || _default;
    }

    setDate(data, field) {
        this[field] = this.toDate(data[field]);
    }
    
    // Use for local Date's that do not contain a time component
    setLocalDate(data, field) {
        this[field] = this.toLocalDate(data[field]);
    }

    setArray(data, field, elementType?) {

        const cast = (val) => {
            switch(elementType) {
                case 'integer':
                    return parseInt(val || 0);
                case 'float':
                    return parseFloat(val || 0);
                case 'boolean':
                    return this.toBoolean(val);
                case 'date':
                    return this.toDate(val);
            }

            if (elementType instanceof Function) {
                return elementType(val);
            }

            return val;
        }

        if (data[field] instanceof Array) {
            this[field] = data[field].map(val => cast(val));
        } else {
            this[field] = [];
        }
    }

    toPrice(val) {
        return parseFloat(val.replace(/\$/, ''));
    }

    toBitString(val) {
        return val ? '1' : '0';
    }

    toBoolean(val) {
        switch(val){
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return true;
            default: 
                return false;
        }
    }

    toLocalDate(val) {
        if (!val) {
            return null;
        }
        if (val == '0000-00-00 00:00:00' || val == '0000-00-00') {
            return null;
        }
        return moment(val).toDate();
    }

    toDate(val) {
        if (!val) {
            return moment().utc().local().toDate();
        }
        if (val == '0000-00-00 00:00:00' || val == '0000-00-00') {
            return moment().utc().local().toDate();
        }
        return moment.utc(val).local().toDate();
    }

    toObjValue(val) {
        if (val instanceof BaseModel) {
            return val.toObject();
        } else if (val instanceof Date) {
            return moment(val).format('YYYY-MM-DD hh:mm:ss');
        } else if (val instanceof Array) {
            return val.map(v => this.toObjValue(v));
        } else if (typeof val === 'boolean') {
            return this.toBitString(val);
        } else {
            return val;
        }
    }

    toObject() {
        const keys = Object.keys(this);
        
        const rst = {};
        for (let i=0; i<keys.length; i++) {
            const k = keys[i];
            rst[k] = this.toObjValue(this[k]);
        }

        return rst;
    }

    setData(data) {}

    update(data) {
        const obj = this.toObject();
        this.setData({
            ...obj,
            ...data
        });
    }
    
    setObjectArray(data, field, modelType = null) {
        this[field] = [];
        if (modelType) {
            Object.entries(data).forEach(([key, value]) => {
                this[field].push(new modelType(value));
            });
        } else {
            Object.entries(data).forEach(([key, value]) => {
                this[field][key] = value;
            });
        }
    }

    setObject(data, field, modelType = null) {
        this[field] = {};
        if (modelType) {
            this[field] = new modelType(data);
        } else {
            this[field] = data;
        }
    }
}
