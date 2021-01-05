export const navigation = [
    {
        'id'   : 'home',
        'title': 'Home',
        'translate' : 'NAV.Home',
        'type' : 'item',
        'icon' : 'dashboard',
        'url'  : '/dashboard'
    },
    {
        'id'       : 'crm',
        'title'    : 'CRM',
        'translate' : 'NAV.CRM.Title',
        'type'     : 'collapsable',
        'icon'     : 'work',
        'children' : [
            {
                'id'    : 'crm.accounts',
                'title' : 'Accounts',
                'translate' : 'NAV.CRM.Accounts',
                'type'  : 'item',
                'url'   : '/accounts'
            },
            {
                'id'       : 'crm.contacts',
                'title'    : 'Contacts',
                'translate' : 'NAV.CRM.Contacts',
                'type'     : 'item',
                'url'      : '/contacts'
            },
            // {
            //     'id'   : 'crm.locations',
            //     'title': 'Locations',
            //     'translate' : 'NAV.CRM.Locations',
            //     'type' : 'item',
            //     'url'  : '/locations'
            // },
            {
                'id'       : 'crm.leads',
                'title'    : 'Leads',
                'translate' : 'NAV.CRM.Leads',
                'type'     : 'item',
                'url'      : '/leads'
            },
            {
                'id'       : 'crm.opportunities',
                'title'    : 'Opportunities',
                'translate' : 'NAV.CRM.Opportunities',
                'type'     : 'item',
                'url'      : '/opportunities'
            },
            {
                'id'   : 'crm.projects',
                'title': 'Projects',
                'translate' : 'NAV.CRM.Projects',
                'type' : 'item',
                'url'  : '/projects'
            }
            // {
            //     'id'   : 'crm.cases',
            //     'title': 'Cases',
            //     'translate' : 'NAV.CRM.Cases',
            //     'type' : 'item',
            //     'url'  : '/cases'
            // },
        ]
    },
    {
        'id'        : 'order',
        'title'     : 'Order Management',
        'translate' : 'NAV.Order Management.Title',
        'type'      : 'collapsable',
        'icon'      : 'view_list',
        'children'  : [
            {
                'id'    : 'order.products',
                'title' : 'Products',
                'translate' : 'NAV.Order Management.Products',
                'type'  : 'item',
                'url'   : '/e-commerce/products'
            },
            {
                'id': 'order.purchaseOrders',
                'title': 'Purchase Orders',
                'translate': 'NAV.Order Management.Purchase Orders',
                'type': 'item',
                'url': '/e-commerce/purchase_orders'
            },
            {
                'id': 'order.arInvoice',
                'title': "Invoicing",
                'translate': 'NAV.Order Management.Invoicing',
                'type': 'item',
                'url': '/e-commerce/invoicing'
            },
            {
                'id'        : 'order.sourcing',
                'title'     : 'Sourcing',
                'translate' : 'NAV.Order Management.Sourcing',
                'type'  : 'item',
                'url'   : '/e-commerce/sources'
            },
            {
                'id'        : 'order.quotes',
                'title'     : 'Quotes',
                'translate' : 'NAV.Order Management.Quotes',
                'type'  : 'item',
                'url'   : '/e-commerce/quotes'
            },
            {
                'id'        : 'order.orders',
                'title'     : 'Orders',
                'translate' : 'NAV.Order Management.Orders',
                'type'  : 'item',
                'url'   : '/e-commerce/orders'
            },
            {
                'id'        : 'order.billing',
                'title'     : 'Billing',
                'translate' : 'NAV.Order Management.Billing',
                'type'  : 'item',
                'url'   : '/e-commerce/billing'
            },
            {
                'id'        : 'order.workflow',
                'title'     : 'Workflow',
                'translate' : 'NAV.Order Management.Workflow',
                'type'  : 'item',
                'url'   : '/workflow'
            },
            {
                'id'        : 'order.logistics',
                'title'     : 'Logistics',
                // 'translate' : 'NAV.Order Management.Workflow',
                'type'  : 'item',
                'url'   : '/logistics'
            },
            {
                'id'    : 'order.inventory',
                'title' : 'Inventory',
                'translate' : 'NAV.Order Management.Inventory',
                'type'  : 'item',
                'url'   : '/e-commerce/inventory'
            },
            {
                'id'    : 'order.receiving',
                'title' : 'Receiving',
                'translate' : 'NAV.Order Management.Receiving',
                'type'  : 'item',
                'url'   : '/receiving'
            },
            {
                'id'    : 'order.production',
                'title' : 'Production',
                'translate' : 'NAV.Order Management.Production',
                'type'  : 'item',
                'url'   : '/productions'
            },
            {
                'id'    : 'order.vouching',
                'title' : 'Vouching',
                'translate' : 'NAV.Order Management.Vouching',
                'type'  : 'item',
                'url'   : '/vouchings'
            },
            {
                'id'    : 'order.apCredit',
                'title' : 'Vendor Credit',
                'translate' : 'NAV.Order Management.ApCredit',
                'type'  : 'item',
                'url'   : '/ap-credit'
            }
        ]
    },
    {
        'id'       : 'artwork',
        'title'    : 'Artwork',
        'translate' : 'NAV.Artwork',
        'type'     : 'item',
        'url'      : '/artworks',
        'icon'     : 'art_track'
    },
    {
        'id'       : 'calendar',
        'title'    : 'Calendar',
        'translate' : 'NAV.CALENDAR',
        'type'      : 'item',
        'icon'     : 'event',
        'url'      : '/apps/calendar'
    },
    {
        'id'       : 'activities',
        'title'    : 'Activities',
        'translate' : 'NAV.Activities',
        'type'     : 'item',
        'url'      : '/activities',
        'icon'     : 'access_time',
        'badge'    : {
            'title': 3,
            'bg'   : '#FF6F00',
            'fg'   : '#FFFFFF'
        }
    },
    {
        'id'       : 'file-manager',
        'title'    : 'File Manager',
        'translate': 'NAV.File Manager',
        'type'     : 'item',
        'icon'     : 'folder',
        'url'      : '/file-manager'
    },
    {
        'id'       : 'mail',
        'title'    : 'Mail',
        'translate' : 'NAV.Mail',
        'type'     : 'item',
        'icon'     : 'email',
        'url'      : '/apps/mail',
        'badge'    : {
            'title'    : '100',
            'bg'       : '#F44336',
            'fg'       : '#FFFFFF'
        }
    },
    // {
    //     'id'        : 'chat',
    //     'title'     : 'Chat',
    //     'translate' : 'NAV.Chat',
    //     'type'      : 'item',
    //     'url'       : '/apps/chat',
    //     'icon'      : 'chat',
    //     'badge'    : {
    //         'title': 13,
    //         'bg'   : '#09d261',
    //         'fg'   : '#FFFFFF'
    //     }
    // },
    // Hidden by Benzur - moved news to Toolbar
    // {
    //     'id'       : 'news',
    //     'title'    : 'News',
    //     'type'     : 'item',
    //     'icon'     : 'assistant_photo',
    //     'url'      : '/ui/page-layouts/blpage-09',
    //     'badge'    : {
    //         'title': 6,
    //         'bg'   : '#2196f3',
    //         'fg'   : '#FFFFFF'
    //     }
    // },
    {
        'id'        : 'reports',
        'title'     : 'Reports',
        'translate' : 'NAV.Reports',
        'type'      : 'item',
        'icon'      : 'timeline',
        'url'       : '/reports'
    },
    {
        'id'   : 'webstore',
        'title': 'Web Store',
        'translate' : 'NAV.Web Store',
        'type' : 'item',
        'icon' : 'store',
        'url'  : '/webstore'
    },
    {
        'id'   : 'tag',
        'title': 'Tag',
        'translate' : 'NAV.Tag',
        'type' : 'item',
        'icon' : 'tag',
        'url'  : '/tag'
    },
    {
        'id'        : 'royalty',
        'title'     : 'Royalty',
        'translate' : 'NAV.Royalty',
        'type'      : 'item',
        'icon'      : 'event',
        'url'       : '/admin/royalty'
    },
/*    {
        'id'        : 'admin.royalty-reports',
        'title'     : 'Royalty Reports',
        'translate' : 'NAV.Royalty Reports',
        'type'      : 'item',
        'icon'      : 'event',
        'url'       : '/admin/royalty/royalty-reports'
    },*/
    {
        'id'       : 'support',
        'title'    : 'Support',
        'translate' : 'NAV.Support.Title',
        'type'     : 'collapsable',
        'icon'     : 'help',
        'children' : [
            {
                'id'       : 'support.knowledge',
                'title'    : 'Knowledge Base',
                'translate'  : 'NAV.Support.Knowledge Base',
                'type'     : 'item',
                'url'      : '/pages/knowledge-base'
            },
            {
                'id'       : 'support.faq',
                'title'    : 'FAQ',
                'type'     : 'item',
                'url'      : '/faqs'
            },
            {
                'id'       : 'support.training',
                'title'    : 'Training Videos',
                'translate': 'NAV.Support.Training Videos',
                'type'     : 'item',
                'url'      : '/apps/academy',
            },
            {
                'id'       : 'support.tickets',
                'title'    : 'Support Tickets',
                'translate': 'NAV.Support.Support Tickets',
                'type'     : 'item',
                'url'      : '/support-tickets',
            }
            // {
            //     'id'       : 'support.sessions',
            //     'title'    : 'Guided Sessions',
            //     'translate': 'NAV.Support.Guided Sessions',
            //     'type'     : 'item',
            //     'url'      : '/guided-sessions'
            // }
        ]
    },
    {
        'id'       : 'admin',
        'title'    : 'Admin',
        'translate' : 'NAV.Admin.Title',
        'type'     : 'collapsable',
        'icon'     : 'settings',
        'children' : [
            // {
            //     'id'       : 'admin.myaccount',
            //     'title'    : 'My Account',
            //     'translate': 'NAV.Admin.My Account',
            //     'type'     : 'item',
            //     'url'      : '/ui/page-layouts/blpage-18'
            // },
            {
                'id'       : 'admin.brands',
                'title'    : 'Brand Identity',
                'type'     : 'item',
            },
            {
                'id'        : 'admin.config',
                'title'     : 'Configuration',
                'translate' : 'NAV.Admin.Configuration',
                'type'      : 'item',
                'url'       : '/admin/config'
            },
            {
                'id'       : 'admin.commissions',
                'title'    : 'Commissions',
                'translate': 'NAV.Admin.Commissions.Title',
                'type'     : 'collapsable',
                'children' : [
                    {
                        'id'       : 'admin.commissions.plans',
                        'title'    : 'Commission Plans',
                        'translate' : 'NAV.Admin.Commissions.Plans',
                        'type'     : 'item',
                        'url'      : '/admin/commissions/plans'
                    },
                    {
                        'id'       : 'admin.commissions.groups',
                        'title'    : 'Commission Groups',
                        'translate' : 'NAV.Admin.Commissions.Groups',
                        'type'     : 'item',
                        'url'      : '/admin/commissions/groups'
                    },
                    {
                        'id'       : 'admin.commissions.adjustments',
                        'title'    : 'Commission Adjustments',
                        'translate' : 'NAV.Admin.Commissions.Adjustments',
                        'type'     : 'item',
                        'url'      : '/admin/commissions/adjustments'
                    }
                ]
            },
            {
                'id'       : 'admin.decoration_fees',
                'title'    : 'Decoration Fees',
                'translate': 'NAV.Admin.Decoration Fees',
                'type'     : 'item',
                'url'      : '/admin/decoration-fees'
            },
            {
                'id'       : 'admin.documents',
                'title'    : 'Documents',
                'translate': 'NAV.Admin.Documents',
                'type'     : 'item',
                'url'      : '/admin/documents'
            },
            {
                'id': 'admin.currency',
                'title': 'Currency',
                'translate': 'NAV.Admin.Currency',
                'type': 'item',
                'url': '/admin/currency'
            },
            {
                'id'        : 'admin.imports',
                'title'     : 'Imports',
                'translate' : 'NAV.Admin.Imports',
                'type'      : 'item',
                'url'       : '/admin/imports'
            },
            {
                'id'        : 'admin.permissions',
                'title'     : 'Permissions',
                'translate' : 'NAV.Admin.Permissions',
                'type'      : 'item',
                'url'       : '/admin/permissions'
            },
            {
                'id'        : 'admin.email-templates',
                'title'     : 'Email Templates',
                'type'      : 'item',
                'url'       : '/admin/email-templates'
            },
            {
                'id'        : 'admin.settings',
                'title'     : 'Integrations',
                'translate' : 'NAV.Admin.Permissions',
                'type'      : 'item',
                'url'       : '/settings'
            },
            {
                'id'       : 'admin.kpi-dashboard',
                'title'    : 'KPI Dashboard',
                'translate': 'NAV.Admin.KPI Dashboard.Title',
                'type'     : 'collapsable',
                'url'      : '/ui/page-layouts/blpage-22',
                'children' : [
                    {
                        'id'       : 'admin.kpi-dashboard.execu',
                        'title'    : 'Executive',
                        'translate' : 'NAV.Admin.KPI Dashboard.Executive',
                        'type'     : 'item',
                        'url'      : '/admin/executive'
                    },
                    {
                        'id'       : 'admin.kpi-dashboard.marke',
                        'title'    : 'Marketing',
                        'translate': 'NAV.Admin.KPI Dashboard.Marketing',
                        'type'     : 'item',
                        'url'      : '/ui/page-layouts/blpage-25'
                    },
                    {
                        'id'       : 'admin.kpi-dashboard.produ',
                        'title'    : 'Production',
                        'translate': 'NAV.Admin.KPI Dashboard.Production',
                        'type'     : 'item',
                        'url'      : '/ui/page-layouts/blpage-26'
                    },
                ]
            },
            // {
            //     'id'   : 'admin.promo_standards',
            //     'title': 'Promo Standards',
            //     'translate': 'NAV.Admin.Promo Standards',
            //     'type' : 'item',
            //     'url'  : 'https://promostandards.org/endpoint/overview/',
            //     'external': true,
            //     'newTab': true
            // },
            {
                'id'        : 'admin.users',
                'title'     : 'Users',
                'translate' : 'NAV.Admin.Users',
                'type'      : 'item',
                'url'       : '/users'
            },
            // {
            //     'id'   : 'admin.promo_standards_adm',
            //     'title': 'Promostandards Admin',
            //     'translate': 'NAV.Admin.Promostandards Admin',
            //     'type' : 'item',
            //     'url'  : 'http://enterprise.anterasoftware.com/protected/services/admin',
            //     'external': true,
            //     'newTab': true
            // }
        ]
    },
    {
        'id'       : 'antera',
        'title'    : 'Antera Admin',
        'translate': 'NAV.Antera Admin.Title',
        'type'     : 'collapsable',
        'icon'     : 'lock',
        'children' : [
            {
                'id'       : 'manage-menu',
                'title'    : 'Manage Menu',
                'translate': 'NAV.Antera Admin.Manage Menu',
                'type'     : 'item',
                'url'      : '/admin/manage-menu'
            },
            {
                'id'        : 'admin.purgerecords',
                'title'     : 'Purge Records',
                'translate' : 'NAV.Admin.Purge Records',
                'type'      : 'item',
                'url'       : '/admin/purge-records'
            },
            {
                'id'       : 'admin-settings',
                'title'    : 'Settings',
                'translate': 'NAV.Antera Admin.Settings',
                'type'     : 'item',
                'url'      : '/admin/antera-settings'
            },
        ]
    },
];
