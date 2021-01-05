

/* -------- COLOR DEFINITIONS --------
#C4C4C4   GREY        "Blank"
#FFB300   YELLOW      "Waiting on you"     
#058EC0   BLUE        "Waiting on them"    
#09D261   GREEN       "Success or Approved"      
#F44336   RED         "Failure or Declined"    
--------------------------------------  */ 

export const workflowProcess = [
    //Quote
  {  id: 1,   group: 1,   name: 'Pending',          color: "#FFB300" },
  {  id: 2,   group: 1,   name: 'Rework',           color: "#FFB300" },
  {  id: 3,   group: 1,   name: 'Cancelled',        color: "#F44336" },
  // PO - 10
  {  id: 4,   group: 2,    name: 'Send',           color: "#FFB300" },
  {  id: 5,   group: 2,    name: 'Sent',            color: "#058EC0" },
  {  id: 6,   group: 2,    name: 'Accepted',        color: "#09D261" },
  {  id: 7,   group: 2,    name: 'Declined',        color: "#F44336" },
  // Design
  {  id: 8,   group: 3,   name: 'Pending',         color: "#FFB300" },
  {  id: 9,   group: 3,   name: 'Assigned',        color: "#058EC0" },
  {  id: 10,   group: 3,   name: 'Waiting Dist',    color: "#058EC0" },
  {  id: 11,   group: 3,   name: 'Waiting Cust',    color: "#058EC0" },
  {  id: 12,   group: 3,   name: 'Done',            color: "#09D261" },
  // Receiving
  {  id: 13,   group: 4,   name: 'Waiting',         color: "#FFB300" },
  {  id: 14,   group: 4,   name: 'Scheduled',       color: "#058EC0" },
  {  id: 15,   group: 4,   name: 'Received',        color: "#09D261" },
  // Production
  {  id: 16,   group: 5,   name: 'New',             color: "#FFB300" },
  {  id: 17,   group: 5,   name: 'Pending',         color: "#FFB300" },
  {  id: 18,   group: 5,   name: 'Scheduled',       color: "#058EC0" },
  {  id: 19,   group: 5,   name: 'Completed',       color: "#09D261" },
  //QC
  {  id: 20,   group: 6,   name: 'Pending',         color: "#FFB300" },
  {  id: 21,   group: 6,   name: 'Pass',            color: "#09D261" },
  {  id: 22,   group: 6,   name: 'Fail',            color: "#F44336" },
  // Shipping
  {  id: 23,   group: 7,   name: 'Pending',         color: "#058EC0" },
  {  id: 24,   group: 7,   name: 'Done',            color: "#09D261" },

  // Vouching
  {  id: 25,   group: 8,   name: 'Pending',         color: "#FFB300" },
  {  id: 26,   group: 8,   name: 'Done',            color: "#09D261" },

  // Status - 60
  {  id: 27,   group: 9,   name: 'Pending',         color: "#FFB300" },
  {  id: 28,   group: 9,   name: 'Booked',          color: "#058EC0" },
  {  id: 29,   group: 9,   name: 'Billed',          color: "#09D261" }

];

export const workflowTableColumns = [
  { name: 'order', label: 'Order #' },
  { name: 'Account' },
  { name: 'Vendor' },
  { name: 'Amount' },
  { name: 'Timeline' },
  { name: 'quote', label: 'Quote', process: true },
  { name: 'purchaseorder', label: 'PO', process: true },
  { name: 'design', label: 'Design', process: true },
  { name: 'receiving', label: 'Receiving', process: true },
  { name: 'production', label: 'Production', process: true },
  { name: 'qualitycontrol', label: 'QC', process: true },
  { name: 'shipping', label: 'Shipping', process: true },
  { name: 'vouching', label: 'Vouching', process: true },
  { name: 'status', label: 'Status', process: true }
];

export const workflowTableContent = [
  {
    order: 6597,
    account: 'Apple',
    vendor: 'Americal Apparel',
    identity: 'Webstore Order 14606',
    orders: 'TMNT Polos',
    timeline: { name: "May 12 - 20", process: 100 },
    po: 13,
    ar: 25,
    pr: 34,
    sh: 45,
    cs: 53,
    status: 62
  },
  {
    order: 6597,
    account: 'A',
    vendor: 'Americal Apparel',
    identity: 'Webstore Order 14606',
    orders: 'Spongebob Baseball Caps',
    timeline: { name: "May 9 - 20", process: 50 },
    po: 13,
    ar: 25,
    pr: 34,
    sh: 42,
    cs: 50,
    status:61
  },
  {
    order: 6597,
    account: 'B',
    vendor: 'Americal Apparel',
    identity: 'Webstore Order 14606',
    orders: 'Ben 10 Shoes',
    timeline: { name: "May 5 - 21", process: 60 },
    po: 13,
    ar: 23,
    pr: 30,
    sh: 40,
    cs: 50,
    status: 61
  },
  {
    order: 6597,
    account: 'C',
    vendor: 'Americal Apparel',
    identity: 'Webstore Order 14606',
    orders: 'Dexster Shoes',
    timeline: { name: "May 12 - 18", process: 80 },
    po: 14,
    ar: 20,
    pr: 30,
    sh: 40,
    cs: 50,
    status: 63
  },
  {
    order: 6597,
    account: 'Apple',
    vendor: 'Americal Apparel',
    identity: 'Webstore Order 14606',
    orders: 'Transformers Socks',
    timeline: { name: "May 1 - 30", process: 10 },
    po: 11,
    ar: 20,
    pr: 30,
    sh: 40,
    cs: 50,
    status: 61
  }
];


export const months = [
        {
            month: 'Jan',
            days: '31',
            num: '01'
        },
        {
            month: 'Feb',
            days: '28',
            num: '02'
        },
        {
            month: 'Mar',
            days: '31',
            num: '03'
        },
        {
            month: 'Apr',
            days: '30',
            num: '04'
        },
        {
            month: 'May',
            days: '31',
            num: '05'
        },
        {
            month: 'Jun',
            days: '30',
            num: '06'
        },
        {
            month: 'Jul',
            days: '31',
            num: '07'
        },
        {
            month: 'Aug',
            days: '31',
            num: '08'
        },
        {
            month: 'Sep',
            days: '30',
            num: '09'
        },
        {
            month: 'Oct',
            days: '31',
            num: '10'
        },
        {
            month: 'Nov',
            days: '30',
            num: '11'
        },
        {
            month: 'Dec',
            days: '31',
            num: '12'
        },

    ];

export const monthDays = {
};

