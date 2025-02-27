export class ECommerceFakeDb
{
    public static dashboard = {
        'widget1': {
            'ranges'      : {
                'DY' : 'Yesterday',
                'DT' : 'Today',
                'DTM': 'Tomorrow'
            },
            'currentRange': 'DT',
            'data'        : {
                'label': 'CONVERSION RATE',
                'count': {
                    'DY' : 21,
                    'DT' : 25,
                    'DTM': 19
                },
                'extra': {
                    'label': 'Abandoned carts',
                    'count': {
                        'DY' : 3,
                        'DT' : 7,
                        'DTM': 8
                    }
                }
            },
            'detail'      : 'You can show some detailed information about this widget in here.'
        },
        'widget2': {
            'title' : 'Average Order Value',
            'data'  : {
                'label': '30 DAYS',
                'count': 21,
                'extra': {
                    'label': 'Last year same time',
                    'count': 14
                }
            },
            'detail': 'You can show some detailed information about this widget in here.'
        },
        'widget3': {
            'title' : 'Online Visitors',
            'data'  : {
                'label': 'last 30 minutes',
                'count': 32,
                'extra': {
                    'label': 'Total visitors today',
                    'count': 998
                }
            },
            'detail': 'You can show some detailed information about this widget in here.'
        },
        'widget4': {
            'title' : 'Profit per Visitor',
            'data'  : {
                'label': 'TODAY',
                'count': '3,7',
                'extra': {
                    'label': 'Yesterday',
                    'count': '2,90'
                }
            },
            'detail': 'You can show some detailed information about this widget in here.'
        },
        'widget5': {
            'title'    : 'Sales',
            'ranges'   : {
                'TW': 'This Week',
                'LW': 'Last Week',
                '2W': '2 Weeks Ago'
            },
            'mainChart': {
                '2W': [
                    {
                        'name'  : 'Mon',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 9
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 37
                            }
                        ]
                    },
                    {
                        'name'  : 'Tue',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 12
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 32
                            }
                        ]
                    },
                    {
                        'name'  : 'Wed',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 9
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 39
                            }
                        ]
                    },
                    {
                        'name'  : 'Thu',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 12
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 27
                            }
                        ]
                    },
                    {
                        'name'  : 'Fri',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 7
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 18
                            }
                        ]
                    },
                    {
                        'name'  : 'Sat',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 8
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 24
                            }
                        ]
                    },
                    {
                        'name'  : 'Sun',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 16
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 20
                            }
                        ]
                    }
                ],
                'LW': [
                    {
                        'name'  : 'Mon',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 12
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 37
                            }
                        ]
                    },
                    {
                        'name'  : 'Tue',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 8
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 24
                            }
                        ]
                    },
                    {
                        'name'  : 'Wed',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 7
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 51
                            }
                        ]
                    },
                    {
                        'name'  : 'Thu',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 13
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 31
                            }
                        ]
                    },
                    {
                        'name'  : 'Fri',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 7
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 29
                            }
                        ]
                    },
                    {
                        'name'  : 'Sat',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 6
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 17
                            }
                        ]
                    },
                    {
                        'name'  : 'Sun',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 10
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 31
                            }
                        ]
                    }
                ],
                'TW': [
                    {
                        'name'  : 'Mon',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 11
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 42
                            }
                        ]
                    },
                    {
                        'name'  : 'Tue',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 10
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 28
                            }
                        ]
                    },
                    {
                        'name'  : 'Wed',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 8
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 43
                            }
                        ]
                    },
                    {
                        'name'  : 'Thu',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 11
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 34
                            }
                        ]
                    },
                    {
                        'name'  : 'Fri',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 8
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 20
                            }
                        ]
                    },
                    {
                        'name'  : 'Sat',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 10
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 25
                            }
                        ]
                    },
                    {
                        'name'  : 'Sun',
                        'series': [
                            {
                                'name' : 'Sales',
                                'value': 17
                            },
                            {
                                'name' : 'Abandoned Carts',
                                'value': 22
                            }
                        ]
                    }
                ]
            }
        },
        'widget6': {
            'title'      : 'Top 5 Categories',
            'ranges'     : {
                'TW': 'This Week',
                'LW': 'Last Week',
                '2W': '2 Weeks Ago'
            },
            'mainChart'  : {
                '2W': [
                    {
                        'name' : 'Women Dresses',
                        'value': 18
                    },
                    {
                        'name' : 'Men Shoes',
                        'value': 12
                    },
                    {
                        'name' : 'Women Shoes',
                        'value': 40
                    },
                    {
                        'name' : 'Women Bags',
                        'value': 20
                    },
                    {
                        'name' : 'Men T-Shirts',
                        'value': 10
                    }
                ],
                'LW': [
                    {
                        'name' : 'Women Dresses',
                        'value': 17
                    },
                    {
                        'name' : 'Men Shoes',
                        'value': 14
                    },
                    {
                        'name' : 'Women Shoes',
                        'value': 36
                    },
                    {
                        'name' : 'Women Bags',
                        'value': 23
                    },
                    {
                        'name' : 'Men T-Shirts',
                        'value': 12
                    }
                ],
                'TW': [
                    {
                        'name' : 'Women Dresses',
                        'value': 13
                    },
                    {
                        'name' : 'Men Shoes',
                        'value': 16
                    },
                    {
                        'name' : 'Women Shoes',
                        'value': 34
                    },
                    {
                        'name' : 'Women Bags',
                        'value': 23
                    },
                    {
                        'name' : 'Men T-Shirts',
                        'value': 14
                    }
                ]
            },
            'footerLeft' : {
                'title': 'Total Sales',
                'count': {
                    '2W': 487,
                    'LW': 526,
                    'TW': 594
                }
            },
            'footerRight': {
                'title': 'Sales From Top 5 Categories',
                'count': {
                    '2W': 193,
                    'LW': 260,
                    'TW': 287
                }
            }
        },
        'widget7': {
            'title'    : 'Latest Customers',
            'ranges'   : {
                'T' : 'Today',
                'TM': 'Tomorrow'
            },
            'customers': {
                'T' : [
                    {
                        'name'    : 'Abbott Keitch',
                        'location': 'United States of America'
                    },
                    {
                        'name'    : 'Arnold Matlock',
                        'location': 'United States of America'
                    },
                    {
                        'name'    : 'Barrera Bradbury',
                        'location': 'England'
                    },
                    {
                        'name'    : 'Blair Strangeway',
                        'location': 'Germany'
                    },
                    {
                        'name'    : 'Copeland Redcliff',
                        'location': 'French'
                    },
                    {
                        'name'    : 'Henderson Cambias',
                        'location': 'Russia'
                    },
                    {
                        'name'    : 'Lily Peasegood',
                        'location': 'Mexico'
                    }
                ],
                'TM': [
                    {
                        'name'    : 'Boyle Winters',
                        'location': 'United States of America'
                    },
                    {
                        'name'    : 'Tyson Marshall',
                        'location': 'United States of America'
                    },
                    {
                        'name'    : 'Reyna Preece',
                        'location': 'England'
                    },
                    {
                        'name'    : 'Shauna Atherton',
                        'location': 'Germany'
                    },
                    {
                        'name'    : 'Tillman Lee',
                        'location': 'French'
                    },
                    {
                        'name'    : 'Velazquez Smethley',
                        'location': 'Russia'
                    },
                    {
                        'name'    : 'Helen Sheridan',
                        'location': 'Mexico'
                    }
                ]
            }
        }
    };

    public static products = [
        {
            'itemNumber': 'ELWI-12',
            'id': '1',
            'name'            : 'Red Coat',
            'handle'          : 'printed-dress',
            'description'     : 'Officia amet eiusmod eu sunt tempor voluptate laboris velit nisi amet enim proident et. Consequat laborum non eiusmod cillum eu exercitation. Qui adipisicing est fugiat eiusmod esse. Sint aliqua cupidatat pariatur mollit ad est proident reprehenderit. Eiusmod adipisicing laborum incididunt sit aliqua ullamco.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
            {
                    'id'  : 1,
                    'url' : 'assets/images/etc/red-coat.jpg',
                    'type': 'image'
                }],
            'priceTaxExcl'    : 9.309,
            'priceTaxIncl'    : 10.24,
            'taxRate'         : 10,
            'comparedPrice'   : 19.90,
            'quantity'        : 3,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'
        },
        {
            'itemNumber': 'K2S011',
            'id': 'K2S011',
            'name'            : 'Blue Polo',
            'handle'          : 'blue-shirt',
            'description'     : 'Duis anim est non exercitation consequat. Ullamco ut ipsum dolore est elit est ea elit ad fugiat exercitation. Adipisicing eu ad sit culpa sint. Minim irure Lorem eiusmod minim nisi sit est consectetur.',
            'categories'      : [
                'Skirts',
                'Women'
            ],
            'tags'            : [
                'shirt',
                'blue'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/etc/blue-polo.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 22.381,
            'priceTaxIncl'    : 24.62,
            'taxRate'         : 10,
            'comparedPrice'   : 29.90,
            'quantity'        : 92,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'
        },
        {
            'itemNumber': 'FANE9-HT',
            'id': 'FANE9-HT',
            'name'            : 'Pink Shirt',
            'handle'          : 'pink-shirt',
            'description'     : 'Sit ipsum esse eu consequat veniam sit consectetur consectetur anim. Ut Lorem dolor ullamco do. Laboris excepteur consectetur tempor nisi commodo amet deserunt duis.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/etc/pink-shirt.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 44.809,
            'priceTaxIncl'    : 49.29,
            'taxRate'         : 10,
            'comparedPrice'   : 59.90,
            'quantity'        : 60,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'R2D245',
            'id': 'R2D245',
            'name'            : 'Red T-Shirt',
            'handle'          : 'white-t-shirt',
            'description'     : 'Incididunt nostrud culpa labore nostrud veniam nostrud dolore velit sunt laborum ad reprehenderit. Excepteur enim irure ut labore elit ut deserunt qui qui consequat quis do nostrud ad. Aliqua dolor labore ut occaecat laborum irure. Aute in deserunt do aute laborum sit et reprehenderit minim voluptate proident do est.',
            'categories'      : [
                'T-Shirts',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/etc/red-shirt.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 62.827,
            'priceTaxIncl'    : 69.11,
            'taxRate'         : 10,
            'comparedPrice'   : 79.90,
            'quantity'        : 101,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : false,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'B21042',
            'id': 'B21042',
            'name'            : 'Black Coat',
            'handle'          : 'red-hoodie',
            'description'     : 'Laboris laborum minim qui reprehenderit duis fugiat ea anim labore incididunt duis. Officia adipisicing anim amet in sit aliqua fugiat quis do sint non velit eu. Labore occaecat labore elit voluptate Lorem adipisicing et ipsum id et reprehenderit ullamco. Elit in nulla laborum nulla quis dolor deserunt magna dolor ad anim magna. Esse aute reprehenderit anim sit est et quis est. Ex reprehenderit culpa deserunt qui sint eiusmod reprehenderit ipsum consequat ut.',
            'categories'      : [
                'Hoodies',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/etc/black-coat.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 9.309,
            'priceTaxIncl'    : 10.24,
            'taxRate'         : 10,
            'comparedPrice'   : 19.90,
            'quantity'        : 19,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'AZI302',
            'id': 'AZI302',
            'name'            : 'Green Shirt',
            'handle'          : 'red-hoodie',
            'description'     : 'Tempor sunt tempor veniam non culpa excepteur. Ea irure elit non cupidatat cillum dolore. Sit incididunt qui dolore ipsum commodo aliqua amet cupidatat incididunt nisi qui consectetur. Cillum eu aute qui irure aute adipisicing cupidatat magna.',
            'categories'      : [
                'Hoodies',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/green-shirt.gif',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 53.963,
            'priceTaxIncl'    : 59.36,
            'taxRate'         : 10,
            'comparedPrice'   : 69.90,
            'quantity'        : 101,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'


        },
        {
            'itemNumber': 'A45002',
            'id': 'A45002',
            'name'            : 'Bright Pink Shirt',
            'handle'          : 'summer-dress',
            'description'     : 'Excepteur commodo ipsum in ex esse elit ea id voluptate id occaecat. Sunt Lorem ipsum ut proident eu aliquip velit non minim. Sunt velit deserunt veniam eu non veniam. Eiusmod sit ex et id incididunt labore aliqua eu aute dolor cillum ex mollit mollit. Incididunt voluptate adipisicing eiusmod non ipsum cupidatat excepteur enim in pariatur eu. Labore dolor qui exercitation amet labore laboris Lorem do adipisicing. Minim non consectetur adipisicing esse ut occaecat incididunt eiusmod commodo et cillum pariatur.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/bright-pink-shirt.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 58.372,
            'priceTaxIncl'    : 64.21,
            'taxRate'         : 10,
            'comparedPrice'   : 69.90,
            'quantity'        : 34,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'Apple,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'LEO316',
            'id': 'LEO316',
            'name'            : 'White Polo',
            'handle'          : 'black-shoes',
            'description'     : 'Velit cillum cupidatat eiusmod ea quis sit. Consequat dolore elit sunt sunt voluptate irure incididunt consectetur non. Dolore veniam ipsum anim commodo ex. Proident ipsum nostrud ullamco sit. Ad dolore nulla qui mollit laborum ex ipsum.',
            'categories'      : [
                'Shoes',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/white-polo.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 63.390,
            'priceTaxIncl'    : 69.73,
            'taxRate'         : 10,
            'comparedPrice'   : 79.90,
            'quantity'        : 4,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : false,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'OLE910',
            'id': 'OLE910',
            'name'            : 'Grey Jacket',
            'handle'          : 'yellow-bag',
            'description'     : 'Consequat minim velit commodo Lorem ipsum velit elit amet ut. In deserunt id duis nisi labore. Proident cillum et reprehenderit excepteur ex nulla enim.',
            'categories'      : [
                'Bags',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/grey-jacket.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 52.154,
            'priceTaxIncl'    : 57.37,
            'taxRate'         : 10,
            'comparedPrice'   : 59.90,
            'quantity'        : 58,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'REI152',
            'id': 'REI152',
            'name'            : 'Purple Polo',
            'handle'          : 'brown-shoes',
            'description'     : 'Proident do sunt dolor tempor aliquip adipisicing dolor reprehenderit officia proident. Culpa non reprehenderit velit anim consequat velit elit eu culpa quis incididunt id. Eu incididunt exercitation nostrud est mollit officia. Laboris deserunt dolore sit occaecat exercitation quis sunt sunt nisi commodo.',
            'categories'      : [
                'Shoes',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/purple-polo.gif',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 62.18,
            'priceTaxIncl'    : 68.40,
            'taxRate'         : 10,
            'comparedPrice'   : 69.90,
            'quantity'        : 125,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': '2-451-FJIE',
            'id': '11',
            'name'            : 'Brown Shoes',
            'handle'          : 'brown-shoes',
            'description'     : 'Aute do cupidatat amet excepteur. Adipisicing est exercitation ullamco velit pariatur ex id laborum ex consectetur velit et eiusmod. Do laborum commodo veniam adipisicing aute cillum. Adipisicing est minim voluptate aliqua nostrud.',
            'categories'      : [
                'Shoes',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 48.727,
            'priceTaxIncl'    : 53.60,
            'taxRate'         : 10,
            'comparedPrice'   : 69.90,
            'quantity'        : 27,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'POG-285',
            'id': '12',
            'name'            : 'Night Dress',
            'handle'          : 'night-dress',
            'description'     : 'Ex culpa et enim aute labore deserunt. Culpa occaecat nostrud culpa elit Lorem deserunt qui nulla ea elit veniam ea. Qui ullamco ullamco minim esse excepteur magna aliquip Lorem tempor ut aliqua sunt ad. Lorem minim tempor aliqua in in. In nisi esse ea eiusmod consequat sint.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 9.309,
            'priceTaxIncl'    : 10.24,
            'taxRate'         : 10,
            'comparedPrice'   : 19.90,
            'quantity'        : 188,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': '1T-TOP',
            'id': '13',
            'name'            : 'Red Hoodie',
            'handle'          : 'red-hoodie',
            'description'     : 'Aliquip cillum qui in consectetur ullamco ipsum ea esse eu non nostrud cillum velit minim. Deserunt est do non mollit incididunt enim non consectetur dolore ullamco do ad enim aliqua. Velit ipsum duis sunt sint dolore reprehenderit aute sint sunt esse laborum.',
            'categories'      : [
                'Hoodies',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 22.381,
            'priceTaxIncl'    : 24.62,
            'taxRate'         : 10,
            'comparedPrice'   : 29.90,
            'quantity'        : 147,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : false,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'RED-969J',
            'id': '14',
            'name'            : 'Red Hoodie',
            'handle'          : 'red-hoodie',
            'description'     : 'Proident excepteur consectetur elit eiusmod ipsum in pariatur voluptate laborum ex ullamco. Nisi cupidatat officia veniam eiusmod enim do aute labore dolor in nostrud sunt pariatur ex. Dolore elit non excepteur sint proident aliqua in aliquip irure elit.',
            'categories'      : [
                'Hoodies',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 44.809,
            'priceTaxIncl'    : 49.29,
            'taxRate'         : 10,
            'comparedPrice'   : 59.90,
            'quantity'        : 21,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : false,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'JIEI-51',
            'id': '15',
            'name'            : 'Summer Dress',
            'handle'          : 'summer-dress',
            'description'     : 'Exercitation consectetur eiusmod nisi aliqua adipisicing nisi sit eiusmod. Quis ex est in cillum sit consequat ut mollit excepteur ipsum. Culpa Lorem magna cillum qui tempor nisi eiusmod occaecat veniam eiusmod officia culpa. Incididunt est nulla incididunt quis dolore duis id laborum magna veniam velit amet nostrud. Ad deserunt velit dolor irure exercitation reprehenderit nisi occaecat officia anim. Minim eiusmod aliquip eu do ipsum excepteur in reprehenderit voluptate laborum ullamco anim.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 62.827,
            'priceTaxIncl'    : 69.11,
            'taxRate'         : 10,
            'comparedPrice'   : 79.90,
            'quantity'        : 10,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'ZIPE5-552',
            'id': '16',
            'name'            : 'Red Hoodie',
            'handle'          : 'red-hoodie',
            'description'     : 'Deserunt exercitation Lorem est tempor. Elit magna irure dolore pariatur culpa elit labore laborum anim ad excepteur esse. Irure qui proident irure elit exercitation qui cupidatat mollit in excepteur nulla. Laboris exercitation culpa irure non ea in incididunt est. Dolor ipsum proident esse ea ipsum culpa nulla officia ad ipsum excepteur. Commodo veniam cillum non eu anim exercitation.',
            'categories'      : [
                'Hoodies',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 9.309,
            'priceTaxIncl'    : 10.24,
            'taxRate'         : 10,
            'comparedPrice'   : 19.90,
            'quantity'        : 68,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': '155T4Y',
            'id': '17',
            'name'            : 'Printed Dress',
            'handle'          : 'printed-dress',
            'description'     : 'Labore adipisicing exercitation velit minim nostrud excepteur eu esse. Dolor ullamco exercitation consequat cupidatat amet qui occaecat anim pariatur aute anim enim aute fugiat. Enim sint eiusmod amet nulla consequat aute culpa elit. Laborum laboris duis do quis do dolor incididunt id culpa laborum non est. Commodo ullamco labore duis occaecat est pariatur voluptate occaecat et voluptate occaecat sit.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 53.963,
            'priceTaxIncl'    : 59.36,
            'taxRate'         : 10,
            'comparedPrice'   : 69.90,
            'quantity'        : 66,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : false,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': 'OIE-51',
            'id': '18',
            'name'            : 'Blouse',
            'handle'          : 'blouse',
            'description'     : 'Id dolor sunt deserunt adipisicing nostrud sit enim magna. Eu ut ea qui ullamco aute. Elit do non anim labore culpa aliquip eu ullamco magna aliqua culpa velit. Culpa nisi laboris cupidatat ea in officia est ex.',
            'categories'      : [
                'Dresses',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 58.372,
            'priceTaxIncl'    : 64.21,
            'taxRate'         : 10,
            'comparedPrice'   : 69.90,
            'quantity'        : 60,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': '5IJOE',
            'id': '19',
            'name'            : 'Leather Belt',
            'handle'          : 'leather-belt',
            'description'     : 'Enim adipisicing commodo laboris voluptate minim officia irure aliqua exercitation ad. Laboris in elit culpa aute aliquip ex fugiat enim labore. Ut commodo magna dolore dolore officia exercitation non enim id. Est proident enim incididunt consectetur consequat magna consequat esse veniam ea cillum laboris fugiat incididunt.',
            'categories'      : [
                'Belts',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 63.390,
            'priceTaxIncl'    : 69.73,
            'taxRate'         : 10,
            'comparedPrice'   : 79.90,
            'quantity'        : 78,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : '',
            'supplier'        : 'Jeline'

        },
        {
            'itemNumber': '15P-5959',
            'id': '20',
            'name'            : 'Leather Belt',
            'handle'          : 'leather-belt',
            'description'     : 'Id et id ad consequat non exercitation laboris enim. Cillum nulla nulla elit ipsum in aliquip culpa fugiat est nulla id adipisicing et. Occaecat aliqua esse dolor aliquip veniam ad amet nisi ipsum. Et aliquip culpa adipisicing Lorem ipsum aute non dolor eu deserunt ex consequat.',
            'categories'      : [
                'Belts',
                'Women'
            ],
            'tags'            : [
                'dress',
                'printed'
            ],
            'images'          : [
                {
                    'id'  : 1,
                    'url' : 'assets/images/ecommerce/product-image-placeholder.png',
                    'type': 'image'
                },
                {
                    'id'  : 2,
                    'url' : 'assets/images/etc/air-balloons.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 3,
                    'url' : 'assets/images/etc/avenue.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 4,
                    'url' : 'assets/images/etc/cactus.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 5,
                    'url' : 'assets/images/etc/early-sunrise.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 6,
                    'url' : 'assets/images/etc/mountain-lake.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 7,
                    'url' : 'assets/images/etc/road-trip.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 8,
                    'url' : 'assets/images/etc/snow.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 9,
                    'url' : 'assets/images/etc/tropical-beach.jpg',
                    'type': 'image'
                },
                {
                    'id'  : 10,
                    'url' : 'assets/images/etc/mountain-sunset.jpg',
                    'type': 'image'
                }
            ],
            'priceTaxExcl'    : 52.154,
            'priceTaxIncl'    : 57.37,
            'taxRate'         : 10,
            'comparedPrice'   : 59.90,
            'quantity'        : 2,
            'sku'             : 'A445BV',
            'width'           : '22cm',
            'height'          : '24cm',
            'depth'           : '15cm',
            'weight'          : '3kg',
            'extraShippingFee': 3.00,
            'active'          : true,
            'store'           : 'QA,Resin,Five',
            'supplier'        : 'Jeline'

        }
    ];

    public static orders = [
        {
            'id'             : '200124',
            'reference'      : 'Clothes for Park',
            'subtotal'       : '39.97',
            'tax'            : '77.44',
            'discount'       : '-10.17',
            'total'          : '73.31',
            'date'           : '2015/04/25 02:07:59',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Dollie',
                'lastName'       : 'Bullock',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 'R2D245',
                    'name'    : 'Red Shirt',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/red-shirt.jpg'
                },
                {
                    'id'      : 'K2S011',
                    'name'    : 'Blue Polo',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/blue-polo.jpg'
                },
                {
                    'id'      : 'FANE9-HT',
                    'name'    : 'Pink Shirt',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/pink-shirt.jpg'
                },
                {
                    'id'      : 'B21042',
                    'name'    : 'Black Coat',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/black-coat.jpg'
                },
                {
                    'id'      : 'AZI302',
                    'name'    : 'Green Shirt',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/green-shirt.gif'
                },
                {
                    'id'      : 'A45002',
                    'name'    : 'Bright Pink Shirt',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/bright-pink-shirt.jpg'
                },
                {
                    'id'      : 'LEO316',
                    'name'    : 'White Polo',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/white-polo.jpg'
                },
                {
                    'id'      : 'OLE910',
                    'name'    : 'Grey Jacket',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/grey-jacket.jpg'
                },
                {
                    'id'      : 'REI152',
                    'name'    : 'Purple Polo',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/purple-polo.gif'
                }
            ],
            'status'         : [
                {
                    'id'   : 13,
                    'name' : 'On pre-order (not paid)',
                    'color': 'mat-purple-300',
                    'date' : '2016/04/03 10:06:18'
                },
                {
                    'id'   : 1,
                    'name' : 'Awaiting check payment',
                    'color': 'blue-500',
                    'date' : '2015/03/17 18:28:37'
                }
            ],
            'payment'        : {
                'transactionId': '2a894b9e',
                'amount'       : '73.31',
                'method'       : 'Credit Card',
                'date'         : '2016/02/23 15:50:23'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'TNT',
                    'weight'  : '10.44',
                    'fee'     : '7.00',
                    'date'    : '2015/04/10 07:03:52'
                }
            ]
        },
        {
            'id'             : 163421,
            'reference'      : 'Halloween Coats',
            'subtotal'       : '98.68',
            'tax'            : '45.55',
            'discount'       : '-10.25',
            'total'          : '24.51',
            'date'           : '2015/11/07 15:47:31',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Holmes',
                'lastName'       : 'Hines',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 2,
                    'name' : 'Payment accepted',
                    'color': 'green-500',
                    'date' : '2015/10/04 08:54:33'
                },
                {
                    'id'   : 1,
                    'name' : 'Awaiting check payment',
                    'color': 'blue-500',
                    'date' : '2015/05/03 03:43:04'
                }
            ],
            'payment'        : {
                'transactionId': '79c640c8',
                'amount'       : '24.51',
                'method'       : 'Check',
                'date'         : '2015/04/22 04:49:49'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '2.92',
                    'fee'     : '4.00',
                    'date'    : '2015/07/11 14:57:12'
                }
            ]
        },
        {
            'id'             : 100245,
            'reference'      : 'Summer Outing',
            'subtotal'       : '23.03',
            'tax'            : '16.36',
            'discount'       : '-19.46',
            'total'          : '87.17',
            'date'           : '2015/11/26 16:04:40',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Serena',
                'lastName'       : 'Glover',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 8,
                    'name' : 'Payment error',
                    'color': 'mat-red-900',
                    'date' : '2015/07/02 20:44:34'
                },
                {
                    'id'   : 3,
                    'name' : 'Preparing the order',
                    'color': 'orange-500',
                    'date' : '2015/03/23 04:59:45'
                }
            ],
            'payment'        : {
                'transactionId': '5ff44b0c',
                'amount'       : '87.17',
                'method'       : 'PayPal',
                'date'         : '2016/01/25 11:46:28'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '7.53',
                    'fee'     : '7.00',
                    'date'    : '2015/11/25 00:40:54'
                }
            ]
        },
        {
            'id'             : 9000241,
            'reference'      : 'Black Opal Shell',
            'subtotal'       : '13.47',
            'tax'            : '53.45',
            'discount'       : '-15.55',
            'total'          : '26.98',
            'date'           : '2015/11/23 05:35:18',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Dianne',
                'lastName'       : 'Prince',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 5,
                    'name' : 'Delivered',
                    'color': 'mat-green-800',
                    'date' : '2015/10/26 16:12:47'
                },
                {
                    'id'   : 4,
                    'name' : 'Shipped',
                    'color': 'purple-500',
                    'date' : '2016/02/06 06:42:37'
                }
            ],
            'payment'        : {
                'transactionId': '787d49b1',
                'amount'       : '26.98',
                'method'       : 'Check',
                'date'         : '2015/03/07 05:50:57'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'FedEx',
                    'weight'  : '11.93',
                    'fee'     : '5.00',
                    'date'    : '2016/03/21 07:08:26'
                }
            ]
        },
        {
            'id'             : 5199001,
            'reference'      : 'Flight to Alaska',
            'subtotal'       : '46.93',
            'tax'            : '12.14',
            'discount'       : '-19.16',
            'total'          : '12.97',
            'date'           : '2015/01/13 06:21:21',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Frankie',
                'lastName'       : 'Hewitt',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 1240024,
                    'name' : 'Payment error',
                    'color': 'mat-red-900',
                    'date' : '2015/02/01 09:21:46'
                },
                {
                    'id'   : 6,
                    'name' : 'Canceled',
                    'color': 'mat-pink-500',
                    'date' : '2015/11/16 04:48:32'
                }
            ],
            'payment'        : {
                'transactionId': 'cd8c4727',
                'amount'       : '12.97',
                'method'       : 'Bank-wire',
                'date'         : '2016/05/15 21:15:32'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '5.43',
                    'fee'     : '3.00',
                    'date'    : '2016/01/06 00:51:59'
                }
            ]
        },
        {
            'id'             : 492101,
            'reference'      : 'Deco Red Sparkles',
            'subtotal'       : '32.55',
            'tax'            : '11.81',
            'discount'       : '-12.33',
            'total'          : '30.96',
            'date'           : '2015/01/17 04:21:08',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Cole',
                'lastName'       : 'Holcomb',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 3,
                    'name' : 'Preparing the order',
                    'color': 'orange-500',
                    'date' : '2015/11/30 01:04:32'
                },
                {
                    'id'   : 2,
                    'name' : 'Payment accepted',
                    'color': 'green-500',
                    'date' : '2015/11/12 21:27:18'
                }
            ],
            'payment'        : {
                'transactionId': 'a41f4b7c',
                'amount'       : '30.96',
                'method'       : 'Check',
                'date'         : '2015/04/27 03:59:22'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'FedEx',
                    'weight'  : '6.05',
                    'fee'     : '4.00',
                    'date'    : '2015/09/10 11:28:47'
                }
            ]
        },
        {
            'id'             : 400214,
            'reference'      : 'Farm Supplies',
            'subtotal'       : '14.08',
            'tax'            : '74.96',
            'discount'       : '-16.60',
            'total'          : '63.36',
            'date'           : '2015/06/14 14:49:47',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Merrill',
                'lastName'       : 'Richardson',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 11,
                    'name' : 'Awaiting PayPal payment',
                    'color': 'blue-500',
                    'date' : '2015/09/03 18:53:02'
                },
                {
                    'id'   : 13,
                    'name' : 'On pre-order (not paid)',
                    'color': 'mat-purple-300',
                    'date' : '2015/12/13 18:14:40'
                }
            ],
            'payment'        : {
                'transactionId': 1974588,
                'amount'       : '63.36',
                'method'       : 'PayPal',
                'date'         : '2015/11/28 22:24:58'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'FedEx',
                    'weight'  : '2.89',
                    'fee'     : '3.00',
                    'date'    : '2016/02/10 09:03:44'
                }
            ]
        },
        {
            'id'             : 850231,
            'reference'      : 'Coach for HS',
            'subtotal'       : '13.77',
            'tax'            : '55.78',
            'discount'       : '-17.20',
            'total'          : '45.74',
            'date'           : '2015/01/18 01:31:47',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Morgan',
                'lastName'       : 'Pitts',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 4,
                    'name' : 'Shipped',
                    'color': 'purple-500',
                    'date' : '2015/04/29 07:57:43'
                },
                {
                    'id'   : 3,
                    'name' : 'Preparing the order',
                    'color': 'orange-500',
                    'date' : '2015/04/23 11:14:38'
                }
            ],
            'payment'        : {
                'transactionId': '1e704aaf',
                'amount'       : '45.74',
                'method'       : 'Credit Card',
                'date'         : '2015/06/08 03:50:41'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '6.35',
                    'fee'     : '2.00',
                    'date'    : '2015/06/01 09:18:26'
                }
            ]
        },
        {
            'id'             : 918580,
            'reference'      : 'Orion\'s Belt',
            'subtotal'       : '56.49',
            'tax'            : '11.44',
            'discount'       : '-17.45',
            'total'          : '15.31',
            'date'           : '2016/02/14 14:22:58',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Krista',
                'lastName'       : 'Mathis',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 12,
                    'name' : 'Remote payment accepted',
                    'color': 'green-500',
                    'date' : '2015/07/15 15:48:00'
                },
                {
                    'id'   : 14,
                    'name' : 'Awaiting Cash-on-delivery payment',
                    'color': 'blue-500',
                    'date' : '2015/11/08 18:30:15'
                }
            ],
            'payment'        : {
                'transactionId': '762c4e1a',
                'amount'       : '15.31',
                'method'       : 'Bank-wire',
                'date'         : '2015/06/19 14:52:53'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '7.93',
                    'fee'     : '8.00',
                    'date'    : '2015/08/25 15:18:55'
                }
            ]
        },
        {
            'id'             : 1124588,
            'reference'      : 'Cascade Sequence',
            'subtotal'       : '29.34',
            'tax'            : '87.50',
            'discount'       : '-18.11',
            'total'          : '20.97',
            'date'           : '2015/10/23 03:02:55',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Hayden',
                'lastName'       : 'Fitzgerald',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 5,
                    'name' : 'Delivered',
                    'color': 'mat-green-800',
                    'date' : '2016/05/02 09:53:55'
                },
                {
                    'id'   : 2,
                    'name' : 'Payment accepted',
                    'color': 'green-500',
                    'date' : '2015/07/11 05:33:31'
                }
            ],
            'payment'        : {
                'transactionId': '3dce47a3',
                'amount'       : '20.97',
                'method'       : 'Credit Card',
                'date'         : '2015/07/28 23:53:49'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'TNT',
                    'weight'  : '9.20',
                    'fee'     : '2.00',
                    'date'    : '2015/08/05 08:45:55'
                }
            ]
        },
        {
            'id'             : 924001,
            'reference'      : 'Pool Floaties',
            'subtotal'       : '50.35',
            'tax'            : '71.75',
            'discount'       : '-10.46',
            'total'          : '72.30',
            'date'           : '2015/07/28 13:22:49',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Cotton',
                'lastName'       : 'Carlson',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 9,
                    'name' : 'On pre-order (paid)',
                    'color': 'mat-purple-300',
                    'date' : '2016/02/26 14:15:38'
                },
                {
                    'id'   : 4,
                    'name' : 'Shipped',
                    'color': 'purple-500',
                    'date' : '2015/10/17 03:32:39'
                }
            ],
            'payment'        : {
                'transactionId': 'f4154419',
                'amount'       : '72.30',
                'method'       : 'PayPal',
                'date'         : '2016/03/07 15:10:12'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '2.81',
                    'fee'     : '7.00',
                    'date'    : '2016/05/01 11:15:22'
                }
            ]
        },
        {
            'id'             : 591952,
            'reference'      : 'Apple Cart',
            'subtotal'       : '81.95',
            'tax'            : '22.44',
            'discount'       : '-10.89',
            'total'          : '42.54',
            'date'           : '2015/06/07 17:54:36',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Kaye',
                'lastName'       : 'Baldwin',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 10,
                    'name' : 'Awaiting bank wire payment',
                    'color': 'blue-500',
                    'date' : '2015/09/01 20:50:07'
                },
                {
                    'id'   : 12,
                    'name' : 'Remote payment accepted',
                    'color': 'green-500',
                    'date' : '2016/02/13 21:19:04'
                }
            ],
            'payment'        : {
                'transactionId': 44464979,
                'amount'       : '42.54',
                'method'       : 'Credit Card',
                'date'         : '2015/06/30 11:59:49'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'FedEx',
                    'weight'  : '5.52',
                    'fee'     : '2.00',
                    'date'    : '2015/03/15 07:08:37'
                }
            ]
        },
        {
            'id'             : 13,
            'reference'      : '1d4e89f0',
            'subtotal'       : '67.10',
            'tax'            : '46.96',
            'discount'       : '-11.64',
            'total'          : '97.49',
            'date'           : '2016/02/06 13:26:55',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Iva',
                'lastName'       : 'Clark',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 6,
                    'name' : 'Canceled',
                    'color': 'mat-pink-500',
                    'date' : '2015/03/31 03:01:12'
                },
                {
                    'id'   : 8,
                    'name' : 'Payment error',
                    'color': 'mat-red-900',
                    'date' : '2016/03/11 18:53:35'
                }
            ],
            'payment'        : {
                'transactionId': '2aef4aa3',
                'amount'       : '97.49',
                'method'       : 'Check',
                'date'         : '2015/05/13 13:28:52'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'TNT',
                    'weight'  : '5.37',
                    'fee'     : '6.00',
                    'date'    : '2015/04/22 01:48:15'
                }
            ]
        },
        {
            'id'             : 14,
            'reference'      : 'd897564e',
            'subtotal'       : '55.50',
            'tax'            : '48.92',
            'discount'       : '-18.45',
            'total'          : '16.95',
            'date'           : '2016/01/17 04:23:11',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Shauna',
                'lastName'       : 'Rosales',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 7,
                    'name' : 'Refunded',
                    'color': 'red-500',
                    'date' : '2015/12/29 15:34:46'
                },
                {
                    'id'   : 11,
                    'name' : 'Awaiting PayPal payment',
                    'color': 'blue-500',
                    'date' : '2015/07/14 19:10:43'
                }
            ],
            'payment'        : {
                'transactionId': 'b7ea43c9',
                'amount'       : '16.95',
                'method'       : 'PayPal',
                'date'         : '2015/07/11 07:18:06'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'TNT',
                    'weight'  : '6.49',
                    'fee'     : '6.00',
                    'date'    : '2015/01/05 13:42:13'
                }
            ]
        },
        {
            'id'             : 15,
            'reference'      : '1a803de2',
            'subtotal'       : '13.73',
            'tax'            : '64.42',
            'discount'       : '-19.64',
            'total'          : '20.34',
            'date'           : '2015/09/26 14:26:33',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Carroll',
                'lastName'       : 'Dotson',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 1,
                    'name' : 'Awaiting check payment',
                    'color': 'blue-500',
                    'date' : '2015/12/21 10:42:21'
                },
                {
                    'id'   : 6,
                    'name' : 'Canceled',
                    'color': 'mat-pink-500',
                    'date' : '2016/02/11 05:58:55'
                }
            ],
            'payment'        : {
                'transactionId': '0633458c',
                'amount'       : '20.34',
                'method'       : 'Check',
                'date'         : '2015/07/17 20:54:14'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'TNT',
                    'weight'  : '3.30',
                    'fee'     : '2.00',
                    'date'    : '2015/11/04 14:08:16'
                }
            ]
        },
        {
            'id'             : 16,
            'reference'      : '7d90eaa6',
            'subtotal'       : '99.07',
            'tax'            : '31.36',
            'discount'       : '-18.23',
            'total'          : '10.64',
            'date'           : '2015/08/10 14:28:10',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Jeannie',
                'lastName'       : 'Reese',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 9,
                    'name' : 'On pre-order (paid)',
                    'color': 'mat-purple-300',
                    'date' : '2015/06/20 08:37:46'
                },
                {
                    'id'   : 2,
                    'name' : 'Payment accepted',
                    'color': 'green-500',
                    'date' : '2015/01/01 01:42:21'
                }
            ],
            'payment'        : {
                'transactionId': '45f7440a',
                'amount'       : '10.64',
                'method'       : 'PayPal',
                'date'         : '2015/11/23 11:14:47'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '9.94',
                    'fee'     : '6.00',
                    'date'    : '2016/04/30 19:17:39'
                }
            ]
        },
        {
            'id'             : 17,
            'reference'      : 'cf9b4bfc',
            'subtotal'       : '96.93',
            'tax'            : '74.32',
            'discount'       : '-12.63',
            'total'          : '27.06',
            'date'           : '2015/11/10 16:54:11',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Dena',
                'lastName'       : 'Rowe',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 5,
                    'name' : 'Delivered',
                    'color': 'mat-green-800',
                    'date' : '2015/03/23 00:18:52'
                },
                {
                    'id'   : 3,
                    'name' : 'Preparing the order',
                    'color': 'orange-500',
                    'date' : '2015/03/22 04:48:12'
                }
            ],
            'payment'        : {
                'transactionId': '966f4c8e',
                'amount'       : '27.06',
                'method'       : 'PayPal',
                'date'         : '2015/07/10 17:22:44'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'FedEx',
                    'weight'  : '6.81',
                    'fee'     : '3.00',
                    'date'    : '2015/01/23 07:31:46'
                }
            ]
        },
        {
            'id'             : 18,
            'reference'      : '07a938c4',
            'subtotal'       : '67.73',
            'tax'            : '33.33',
            'discount'       : '-12.33',
            'total'          : '91.50',
            'date'           : '2015/08/26 16:24:38',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Blankenship',
                'lastName'       : 'Lynch',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 6,
                    'name' : 'Canceled',
                    'color': 'mat-pink-500',
                    'date' : '2016/03/24 22:56:35'
                },
                {
                    'id'   : 4,
                    'name' : 'Shipped',
                    'color': 'purple-500',
                    'date' : '2016/04/09 13:33:26'
                }
            ],
            'payment'        : {
                'transactionId': '411a4e97',
                'amount'       : '91.50',
                'method'       : 'PayPal',
                'date'         : '2016/02/05 05:35:52'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '6.11',
                    'fee'     : '7.00',
                    'date'    : '2015/10/20 10:46:31'
                }
            ]
        },
        {
            'id'             : 19,
            'reference'      : 'd460f4ff',
            'subtotal'       : '15.83',
            'tax'            : '41.90',
            'discount'       : '-16.54',
            'total'          : '47.99',
            'date'           : '2015/01/04 21:13:53',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Whitley',
                'lastName'       : 'Mcgee',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 7,
                    'name' : 'Refunded',
                    'color': 'red-500',
                    'date' : '2015/08/10 17:14:57'
                },
                {
                    'id'   : 5,
                    'name' : 'Delivered',
                    'color': 'mat-green-800',
                    'date' : '2016/03/30 01:38:14'
                }
            ],
            'payment'        : {
                'transactionId': '761943c2',
                'amount'       : '47.99',
                'method'       : 'PayPal',
                'date'         : '2015/10/11 20:10:46'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '5.51',
                    'fee'     : '5.00',
                    'date'    : '2015/08/28 21:24:36'
                }
            ]
        },
        {
            'id'             : 20,
            'reference'      : 'ba6a946d',
            'subtotal'       : '36.84',
            'tax'            : '20.12',
            'discount'       : '-14.57',
            'total'          : '44.40',
            'date'           : '2015/02/24 00:57:18',
            'salesRep'       : 'Antera Support',
            'customer'       : {
                'id'             : 1,
                'firstName'      : 'Hood',
                'lastName'       : 'Hodges',
                'avatar'         : 'assets/images/avatars/Abbott.jpg',
                'company'        : 'Saois',
                'jobTitle'       : 'Digital Archivist',
                'email'          : 'abbott@withinpixels.com',
                'phone'          : '+1-202-555-0175',
                'invoiceAddress' : {
                    'address': '704 6th Ave, New York, NY 10010, USA',
                    'lat'    : 40.7424739,
                    'lng'    : -73.99283919999999
                },
                'shippingAddress': {
                    'address': '377 E South Omaha Bridge Rd, Council Bluffs, IA 51501, USA',
                    'lat'    : 41.2183223,
                    'lng'    : -95.8420876
                }
            },
            'products'       : [
                {
                    'id'      : 1,
                    'name'    : 'Printed Dress',
                    'price'   : '10.24',
                    'quantity': 1,
                    'total'   : '10.24',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 2,
                    'name'    : 'Green Skirt',
                    'price'   : '24.62',
                    'quantity': 1,
                    'total'   : '24.62',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                },
                {
                    'id'      : 3,
                    'name'    : 'Printed Dress',
                    'price'   : '49.29',
                    'quantity': 1,
                    'total'   : '49.29',
                    'image'   : 'assets/images/ecommerce/product-image-placeholder.png'
                }
            ],
            'status'         : [
                {
                    'id'   : 10,
                    'name' : 'Awaiting bank wire payment',
                    'color': 'blue-500',
                    'date' : '2015/05/19 11:09:56'
                },
                {
                    'id'   : 12,
                    'name' : 'Remote payment accepted',
                    'color': 'green-500',
                    'date' : '2015/03/27 05:02:33'
                }
            ],
            'payment'        : {
                'transactionId': '4af94368',
                'amount'       : '44.40',
                'method'       : 'PayPal',
                'date'         : '2015/11/11 14:25:39'
            },
            'shippingDetails': [
                {
                    'tracking': '',
                    'carrier' : 'USPS',
                    'weight'  : '3.63',
                    'fee'     : '5.00',
                    'date'    : '2016/03/01 09:07:49'
                }
            ]
        }
    ];

    public static priceTables = [
        {
            name: "Size",
            value: "XS",
            prCode: "",
            priceBreaks: [
                {
                    qty: '1',
                    salesPrice: '107.98',
                    margin: '53.7',
                    unitCost: '49.99',
                    unitProfit: '57.99'
                },
                {
                    qty: '12',
                    salesPrice: '103.98',
                    margin: '51.92',
                    unitCost: '49.99',
                    unitProfit: '53.99'
                },
                {
                    qty: '24',
                    salesPrice: '99.98',
                    margin: '50',
                    unitCost: '49.99',
                    unitProfit: '49.99'
                }
            ]
        },
        {
            name: "Size",
            value: "S",
            prCode: "",
            priceBreaks: [
                {
                    qty: '1',
                    salesPrice: '107.98',
                    margin: '53.7',
                    unitCost: '49.99',
                    unitProfit: '57.99'
                },
                {
                    qty: '12',
                    salesPrice: '103.98',
                    margin: '51.92',
                    unitCost: '49.99',
                    unitProfit: '53.99'
                },
                {
                    qty: '24',
                    salesPrice: '99.98',
                    margin: '50',
                    unitCost: '49.99',
                    unitProfit: '49.99'
                }
            ]
        },
        {
            name: "Size",
            value: "M",
            prCode: "",
            priceBreaks: [
                {
                    qty: '1',
                    salesPrice: '107.98',
                    margin: '53.7',
                    unitCost: '49.99',
                    unitProfit: '57.99'
                },
                {
                    qty: '12',
                    salesPrice: '103.98',
                    margin: '51.92',
                    unitCost: '49.99',
                    unitProfit: '53.99'
                },
                {
                    qty: '24',
                    salesPrice: '99.98',
                    margin: '50',
                    unitCost: '49.99',
                    unitProfit: '49.99'
                }
            ]
        }
    ];

    public static inventory = [
        {
            sku: '001Y0003S',
            size: 'S',
            color: 'Black',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '10',
            lastInsertDate: '2018-05-19',
        },
        {
            sku: '001Y0004M',
            size: 'M',
            color: 'Blue',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '16',
            lastInsertDate: '2018-05-24',
        },
        {
            sku: '002Y0001L',
            size: 'L',
            color: 'Green',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '10',
            lastInsertDate: '2018-05-21',
        },
        {
            sku: '001X0006M',
            size: 'M',
            color: 'Yellow',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '1',
            lastInsertDate: '2018-05-23',
        },
        {
            sku: '001Z0005S',
            size: 'S',
            color: 'Red',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '10',
            lastInsertDate: '2018-05-12',
        },
        {
            sku: '004A0001X',
            size: 'XS',
            color: 'Gray',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '130',
            lastInsertDate: '2018-05-13',
        },
        {
            sku: '004A0001S',
            size: 'S',
            color: 'Yellow',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '120',
            lastInsertDate: '2018-05-19',
        },
        {
            sku: '002Y0003L',
            size: 'L',
            color: 'Purple',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '15',
            lastInsertDate: '2018-05-18',
        },
        {
            sku: '006Y0000S',
            size: 'S',
            color: 'Red',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '17',
            lastInsertDate: '2018-05-13',
        },
        {
            sku: '001Y0007L',
            size: 'L',
            color: 'White',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '20',
            lastInsertDate: '2018-05-15',
        },
        {
            sku: '001Y0007M',
            size: 'M',
            color: 'Red',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '30',
            lastInsertDate: '2018-05-29',
        },
        {
            sku: '001Y0007L',
            size: 'L',
            color: 'Green',
            site: 'Distributor Owned',
            bin: 'A1',
            quantity: '18',
            lastInsertDate: '2018-05-19',
        }
    ]
}
