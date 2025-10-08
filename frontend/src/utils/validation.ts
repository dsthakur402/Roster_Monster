export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateUsername = (username: string): ValidationError | null => {
  if (!username) {
    return { field: 'username', message: 'Username is required' };
  }
  if (username.length < 3) {
    return { field: 'username', message: 'Username must be at least 3 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { field: 'username', message: 'Username can only contain letters, numbers, and underscores' };
  }
  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationError | null => {
  if (!confirmPassword) {
    return { field: 'confirmPassword', message: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }
  return null;
};

export const validateLoginForm = (values: { username: string; password: string }): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const usernameError = validateUsername(values.username);
  if (usernameError) errors.push(usernameError);

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.push(passwordError);

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRegistrationForm = (values: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const usernameError = validateUsername(values.username);
  if (usernameError) errors.push(usernameError);

  const emailError = validateEmail(values.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.push(passwordError);

  const confirmPasswordError = validateConfirmPassword(values.password, values.confirmPassword);
  if (confirmPasswordError) errors.push(confirmPasswordError);

  return {
    isValid: errors.length === 0,
    errors
  };
}; 