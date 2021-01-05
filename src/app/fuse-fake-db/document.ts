export class DocumentFakeDb
{
    public static invoice = {
        'from'    : {
            'title'  : 'KSoft Resources',
            'address': '9301 Wood Street Philadelphia, PA 19111',
            'phone'  : '+55 552 455 87',
            'email'  : 'johndoe@mail.com'
        },
        'client'  : {
            'title'  : 'John Doe',
            'address': '9301 Wood Street Philadelphia, PA 19111',
            'phone'  : '+55 552 455 87',
            'email'  : 'johndoe@mail.com'
        },

        'number'            : 'P9-0004',
        'date'              : 'Jul 19, 2018',
        'dueDate'           : 'Aug 24, 2018',
        'orderDate'         : 'Jul 19, 2018',
        'inHandsDate'       : 'Aug 24, 2018',
        'shipVia'           : 'UPS',
        'shipDate'          : 'Aug 24, 2018',
        'customerPo'        : '1234',
        'paymentTerms'      : '30',
        'creditTerms'       : '3',
        'salesPersonPhone'  : '+55 552 455 87',
        'salesPersonEmail'  : 'johndoe@mail.com',
        'csrName'           : 'CSR Test',
        'csrPhone'          : '+55 552 455 87',
        'csrEmail'          : 'johndoe@mail.com',
        'salesPersonName'   : 'Antera Test',
        'products': [
            {
                'itemNumber': 'ELWI-12',
                'title'     : 'Prototype & Design',
                'detail'    : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus accumsan, quam sed eleifend imperdiet.',
                'unit'      : 'Hour',
                'unitPrice' : '12.00',
                'quantity'  : '240',
                'total'     : '2880',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/purple-polo.gif',
                        'type': 'image'
                    }]
            },
            {
                'itemNumber': 'K2S011',
                'title'     : 'Coding',
                'detail'    : 'Vestibulum ligula sem, rutrum et libero id, porta vehicula metus. Cras dapibus neque sit amet laoreet vestibulum.',
                'unit'      : 'Hour',
                'unitPrice' : '10.50',
                'quantity'  : '350',
                'total'     : '3675',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/grey-jacket.jpg',
                        'type': 'image'
                    }]
            },
            {
                'itemNumber': 'FANE9-HT',
                'title'     : 'Testing',
                'detail'    : 'Pellentesque luctus efficitur neque in finibus. Integer ut nunc in augue maximus porttitor id id nulla. In vitae erat.',
                'unit'      : 'Hour',
                'unitPrice' : '4.00',
                'quantity'  : '50',
                'total'     : '200',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/white-polo.jpg',
                        'type': 'image'
                    }]
            },
            {
                'itemNumber': 'R2D245',
                'title'     : 'Documentation & Training',
                'detail'    : 'Pellentesque luctus efficitur neque in finibus. Integer ut nunc in augue maximus porttitor id id nulla. In vitae erat.',
                'unit'      : 'Hour',
                'unitPrice' : '6.50',
                'quantity'  : '260',
                'total'     : '1690',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/bright-pink-shirt.jpg',
                        'type': 'image'
                    }]
            }
        ],
        'subtotal': '8445',
        'tax'     : '675.60',
        'discount': '120.60',
        'total'   : '9000'
    };
    public static order_confirmation = {
        'from'    : {
            'title'  : 'Antera Test',
            'address': '9301 Wood Street Philadelphia, PA 19111',
            'phone'  : '+55 552 455 87',
            'email'  : 'johndoe@mail.com'
        },
        'client'  : {
            'title'  : 'John Doe',
            'address': '9301 Wood Street Philadelphia, PA 19111',
            'phone'  : '+55 552 455 87',
            'email'  : 'johndoe@mail.com'
        },

        'number'            : 'P9-0004',
        'date'              : 'Jul 19, 2018',
        'dueDate'           : 'Aug 24, 2018',
        'orderDate'         : 'Jul 19, 2018',
        'inHandsDate'       : 'Aug 24, 2018',
        'shipVia'           : 'UPS',
        'shipDate'          : 'Aug 24, 2018',
        'customerPo'        : '1234',
        'paymentTerms'      : '30',
        'creditTerms'       : '3',
        'salesPersonPhone'  : '+55 552 455 87',
        'salesPersonEmail'  : 'johndoe@mail.com',
        'csrName'           : 'CSR Test',
        'csrPhone'          : '+55 552 455 87',
        'csrEmail'          : 'johndoe@mail.com',
        'salesPersonName'   : 'Antera Test',
        'products': [
            {
                'itemNumber': 'ELWI-12',
                'title'     : 'Prototype & Design',
                'detail'    : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus accumsan, quam sed eleifend imperdiet.',
                'unit'      : 'Hour',
                'unitPrice' : '12.00',
                'quantity'  : '240',
                'total'     : '2880',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/purple-polo.gif',
                        'type': 'image'
                    }]
            },
            {
                'itemNumber': 'K2S011',
                'title'     : 'Coding',
                'detail'    : 'Vestibulum ligula sem, rutrum et libero id, porta vehicula metus. Cras dapibus neque sit amet laoreet vestibulum.',
                'unit'      : 'Hour',
                'unitPrice' : '10.50',
                'quantity'  : '350',
                'total'     : '3675',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/grey-jacket.jpg',
                        'type': 'image'
                    }]
            },
            {
                'itemNumber': 'FANE9-HT',
                'title'     : 'Testing',
                'detail'    : 'Pellentesque luctus efficitur neque in finibus. Integer ut nunc in augue maximus porttitor id id nulla. In vitae erat.',
                'unit'      : 'Hour',
                'unitPrice' : '4.00',
                'quantity'  : '50',
                'total'     : '200',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/white-polo.jpg',
                        'type': 'image'
                    }]
            },
            {
                'itemNumber': 'R2D245',
                'title'     : 'Documentation & Training',
                'detail'    : 'Pellentesque luctus efficitur neque in finibus. Integer ut nunc in augue maximus porttitor id id nulla. In vitae erat.',
                'unit'      : 'Hour',
                'unitPrice' : '6.50',
                'quantity'  : '260',
                'total'     : '1690',
                'images'    : [
                    {
                        'id'  : 1,
                        'url' : 'assets/images/ecommerce/bright-pink-shirt.jpg',
                        'type': 'image'
                    }]
            }
        ],
        'subtotal': '8445',
        'tax'     : '675.60',
        'discount': '120.60',
        'total'   : '9000'
    };
}
