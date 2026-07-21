import { Component, ReactNode } from 'react';
import { Dumbbell, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * catches unhandled errors in the component tree and shows
 * a recovery ui instead of crashing to a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6 text-sm">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 mb-6 overflow-auto max-h-32 text-left border border-gray-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-md"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
