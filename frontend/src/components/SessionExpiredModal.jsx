/**
 * SessionExpiredModal
 * Replaces the browser alert() that fires on session timeout.
 * Renders a centered overlay modal — no external dependencies.
 */
const SessionExpiredModal = ({ onDismiss }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(4px)',
    }}
  >
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '36px 32px',
        maxWidth: '380px',
        width: 'calc(100% - 32px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '44px', marginBottom: '12px' }}>⏱️</div>
      <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
        Session Expired
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
        You were logged out due to inactivity. Please log in again to continue.
      </p>
      <button
        onClick={onDismiss}
        style={{
          width: '100%',
          padding: '12px',
          background: '#1a73e8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Go to Login
      </button>
    </div>
  </div>
);

export default SessionExpiredModal;
