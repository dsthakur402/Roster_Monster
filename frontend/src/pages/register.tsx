import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { validateRegistrationForm, type ValidationError } from '../utils/validation';
import type { RegistrationData } from '../types/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const validateField = (field: string, value: string) => {
    const result = validateRegistrationForm({ 
      ...formData,
      [field]: value 
    });
    const newError = result.errors.find(error => error.field === field);
    setErrors(prev => {
      const filtered = prev.filter(error => error.field !== field);
      return newError ? [...filtered, newError] : filtered;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      await register(formData);
      navigate('/roster');
    } catch (error) {
      setErrors([{ 
        field: 'submit', 
        message: error instanceof Error ? error.message : 'Registration failed' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-lg rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-semibold text-center text-white mb-2">Create your account</h2>
          <p className="text-sm text-center text-gray-400 mb-6">Join RosterMonster to manage your schedule</p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {getFieldError('submit') && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-400 text-center text-sm">{getFieldError('submit')}</p>
              </div>
            )}

            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              onBlur={(e) => validateField('username', e.target.value)}
              placeholder="Choose a username"
              disabled={loading}
              leftIcon={<FiUser className="h-5 w-5" />}
              variant="filled"
              error={getFieldError('username')}
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateField('email', e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              leftIcon={<FiMail className="h-5 w-5" />}
              variant="filled"
              error={getFieldError('email')}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onBlur={(e) => validateField('password', e.target.value)}
              placeholder="Create a password"
              disabled={loading}
              leftIcon={<FiLock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              }
              variant="filled"
              error={getFieldError('password')}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={(e) => validateField('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              leftIcon={<FiLock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none hover:text-gray-300"
                >
                  {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              }
              variant="filled"
              error={getFieldError('confirmPassword')}
            />

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
} 