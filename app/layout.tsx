import type { Metadata } from 'next';
import { Oi, Luckiest_Guy, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const oi = Oi({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-oi',
});

const luckiestGuy = Luckiest_Guy({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-luckiest-guy',
});

export const metadata: Metadata = {
  title: 'QuestBoard | Track your Task',
  description: 'Track your task minimalistly',
  openGraph: {
    title: 'QuestBoard',
    description: 'Conquer your day, one mission at a time.',
    url: 'https://task-tracker-sepia-six.vercel.app/', 
    siteName: 'QuestBoard',
    images: [
      {
        url: '/banner.png', 
        width: 1200,
        height: 630,
        alt: 'Mission Command App Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // This makes it look good on X (formerly Twitter)
  twitter: {
    card: 'summary_large_image',
    title: 'QuestBoard',
    description: 'Daily task tracker and mission logs',
    images: ['/banner.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={cn(
        'h-full',
        'antialiased',
        oi.variable,
        luckiestGuy.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <body className='min-h-full flex flex-col'>
        <AuthProvider >
        {children}
        </AuthProvider>
        </body>
    </html>
  );
}
