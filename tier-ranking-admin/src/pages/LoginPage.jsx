import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { apiErrorMessage } from '../api/axiosInstance.js';
import { FormError } from '../components/common/FormError.jsx';
import { useAuth } from '../hooks/useAuth.js';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true }
  });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success('Logged in');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-[#d8dee7] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-[#dbeafe] p-3 text-[#2563eb]">
            <Lock size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#111827]">Admin Login</h1>
            <p className="text-sm text-[#64748b]">Sign in to manage ranking games.</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input className="field-input" id="email" type="email" autoComplete="email" {...register('email')} />
            <FormError>{errors.email?.message}</FormError>
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="field-input pr-12"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FormError>{errors.password?.message}</FormError>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
            <input className="h-4 w-4 rounded border-[#d8dee7]" type="checkbox" {...register('rememberMe')} />
            Remember me on this device
          </label>
          <button className="btn btn-primary focus-ring w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}
