/**
 * Global Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorMonitor } from '../../lib/error-monitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    errorMonitor.captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="size-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="size-10 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Oops! Có gì đó không ổn
              </h1>

              {/* Message */}
              <p className="text-center text-gray-600 mb-8">
                Ứng dụng đã gặp phải một lỗi không mong muốn. Chúng tôi đã được thông báo và sẽ
                khắc phục sớm nhất có thể.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV !== "production" && this.state.error && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Chi tiết lỗi:</h3>
                  <pre className="text-sm text-red-600 overflow-auto whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <RefreshCw className="size-5" />
                  Thử lại
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <Home className="size-5" />
                  Về trang chủ
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  Nếu lỗi vẫn tiếp tục xảy ra, vui lòng liên hệ{' '}
                  <a href="mailto:support@educourse.vn" className="text-indigo-600 hover:underline">
                    support@educourse.vn
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component for specific sections
 */
export const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="size-12 text-red-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
      <p className="text-sm text-gray-600 text-center mb-4">{error.message}</p>
      <button
        onClick={resetError}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        <RefreshCw className="size-4" />
        Thử lại
      </button>
    </div>
  );
};
