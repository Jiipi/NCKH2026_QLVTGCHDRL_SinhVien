import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary] Unhandled render error', error);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { className: 'min-h-screen flex items-center justify-center px-4' },
        React.createElement(
          'div',
          { className: 'max-w-md text-center' },
          React.createElement('h1', { className: 'text-xl font-semibold mb-2' }, 'Đã xảy ra lỗi'),
          React.createElement(
            'p',
            { className: 'text-gray-600 mb-4' },
            'Ứng dụng gặp lỗi không mong muốn. Vui lòng tải lại trang để tiếp tục.'
          ),
          React.createElement(
            'button',
            {
              className: 'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700',
              onClick: () => window.location.reload()
            },
            'Tải lại trang'
          )
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
