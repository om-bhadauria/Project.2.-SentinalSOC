import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
} from 'lucide-react';
import useStore from '../store/useStore';
import { authApi } from '../lib/authApi';

const DEFAULT_USERS = [
  {
    id: 'demo-admin',
    name: 'Admin SOC',
    email: 'admin@sentinel.soc',
    password: 'SentinelDemo123!',
    role: 'Tier 3 Analyst',
  },
];

const getStoredUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('sentinel_users') || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users) => {
  localStorage.setItem('sentinel_users', JSON.stringify(users));
};

const openDashboardFirst = () => {
  window.history.replaceState(null, '', '/');
};

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const recordLoginAttempt = useStore(state => state.recordLoginAttempt);
  const hydrateDemoWorkspace = useStore(state => state.hydrateDemoWorkspace);
  const isSignUp = mode === 'signup';

  const users = useMemo(() => [...DEFAULT_USERS, ...getStoredUsers()], [mode, success]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
    setForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const enterDemoDashboard = () => {
    const demoUser = DEFAULT_USERS[0];
    hydrateDemoWorkspace();
    recordLoginAttempt(false, null);
    openDashboardFirst();
    onLogin({
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
    });
  };

  const handleSignIn = async () => {
    const email = form.email.trim().toLowerCase();
    const user = users.find(item => item.email.toLowerCase() === email);

    try {
      const apiUser = await authApi.login({ email, password: form.password });
      if (apiUser.id === 'demo-admin' || apiUser.email === 'admin@sentinel.soc') {
        hydrateDemoWorkspace();
      }
      recordLoginAttempt(false, null);
      openDashboardFirst();
      onLogin(apiUser);
      return;
    } catch {
      if (!user || user.password !== form.password) {
        recordLoginAttempt(true, null);
        setError('Invalid email or password. Use the demo account or create a new one.');
        return;
      }
    }

    if (user.id === 'demo-admin') {
      hydrateDemoWorkspace();
    }

    recordLoginAttempt(false, null);
    openDashboardFirst();
    onLogin({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleSignUp = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) {
      setError('Enter your name to create an analyst account.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (users.some(user => user.email.toLowerCase() === email)) {
      setError('An account with this email already exists. Sign in instead.');
      return;
    }

    try {
      const apiUser = await authApi.register({ name, email, password: form.password });
      recordLoginAttempt(false, null);
      openDashboardFirst();
      onLogin(apiUser);
      return;
    } catch {
      // Fall back to local demo storage when the API is not running.
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password: form.password,
      role: 'SOC Analyst',
    };

    const storedUsers = getStoredUsers();
    saveStoredUsers([...storedUsers, newUser]);
    recordLoginAttempt(false, null);
    openDashboardFirst();
    onLogin({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-textMain grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden">
      <section className="relative hidden lg:flex flex-col justify-between p-10 border-r border-panel-border bg-[#080b10]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-10 top-28 h-px w-4/5 bg-accent/40"></div>
          <div className="absolute right-16 top-48 h-40 w-px bg-warning/40"></div>
          <div className="absolute left-24 bottom-40 h-px w-2/3 bg-danger/30"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Shield className="h-10 w-10 text-accent" />
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-white">Sentinel<span className="text-accent">SOC</span></h1>
            <p className="text-sm text-textMuted">Authentication Command Center</p>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Secure Access</p>
          <h2 className="text-5xl font-bold leading-tight text-white">
            Sign in faster. Create accounts without backend setup.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-textMuted">
            This local demo now supports persistent sign in and sign up using browser storage, so your project is easier to present and test.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            ['MFA Ready', 'Adaptive policy'],
            ['Local Auth', 'No server needed'],
            ['SOC Role', 'Analyst session'],
          ].map(([title, detail]) => (
            <div key={title} className="rounded-lg border border-panel-border bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs text-textMuted">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <Shield className="h-9 w-9 text-accent" />
              <h1 className="text-xl font-bold tracking-wider text-white">Sentinel<span className="text-accent">SOC</span></h1>
            </div>
          </div>

          <div className="glass-panel rounded-lg p-5 sm:p-6">
            <div className="mb-6">
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-panel-border bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    !isSignUp ? 'bg-accent text-darkBg' : 'text-textMuted hover:text-white'
                  }`}
                >
                  <User size={16} />
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isSignUp ? 'bg-accent text-darkBg' : 'text-textMuted hover:text-white'
                  }`}
                >
                  <UserPlus size={16} />
                  Sign up
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white">{isSignUp ? 'Create analyst account' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm leading-6 text-textMuted">
                {isSignUp
                  ? 'Create a local account and enter the SOC dashboard instantly.'
                  : 'Use your account or fill the demo credentials for a quick presentation.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <Field
                  icon={<User size={18} />}
                  label="Full name"
                  value={form.name}
                  onChange={(value) => updateField('name', value)}
                  placeholder="Security Analyst"
                  autoComplete="name"
                />
              )}

              <Field
                icon={<Mail size={18} />}
                label="Email address"
                type="email"
                value={form.email}
                onChange={(value) => updateField('email', value)}
                placeholder="admin@sentinel.soc"
                autoComplete="email"
              />

              <Field
                icon={<Lock size={18} />}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(value) => updateField('password', value)}
                placeholder="Enter password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                action={
                  <button
                    type="button"
                    onClick={() => setShowPassword(value => !value)}
                    className="text-textMuted hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {isSignUp && (
                <Field
                  icon={<Lock size={18} />}
                  label="Confirm password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(value) => updateField('confirmPassword', value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              )}

              {error && (
                <StatusMessage type="error" icon={<AlertTriangle size={18} />}>
                  {error}
                </StatusMessage>
              )}

              {success && (
                <StatusMessage type="success" icon={<CheckCircle2 size={18} />}>
                  {success}
                </StatusMessage>
              )}

              <button
                type="submit"
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-bold text-darkBg transition-all hover:bg-accent/85 focus:outline-none focus:ring-2 focus:ring-accent/70"
              >
                {isSignUp ? 'Create account' : 'Sign in'}
                <ArrowRight size={18} />
              </button>
            </form>

            {!isSignUp && (
              <button
                type="button"
                onClick={enterDemoDashboard}
                className="mt-4 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-panel-border bg-white/[0.03] px-4 py-2 text-sm font-semibold text-textMain transition-colors hover:bg-white/[0.07]"
              >
                Enter demo dashboard
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const Field = ({ icon, label, value, onChange, action, type = 'text', ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-textMuted">{label}</span>
    <span className="flex min-h-[46px] items-center gap-3 rounded-lg border border-panel-border bg-black/40 px-3 text-textMuted transition-colors focus-within:border-accent focus-within:text-accent">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none"
        required
        {...props}
      />
      {action}
    </span>
  </label>
);

const StatusMessage = ({ type, icon, children }) => {
  const styles = type === 'error'
    ? 'border-danger/40 bg-danger/10 text-danger'
    : 'border-accent/40 bg-accent/10 text-accent';

  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
};

export default LoginPage;
