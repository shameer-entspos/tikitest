import { Metadata } from 'next';

const siteName = 'Tiki';
const siteDescription =
  'Tiki - Comprehensive project management and collaboration platform';
const siteUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'https://tikiworkplace.app';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'Tiki',
    'Project Management',
    'Task Management',
    'Collaboration',
    'Team Management',
    'Organization',
    'Workflow',
    'Productivity',
  ],
  authors: [{ name: 'Tiki Team' }],
  creator: 'Tiki',
  publisher: 'Tiki',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/svg/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/svg/logo.svg',
    apple: '/svg/logo.svg',
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export const userPanelMetadata: Metadata = {
  title: 'User Dashboard',
  description:
    'Manage your tasks, projects, and collaborate with your team on Tiki',
  openGraph: {
    title: 'User Dashboard | Tiki',
    description:
      'Manage your tasks, projects, and collaborate with your team on Tiki',
  },
};

export const orgPanelMetadata: Metadata = {
  title: 'Organization Dashboard',
  description: 'Manage your organization, teams, users, and settings on Tiki',
  openGraph: {
    title: 'Organization Dashboard | Tiki',
    description: 'Manage your organization, teams, users, and settings on Tiki',
  },
};

export const loginMetadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Tiki account to access your dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export const tasksMetadata: Metadata = {
  title: 'Tasks',
  description: 'Manage and track your tasks, deadlines, and assignments',
  openGraph: {
    title: 'Tasks | Tiki',
    description: 'Manage and track your tasks, deadlines, and assignments',
  },
};

export const projectsMetadata: Metadata = {
  title: 'Projects',
  description: 'View and manage your projects, collaborate with team members',
  openGraph: {
    title: 'Projects | Tiki',
    description: 'View and manage your projects, collaborate with team members',
  },
};

export const chatsMetadata: Metadata = {
  title: 'Chats',
  description:
    'Communicate with your team through direct messages, team chats, and project channels',
  openGraph: {
    title: 'Chats | Tiki',
    description:
      'Communicate with your team through direct messages, team chats, and project channels',
  },
};

export const feedsMetadata: Metadata = {
  title: 'Feeds',
  description:
    'Stay updated with activity feeds and notifications from your projects and team',
  openGraph: {
    title: 'Feeds | Tiki',
    description:
      'Stay updated with activity feeds and notifications from your projects and team',
  },
};

export const appsMetadata: Metadata = {
  title: 'Apps',
  description: 'Access and manage integrated applications and tools',
  openGraph: {
    title: 'Apps | Tiki',
    description: 'Access and manage integrated applications and tools',
  },
};

export const settingsMetadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings, preferences, and security',
  openGraph: {
    title: 'Settings | Tiki',
    description: 'Manage your account settings, preferences, and security',
  },
};

export const orgUsersMetadata: Metadata = {
  title: 'Users',
  description: 'Manage organization users, roles, and permissions',
  openGraph: {
    title: 'Users | Tiki Organization',
    description: 'Manage organization users, roles, and permissions',
  },
};

export const orgTeamsMetadata: Metadata = {
  title: 'Teams',
  description: 'Create and manage teams within your organization',
  openGraph: {
    title: 'Teams | Tiki Organization',
    description: 'Create and manage teams within your organization',
  },
};

export const orgBillingMetadata: Metadata = {
  title: 'Billing',
  description: 'Manage your organization subscription and billing information',
  openGraph: {
    title: 'Billing | Tiki Organization',
    description:
      'Manage your organization subscription and billing information',
  },
};

export const orgSecurityMetadata: Metadata = {
  title: 'Security',
  description: 'Configure security settings and policies for your organization',
  openGraph: {
    title: 'Security | Tiki Organization',
    description:
      'Configure security settings and policies for your organization',
  },
};
