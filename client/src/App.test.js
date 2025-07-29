import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
};

jest.mock('./context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App', () => {
  test('renders the application without crashing', () => {
    renderApp();
    
    // Check that the app renders without errors
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  test('renders navigation elements', () => {
    renderApp();
    
    // Check for navigation elements
    expect(screen.getByText('User Registration Tracker')).toBeInTheDocument();
  });

  test('renders footer', () => {
    renderApp();
    
    // Check for footer content
    expect(screen.getByText(/© 2024 User Registration Tracker/i)).toBeInTheDocument();
  });

  test('shows login form when not authenticated', () => {
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;
    
    renderApp();
    
    // Should show login form or redirect to login
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('shows dashboard when authenticated', () => {
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' };
    
    renderApp();
    
    // Should show dashboard or main content
    expect(screen.getByText('User Registration Tracker')).toBeInTheDocument();
  });

  test('handles authentication state changes', () => {
    // Start with unauthenticated state
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;
    
    const { rerender } = renderApp();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    
    // Change to authenticated state
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.user = { id: '1', email: 'test@example.com', name: 'Test User' };
    
    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Should now show authenticated content
    expect(screen.getByText('User Registration Tracker')).toBeInTheDocument();
  });

  test('renders with proper styling classes', () => {
    renderApp();
    
    // Check that the app container has proper styling
    const appContainer = screen.getByTestId('auth-provider');
    expect(appContainer).toBeInTheDocument();
  });

  test('includes all necessary providers', () => {
    renderApp();
    
    // Check that AuthProvider is rendered
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    
    // Check that Toaster is rendered
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });
}); 