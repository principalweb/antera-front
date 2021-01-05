import { InMemoryDbService } from 'angular-in-memory-web-api';

import { ProjectDashboardDb } from './dashboard-project';
import { AnalyticsDashboardDb } from './dashboard-analytics';
// import { CalendarFakeDb } from './calendar';
import { ECommerceFakeDb } from './e-commerce';
import { AcademyFakeDb } from './academy';
import { MailFakeDb } from './mail';
import { ChatFakeDb } from './chat';
import { FileManagerFakeDb } from './file-manager';
import { ContactsFakeDb } from './contacts';
import { AccountsFakeDb } from './accounts';
import { TodoFakeDb } from './todo';
import { ScrumboardFakeDb } from './scrumboard';
import { DocumentFakeDb } from './document';
import { ProfileFakeDb } from './profile';
import { SearchFakeDb } from './search';
import { FaqFakeDb } from './faq';
import { KnowledgeBaseFakeDb } from './knowledge-base';
import { IconsFakeDb } from './icons';
import { QuickPanelFakeDb } from './quick-panel';
import { LeadsFakeDb } from './leads';
import { OpportunitiesFakeDb } from './opportunities';
import { ReceivingsFakeDb } from './receivings';
import { InventoryFakeDb } from './inventory';
import { WebstoreFakeDb } from './webstore';
import { GuidedSessionsFakeDb } from './guided-sessions';
import { LocationsFakeDb } from './locations';
import { ProjectsFakeDb } from './projects';
import { CasesFakeDb } from './cases';
import { MediaFakeDb } from './media';
import { WorkflowFakeDb } from './workflow';
import { ReportFakeDb } from './reports';
import { ActivitiesFakeDb } from './activities';
import { ArtworksFakeDb } from './artworks';
import { CalendarFakeDb } from './calendar';

export class FuseFakeDbService implements InMemoryDbService
{
    createDb()
    {
        return {
            // Dashboards
            'project-dashboard-projects' : ProjectDashboardDb.projects,
            'project-dashboard-widgets'  : ProjectDashboardDb.widgets,
            'analytics-dashboard-widgets': AnalyticsDashboardDb.widgets,

            // Calendar
            'calendar': CalendarFakeDb.data,

            // E-Commerce
            'e-commerce-dashboard': ECommerceFakeDb.dashboard,
            'e-commerce-products' : ECommerceFakeDb.products,
            'e-commerce-orders'   : ECommerceFakeDb.orders,
            'e-commerce-prices'   : ECommerceFakeDb.priceTables,
            'e-commerce-inventory': ECommerceFakeDb.inventory,

            // Academy
            'academy-categories': AcademyFakeDb.categories,
            'academy-courses'   : AcademyFakeDb.courses,
            'academy-course'    : AcademyFakeDb.course,

            // Mail
            'mail-mails'  : MailFakeDb.mails,
            'mail-folders': MailFakeDb.folders,

            // Chat
            'chat-contacts': ChatFakeDb.contacts,
            'chat-chats'   : ChatFakeDb.chats,
            'chat-user'    : ChatFakeDb.user,

            // File Manager
            'file-manager': FileManagerFakeDb.files,

            // Accounts
            'accounts-accounts': AccountsFakeDb.accounts,

            // Contacts
            'contacts-contacts': ContactsFakeDb.contacts,

            // Activities
            'activities': ActivitiesFakeDb.activities,

            // Todo
            'todo-todos'  : TodoFakeDb.todos,
            'todo-filters': TodoFakeDb.filters,
            'todo-tags'   : TodoFakeDb.tags,

            // Scrumboard
            'scrumboard-boards': ScrumboardFakeDb.boards,

            // Invoice
            'invoice': DocumentFakeDb.invoice,
            'order-confirmation': DocumentFakeDb.order_confirmation,  

            // Profile
            'profile-timeline'     : ProfileFakeDb.timeline,
            'profile-photos-videos': ProfileFakeDb.photosVideos,
            'profile-about'        : ProfileFakeDb.about,

            // Search
            'search-classic': SearchFakeDb.classic,
            'search-table'  : SearchFakeDb.table,

            // FAQ
            'faq': FaqFakeDb.data,

            // Report
            'reports': ReportFakeDb.reports,

            // Knowledge base
            'knowledge-base': KnowledgeBaseFakeDb.data,

            // Icons
            'icons': IconsFakeDb.icons,

            // Quick Panel
            'quick-panel-notes' : QuickPanelFakeDb.notes,
            'quick-panel-events': QuickPanelFakeDb.events,

            // Leads
            'leads' : LeadsFakeDb.leads,

            // Opportunities
            'opportunities' : OpportunitiesFakeDb.opportunities,

            // Receivings
            'receivings': ReceivingsFakeDb.receivings,

            // Inventory
            'inventory': InventoryFakeDb.inventory,

            // Webstore
            'webstore': WebstoreFakeDb.webstore,

            // Wworkflow
            'workflow': WorkflowFakeDb.workflow,
            
            // Guided Sessions
            'session-categories': GuidedSessionsFakeDb.categories,
            'guided-sessions': GuidedSessionsFakeDb.sessions,
            'guided-session': GuidedSessionsFakeDb.session,

            // Locations
            'locations': LocationsFakeDb.locations,

            // Projects
            'projects': ProjectsFakeDb.projects,

            // Cases
            'cases': CasesFakeDb.cases,

            // Artworks
            'artworks': ArtworksFakeDb.artworks,
            'artwork-design-types': ArtworksFakeDb.designTypes,

            // Media
            'media-images': MediaFakeDb.images
        };
    }
}
