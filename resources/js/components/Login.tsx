import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ShieldCheck, User } from 'lucide-react';

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, isLoading, setSessionFromOauth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const rawUser = params.get('user');
    const oauthError = params.get('error');

    if (token && rawUser) {
      try {
        const parsed = JSON.parse(window.atob(rawUser));
        setSessionFromOauth(token, parsed);
        setSuccess('Signed in with Google successfully.');
        params.delete('token');
        params.delete('user');
        const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
        window.history.replaceState({}, '', cleanUrl);
      } catch (e) {
        console.error(e);
        setError('Unable to parse Google login response.');
      }
    }

    if (oauthError) {
      setError('Google login was cancelled or failed. Please try again.');
      params.delete('error');
      const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [setSessionFromOauth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await login(identifier, password);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(String(message));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google/redirect';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!studentId) {
      setError('Student ID is required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          middle_initial: middleInitial || undefined,
          email: identifier,
          student_id: studentId,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      if (!res.ok) {
        // FIX: Cast the response data to 'any' to avoid "Object is of type 'unknown'" error
        const data = await res.json().catch(() => ({})) as any;
        
        // Safe extraction of Laravel validation error message
        let errorMessage = data.message || 'Registration failed';
        
        if (data.errors) {
           const errorValues = Object.values(data.errors);
           if (errorValues.length > 0 && Array.isArray(errorValues[0]) && errorValues[0].length > 0) {
               errorMessage = String(errorValues[0][0]);
           }
        }

        throw new Error(errorMessage);
      }

      setSuccess('Account created. You can now sign in.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001F3F] to-[#003366] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] rounded-full mb-4">
              <Lock className="w-8 h-8 text-[#001F3F]" />
            </div>
            <h1 className="text-[#001F3F]">DormSync</h1>
            <p className="text-gray-600 mt-2">Dormitory Management System</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium ${
                !isRegister ? 'bg-[#001F3F] text-white' : 'bg-white text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium ${
                isRegister ? 'bg-[#001F3F] text-white' : 'bg-white text-gray-700'
              }`}
            >
              Student Registration
            </button>
          </div>

          {isRegister ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Middle Initial</label>
                  <input
                    type="text"
                    value={middleInitial}
                    onChange={(e) => setMiddleInitial(e.target.value)}
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                    placeholder="e.g. 2025-001"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#001F3F] text-white py-2.5 rounded-lg hover:bg-[#003366] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register as Student'}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Student ID or Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                      placeholder="e.g. 2025-001 or student@school.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FFD700] text-[#001F3F] py-3 rounded-lg hover:bg-[#FFC700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Sign in with Google
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-white/70 text-sm mt-6">
          © 2024 DormSync. All rights reserved.
        </p>
      </div>
    </div>
  );
}