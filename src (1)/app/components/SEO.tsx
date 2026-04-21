/**
 * SEO Component
 * Manages meta tags, OpenGraph, Twitter Cards, and structured data
 */

import { Helmet } from 'react-helmet-async';
import { env } from '../../lib/env';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

export function SEO({
  title = 'EduCourse - Nền tảng học UX/UI Design',
  description = 'Học UX/UI Design chuyên nghiệp với các khóa học về Gestalt principles, input controls, microcopy và nhiều hơn nữa. Giảng viên giàu kinh nghiệm, chứng chỉ được công nhận.',
  keywords = ['UX/UI Design', 'Gestalt Principles', 'Input Controls', 'Microcopy', 'Khóa học thiết kế', 'Học online'],
  image = `${env.appUrl}/og-image.jpg`,
  url,
  type = 'website',
  author = 'EduCourse Team',
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  structuredData,
}: SEOProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : env.appUrl);
  const fullTitle = title.includes('EduCourse') ? title : `${title} | EduCourse`;

  // Default structured data - Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'EduCourse',
    description: 'Nền tảng học trực tuyến về UX/UI Design',
    url: env.appUrl,
    logo: `${env.appUrl}/logo-512.png`,
    sameAs: [
      'https://facebook.com/educourse',
      'https://twitter.com/educourse',
      'https://linkedin.com/company/educourse',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-909-999-999',
      contactType: 'customer service',
      email: 'support@educourse.vn',
      availableLanguage: ['Vietnamese', 'English'],
    },
  };

  // Breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: env.appUrl,
      },
    ],
  };

  // Combine structured data
  const combinedStructuredData = structuredData || organizationSchema;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow" />}
      <meta name="googlebot" content="index,follow" />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="EduCourse" />
      <meta property="og:locale" content="vi_VN" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@educourse" />
      <meta name="twitter:site" content="@educourse" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="EduCourse" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" sizes="180x180" href="/logo-192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/logo-32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/logo-16.png" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(combinedStructuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}

/**
 * Create Course Structured Data
 */
export function createCourseStructuredData(course: {
  id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  thumbnail: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'EduCourse',
      sameAs: env.appUrl,
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: course.currency,
      availability: 'https://schema.org/InStock',
      url: `${env.appUrl}/course/${course.id}`,
    },
    image: course.thumbnail,
    url: `${env.appUrl}/course/${course.id}`,
  };
}

/**
 * Create Blog Post Structured Data
 */
export function createBlogPostStructuredData(post: {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  modifiedAt?: string;
  thumbnail: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'EduCourse',
      logo: {
        '@type': 'ImageObject',
        url: `${env.appUrl}/logo-512.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
}
