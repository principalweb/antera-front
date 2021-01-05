export const displayName = (val: any) => {
    if (!val) {
        return '';
    } else if (typeof val === 'string') {
        return val;
    }

    return val.name;
}

export const priorityValue = p => p ? p.value : '';
