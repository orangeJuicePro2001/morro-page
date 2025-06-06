'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function AuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 这里使用测试账号，实际应用中应该使用真实的登录表单
      await signInWithEmailAndPassword(
        auth,
        'test@example.com',
        'password123'
      );
    } catch (error) {
      setError('登录失败，请检查邮箱和密码');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setError('登出失败');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {auth.currentUser ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {auth.currentUser.email?.[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {auth.currentUser.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="btn btn-danger"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                登出中...
              </span>
            ) : (
              '登出'
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              登录中...
            </span>
          ) : (
            '登录'
          )}
        </button>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 