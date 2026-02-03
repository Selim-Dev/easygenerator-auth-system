import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignupPage } from './pages/SignupPage';
import { SigninPage } from './pages/SigninPage';
import { AppPage } from './pages/AppPage';

/**
 * Root redirect component that redirects based on auth state
 * Requirements: 4.1, 4.2, 4.3, 3.4, 3.5
 */
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // After loading completes, redirect based on auth status
  // Using key prop to force re-render when auth state changes
  return <Navigate to={isAuthenticated ? '/app' : '/signin'} replace key={isAuthenticated ? 'auth' : 'no-auth'} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
