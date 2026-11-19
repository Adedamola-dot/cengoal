import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { COURSE_LEVELS } from '@cpe-os/shared';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'lecturer']),
  level: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  // Watch the role field to conditionally show the Level dropdown
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      
      // Format payload (convert level string to number if student)
      const payload = {
        ...data,
        level: data.role === 'student' && data.level ? Number(data.level) : undefined,
      };

      const response = await api.post('/auth/register', payload);
      const { user, accessToken } = response.data.data;
      
      setAuth(user, accessToken);
      navigate({ to: '/' }); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Check your connection.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-brand-500 flex-col justify-between p-12 text-white">
        <div className="text-2xl font-bold tracking-tight">Cengoal.</div>
        <div>
          <h1 className="text-4xl font-semibold mb-4 leading-tight">
            Join the network.
          </h1>
          <p className="text-brand-100">
            Get access to verified past questions, course guides, and a community of engineers.
          </p>
        </div>
        <div className="text-sm text-brand-200">
          © {new Date().getFullYear()} Cengoal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight text-text-main mb-2">Create an account</h2>
            <p className="text-text-muted text-sm">Enter your details to get started.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="student@futminna.edu.ng"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">I am a...</label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                {...register('role')}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </div>

            {/* Conditionally show level if they select Student */}
            {selectedRole === 'student' && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Level</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  {...register('level')}
                >
                  <option value="">Select your level</option>
                  {COURSE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl} Level</option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}