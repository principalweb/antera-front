export const tableLayouts = {
    order: {
        hLineWidth: function (i, node) {
            return (i === node.table.headerRows) ? 2 : 1;
        },
        vLineWidth: function (i, node) {
            return 1;
        },
        hLineColor: function (i, node) {
            return '#EFEFEF';
        },
        vLineColor: function (i, node) {
            return '#EFEFEF';
        },
        paddingLeft: function (i) {
            return 8;
        },
        paddingRight: function (i, node) {
            // return (i === node.table.widths.length - 1) ? 0 : 8;
            return 8;
        }
    },
    gridOrder: {
        hLineWidth: function (i, node) {
            return (i === node.table.headerRows) ? 2 : 1;
        },
        vLineWidth: function (i, node) {
            return 1;
        },
        hLineColor: function (i, node) {
            return '#d1d1d1';
        },
        vLineColor: function (i, node) {
            return '#d1d1d1';
        },
        paddingLeft: function (i) {
            return 8;
        },
        paddingRight: function (i, node) {
            // return (i === node.table.widths.length - 1) ? 0 : 8;
            return 8;
        }
    },
    gridSize: {
        hLineWidth: function (i, node) {
            return (i === node.table.headerRows) ? 2 : 1;
        },
        vLineWidth: function (i, node) {
            return 1;
        },
        hLineColor: function (i, node) {
            return '#d1d1d1';
        },
        vLineColor: function (i, node) {
            return '#d1d1d1';
        },
        paddingLeft: function (i) {
            return 2;
        },
        paddingRight: function (i, node) {
            // return (i === node.table.widths.length - 1) ? 0 : 8;
            return 2;
        }
    }
};