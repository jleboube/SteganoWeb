import { useNavigate, useLocation, Link, type Location } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleOAuthButton from '../components/auth/GoogleOAuthButton';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      setErrorMessage(null);
      await login(values);
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/steganography';
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error ?? 'Unable to log in. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row">
      <div className="max-w-md space-y-4 text-center md:text-left">
        <h2 className="font-display text-4xl uppercase tracking-wide text-white">Welcome back, Cipher Crafter</h2>
        <p className="text-white/70">
          Slip back into the command center and get hiding. One free edit per day, unlimited chaos with credits.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl"
      >
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Email</label>
          <input
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-accent focus:outline-none"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-accent focus:outline-none"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>
        {errorMessage && <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{errorMessage}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-[1.02] disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
        <GoogleOAuthButton label="Sign in with Google" />
        <p className="text-center text-xs text-white/50">
          Need an account?{' '}
          <Link to="/register" className="text-accent underline">
            Sign up now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
