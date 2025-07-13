import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/auth';
import { authService } from '../../services/auth.service';
import type { UserRole } from '../../types';

interface BaseRegisterForm {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
}

interface AdvocateForm extends BaseRegisterForm {
  role: 'advocate';
  specialization: string;
  experience: number;
  barCouncilNumber: string;
  consultationFee: number;
}

interface InternForm extends BaseRegisterForm {
  role: 'intern';
  currentInstitution: string;
  degree: string;
  year: number;
  resume: string;
}

type RegisterForm = BaseRegisterForm | AdvocateForm | InternForm;

const roles: { value: UserRole; label: string }[] = [
  { value: 'client', label: 'Client' },
  { value: 'advocate', label: 'Advocate' },
  { value: 'intern', label: 'Intern' },
];

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const watchedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      
      // Prepare the data based on role
      let registrationData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        role: data.role,
      };

      // Add role-specific fields
      if (data.role === 'advocate') {
        registrationData = {
          ...registrationData,
          specialization: (data as AdvocateForm).specialization,
          experience: (data as AdvocateForm).experience,
          barCouncilNumber: (data as AdvocateForm).barCouncilNumber,
          consultationFee: (data as AdvocateForm).consultationFee,
        };
      } else if (data.role === 'intern') {
        registrationData = {
          ...registrationData,
          education: {
            currentInstitution: (data as InternForm).currentInstitution,
            degree: (data as InternForm).degree,
            year: (data as InternForm).year,
          },
          resume: (data as InternForm).resume,
        };
      }

      const response = await authService.register(registrationData);
      login(response.user, response.token);
      navigate('/dashboard');
      toast.success('Welcome to LegalConnect!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Create your account
      </h2>

      <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Full name"
          type="text"
          autoComplete="name"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
          error={errors.name?.message}
        />

        <FormInput
          label="Email address"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <FormInput
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          error={errors.password?.message}
        />

        <FormInput
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          {...register('phoneNumber', {
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9]{10,}$/,
              message: 'Please enter a valid phone number',
            },
          })}
          error={errors.phoneNumber?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            I am a...
          </label>
          <select
            {...register('role', {
              required: 'Please select a role',
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select your role</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Advocate-specific fields */}
        {watchedRole === 'advocate' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Advocate Information</h3>
            
            <FormInput
              label="Specialization"
              type="text"
              {...register('specialization' as any, {
                required: 'Specialization is required',
              })}
              error={(errors as any).specialization?.message}
            />

            <FormInput
              label="Years of Experience"
              type="number"
              {...register('experience' as any, {
                required: 'Experience is required',
                min: { value: 0, message: 'Experience must be 0 or more' },
              })}
              error={(errors as any).experience?.message}
            />

            <FormInput
              label="Bar Council Number"
              type="text"
              {...register('barCouncilNumber' as any, {
                required: 'Bar Council Number is required',
              })}
              error={(errors as any).barCouncilNumber?.message}
            />

            <FormInput
              label="Consultation Fee (₹)"
              type="number"
              {...register('consultationFee' as any, {
                required: 'Consultation fee is required',
                min: { value: 0, message: 'Fee must be 0 or more' },
              })}
              error={(errors as any).consultationFee?.message}
            />
          </div>
        )}

        {/* Intern-specific fields */}
        {watchedRole === 'intern' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Intern Information</h3>
            
            <FormInput
              label="Current Institution"
              type="text"
              {...register('currentInstitution' as any, {
                required: 'Current institution is required',
              })}
              error={(errors as any).currentInstitution?.message}
            />

            <FormInput
              label="Degree"
              type="text"
              {...register('degree' as any, {
                required: 'Degree is required',
              })}
              error={(errors as any).degree?.message}
            />

            <FormInput
              label="Current Year"
              type="number"
              {...register('year' as any, {
                required: 'Current year is required',
                min: { value: 1, message: 'Year must be 1 or more' },
                max: { value: 10, message: 'Year must be 10 or less' },
              })}
              error={(errors as any).year?.message}
            />

            <FormInput
              label="Resume URL"
              type="url"
              placeholder="https://example.com/resume.pdf"
              {...register('resume' as any, {
                required: 'Resume URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL',
                },
              })}
              error={(errors as any).resume?.message}
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>

      <p className="mt-10 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold leading-6 text-primary-600 hover:text-primary-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
