import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleOAuthButton from '../components/auth/GoogleOAuthButton';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Need an uppercase letter')
    .regex(/[0-9]/, 'Need a number')
    .regex(/[^A-Za-z0-9]/, 'Need a special character')
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (values: RegisterForm) => {
    try {
      setErrorMessage(null);
      await registerUser(values);
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error ?? 'Unable to register. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row">
      <div className="max-w-md space-y-4 text-center md:text-left">
        <h2 className="font-display text-4xl uppercase tracking-wide text-white">Your Invisible Ink Awaits</h2>
        <p className="text-white/70">
          Claim your daily free edit, unlock the dashboard, and prep for premium packages once we flip the payment switch.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">First Name</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-accent focus:outline-none"
              {...register('firstName')}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Last Name</label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-accent focus:outline-none"
              {...register('lastName')}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
          </div>
        </div>
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
            autoComplete="new-password"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-accent focus:outline-none"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          <p className="mt-2 text-xs text-white/40">
            Must include at least 8 characters, one uppercase letter, one number, and one special character.
          </p>
        </div>
        {errorMessage && <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{errorMessage}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:scale-[1.02] disabled:opacity-60"
        >
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
        <GoogleOAuthButton label="Sign up with Google" />
        <p className="text-center text-xs text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="text-accent underline">
            Log in instead
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
