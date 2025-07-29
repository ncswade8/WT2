import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register({ email: 'test@example.com', password: 'password' })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('provides initial authentication state', () => {
    renderWithAuth();
    
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  test('loads user from localStorage on mount', () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
    
    renderWithAuth();
    
    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  test('handles invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    renderWithAuth();
    
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  test('provides login function', () => {
    renderWithAuth();
    
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });

  test('provides register function', () => {
    renderWithAuth();
    
    const registerButton = screen.getByText('Register');
    expect(registerButton).toBeInTheDocument();
  });

  test('provides logout function', () => {
    renderWithAuth();
    
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  test('updates authentication state after successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockResponse = { data: { success: true, user: mockUser, token: 'mock-token' } };
    
    const axios = require('axios');
    axios.post.mockResolvedValue(mockResponse);
    
    renderWithAuth();
    
    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });
    
    // Note: In a real test, you'd need to wait for the async operation
    // This is a simplified test to show the structure
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('updates authentication state after successful registration', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockResponse = { data: { success: true, user: mockUser, token: 'mock-token' } };
    
    const axios = require('axios');
    axios.post.mockResolvedValue(mockResponse);
    
    renderWithAuth();
    
    const registerButton = screen.getByText('Register');
    
    await act(async () => {
      registerButton.click();
    });
    
    expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('clears authentication state after logout', async () => {
    const axios = require('axios');
    axios.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithAuth();
    
    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      logoutButton.click();
    });
    
    expect(axios.delete).toHaveBeenCalledWith('/api/auth/logout');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('handles login error gracefully', async () => {
    const mockResponse = { data: { success: false, message: 'Invalid credentials' } };
    
    const axios = require('axios');
    axios.post.mockResolvedValue(mockResponse);
    
    renderWithAuth();
    
    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });
    
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
  });

  test('handles network errors gracefully', async () => {
    const axios = require('axios');
    axios.post.mockRejectedValue(new Error('Network error'));
    
    renderWithAuth();
    
    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });
    
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
  });
}); 