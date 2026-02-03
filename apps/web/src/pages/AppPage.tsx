import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AppPage component - Protected application page
 * Requirements: 4.3, 4.4
 */
export const AppPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#667eea',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a202c',
          }}>Dashboard</h2>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#667eea';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#667eea';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 32px',
      }}>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '48px',
          marginBottom: '32px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '700',
              color: '#667eea',
              border: '4px solid #e5e7eb',
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a202c',
                margin: '0 0 8px 0',
              }}>
                Welcome to the application.
              </h1>
              {user && (
                <p style={{
                  fontSize: '18px',
                  color: '#667eea',
                  margin: 0,
                  fontWeight: '600',
                }}>
                  Hello, {user.name}!
                </p>
              )}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151',
              }}>
                Authentication Successful
              </h3>
            </div>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              You have successfully signed in to your account. Your session is secure and protected with JWT authentication.
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {/* Account Info Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            padding: '32px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#ede9fe',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Account Details
            </h3>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
            }}>
              Your account information and profile settings
            </p>
            {user && (
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>Email:</span>
                  <br />
                  <span style={{ color: '#374151' }}>{user.email}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>User ID:</span>
                  <br />
                  <span style={{ color: '#374151', fontFamily: 'monospace', fontSize: '12px' }}>{user.id}</span>
                </div>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            padding: '32px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#dcfce7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Security Status
            </h3>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
            }}>
              Your session is protected with industry-standard security
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#16a34a',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                JWT Authentication
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#16a34a',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Encrypted Connection
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#16a34a',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Session Protected
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            padding: '32px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
            }}>
              System Features
            </h3>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
            }}>
              Built with modern technologies and best practices
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                }} />
                React + TypeScript
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                }} />
                NestJS Backend
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                }} />
                MongoDB Atlas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
