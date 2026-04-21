/**
 * Minimal provider wrapper for the full-screen learning page.
 * This route sits outside the main Root (no Header/Footer).
 * Auth state is shared via localStorage, so login state is consistent.
 */
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../contexts/AuthContext';
import { LearningProvider } from '../contexts/LearningContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import CourseLearn from './CourseLearn';

export default function CourseLearnWrapper() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <LearningProvider>
            <CourseLearn />
            <Toaster position="top-right" richColors />
          </LearningProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
