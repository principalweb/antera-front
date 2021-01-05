export const prop = (dict, field, defaultValue?) => {
    return dict[field] ? dict[field] : defaultValue;
}

export const getProductImage = (p: any, color) => {
    if (p.quoteCustomImage) {
        if (color) {
            color = color.replace(/ /g, '').toLowerCase();
            const url = p.quoteCustomImage[0];

            if (!url) return '';

            const i0 = url.indexOf(p.productId + '_');
            const firstPart = url.substr(0, i0 + p.productId.length + 1);
            let lastPart = url.substr(i0 + p.productId.length + 1);
            const i1 = lastPart.indexOf('_');
            lastPart = lastPart.substr(i1);

            return `${firstPart}${color}${lastPart}`;
        }

        return p.quoteCustomImage[0];
    }

    return '';
}

export const formatInteger = (val) => {
    const n = Number(val);
    if (Number.isNaN(n)) {
      return '0';
    }

    let m = Math.floor(Math.abs(n));
    let rst = [];
    while (m > 0) {
      const r = m % 1000;
      rst.unshift(r);
      m = (m - r) / 1000;
    }

    let str = rst.join(',');
    if (n < 0) {
      return '- ' + str;
    }

    return str;
}
