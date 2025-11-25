/**
 * QA Test Auth Page - /qa-test/auth
 * PART 9: Admin testing page for authentication system
 */

import { useState } from 'react';
import { AuthCard } from '@/features/auth/AuthCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Loader2, Lock } from 'lucide-react';

const QA_KEY = import.meta.env.VITE_QA_KEY || '';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export function QATestAuth() {
  const { register, login, logout, isAuthenticated } = useAuth();
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Test Account Creation', status: 'pending' },
    { name: 'Test Login Success', status: 'pending' },
    { name: 'Test Login Failure', status: 'pending' },
    { name: 'Test Forgot Password', status: 'pending' },
    { name: 'Test Reset Password', status: 'pending' },
    { name: 'Test Logout', status: 'pending' },
    { name: 'Test Protected Route Access', status: 'pending' }
  ]);

  const handleAuth = () => {
    if (adminKey === QA_KEY) {
      setAuthenticated(true);
    } else {
      alert('Invalid admin key');
    }
  };

  const updateTestStatus = (index: number, status: TestResult['status'], message?: string) => {
    setTests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, message };
      return updated;
    });
  };

  const runTest = async (index: number, testFn: () => Promise<void>) => {
    updateTestStatus(index, 'running');
    try {
      await testFn();
      updateTestStatus(index, 'success', 'Test passed');
    } catch (err) {
      updateTestStatus(index, 'error', err instanceof Error ? err.message : 'Test failed');
    }
  };

  const testAccountCreation = async () => {
    const testEmail = `test-${Date.now()}@heartguard.test`;
    await register({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'TestPassword123!'
    });
  };

  const testLoginSuccess = async () => {
    const testEmail = `test-login-${Date.now()}@heartguard.test`;
    await register({
      firstName: 'Test',
      lastName: 'Login',
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await login({
      email: testEmail,
      password: 'TestPassword123!'
    });
  };

  const testLoginFailure = async () => {
    try {
      await login({
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!'
      });
      throw new Error('Login should have failed');
    } catch (err) {
      if (err instanceof Error && err.message === 'Login should have failed') {
        throw err;
      }
    }
  };

  const testForgotPassword = async () => {
    window.open('/auth/forgot', '_blank');
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const testResetPassword = async () => {
    window.open('/auth/reset?token=test-token', '_blank');
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const testLogout = async () => {
    if (isAuthenticated) {
      await logout();
    }
  };

  const testProtectedRoute = async () => {
    window.open('/home', '_blank');
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const runAllTests = async () => {
    await runTest(0, testAccountCreation);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(1, testLoginSuccess);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(2, testLoginFailure);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(3, testForgotPassword);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(4, testResetPassword);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(5, testLogout);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runTest(6, testProtectedRoute);
  };

  if (!authenticated) {
    return (
      <AuthCard title="QA Test Suite - Auth" subtitle="Admin access required">
        <div className="space-y-4">
          <Alert>
            <Lock className="w-5 h-5" />
            <AlertDescription className="ml-2">
              This page is for authorized QA testing only. Enter the admin key to continue.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="adminKey" className="text-base font-semibold">
              Admin Key
            </Label>
            <Input
              id="adminKey"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter QA admin key"
              className="h-12 text-base"
            />
          </div>

          <Button
            onClick={handleAuth}
            className="w-full h-12 text-base font-bold bg-[#D4A44A] hover:bg-[#B8903E] text-white"
          >
            Authenticate
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" 
         style={{ background: 'linear-gradient(135deg, #0D0F12 0%, #1B1E23 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication QA Test Suite
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Test all authentication functionality
          </p>

          <div className="mb-6">
            <Button
              onClick={runAllTests}
              className="w-full h-12 text-base font-bold bg-[#D4A44A] hover:bg-[#B8903E] text-white"
            >
              Run All Tests
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  {test.status === 'pending' && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                  {test.status === 'running' && (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  )}
                  {test.status === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {test.status === 'error' && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{test.name}</p>
                    {test.message && (
                      <p className={`text-sm ${test.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                        {test.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    switch (index) {
                      case 0: runTest(index, testAccountCreation); break;
                      case 1: runTest(index, testLoginSuccess); break;
                      case 2: runTest(index, testLoginFailure); break;
                      case 3: runTest(index, testForgotPassword); break;
                      case 4: runTest(index, testResetPassword); break;
                      case 5: runTest(index, testLogout); break;
                      case 6: runTest(index, testProtectedRoute); break;
                    }
                  }}
                  disabled={test.status === 'running'}
                  variant="outline"
                  className="ml-4"
                >
                  Run Test
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Current Auth State:</h3>
            <p className="text-gray-700">
              Authenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
