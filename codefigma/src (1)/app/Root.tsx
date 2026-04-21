import { Outlet } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense } from 'react';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { InstructorProvider } from './contexts/InstructorContext';
import { LearningProvider } from './contexts/LearningContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ChatWidget from './components/ChatWidget';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from '../lib/react-query';
import { env } from '../lib/env';
import { usePageView } from '../hooks';
import '../lib/i18n';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="size-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}

// Page tracking wrapper
function PageTracker({ children }: { children: React.ReactNode }) {
  usePageView();
  return <>{children}</>;
}

export default function Root() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <InstructorProvider>
                <CartProvider>
                  <WishlistProvider>
                    <ReviewProvider>
                      <LearningProvider>
                      <Suspense fallback={<LoadingFallback />}>
                        <PageTracker>
                          <div className="min-h-screen flex flex-col bg-white">
                            <Header />
                            <main className="flex-1">
                              <Outlet />
                            </main>
                            <Footer />
                            <AuthModal />
                            <ChatWidget />
                            <Toaster position="top-right" richColors />
                          </div>
                        </PageTracker>
                      </Suspense>
                      </LearningProvider>
                    </ReviewProvider>
                  </WishlistProvider>
                </CartProvider>
              </InstructorProvider>
            </AuthProvider>
          </LanguageProvider>
          {env.dev.enableReactQueryDevtools && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}