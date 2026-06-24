import { Component } from 'react';
import { MdWarning } from 'react-icons/md';

/**
 * Global Error Boundary
 * Catches any unhandled render errors in the component tree below it.
 * Prevents the entire app from going white when one component crashes.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; swap for a real error service (Sentry, etc.) in prod
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          fontFamily: 'Arial, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px 32px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <MdWarning size={48} color="#f59e0b" />
          </div>
          <h2 style={{ color: '#111827', margin: '0 0 8px', fontSize: '20px', fontWeight: 700 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
            An unexpected error occurred. The rest of the app is still running.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
