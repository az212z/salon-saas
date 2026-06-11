import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سالوني | منصة إدارة وحجوزات الصالونات',
  description: 'منصة سحابية متكاملة لإدارة وحجوزات الصالونات والسبا — حجوزات ذكية، CRM، واتساب تلقائي، نظام ولاء، وتقارير متقدمة',
  keywords: ['صالون', 'سبا', 'حجز', 'إدارة صالون', 'منصة SaaS', 'حجوزات ذكية', 'CRM صالون', 'واتساب تلقائي'],
  authors: [{ name: 'سالوني' }],
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://saloni.sa',
    siteName: 'سالوني',
    title: 'سالوني | منصة إدارة وحجوزات الصالونات',
    description: 'نظام حجوزات متكامل + CRM قوي + واتساب تلقائي لصالونك',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'سالوني — منصة إدارة وحجوزات الصالونات',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سالوني | منصة إدارة وحجوزات الصالونات',
    description: 'نظام حجوزات متكامل + CRM قوي + واتساب تلقائي لصالونك',
    images: ['/og-image.png'],
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
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-512x512.png',
  },
};