export class ContactUtils
{
    public static checkEmpty(obj)
    {
        if (!obj) return true;
        return Object.keys(obj).reduce( (a,k) => a && obj[k].length === 0, true)
    }

    public static resetValues(obj){

        Object.keys(obj).forEach(k => obj[k] = obj[k] !== '' ? '' : obj[k])
        return obj;
    }
}
