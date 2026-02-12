import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { Alert, useAlert } from '../common/Alert';
import axiosClient from '../../api/axiosClient';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface SignupErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const { alert, showAlert, closeAlert } = useAlert();
  
  const [errors, setErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name as keyof SignupFormData]);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        } else {
          delete newErrors.lastName;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Email is invalid';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: SignupErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const signupUser = async(signupData: SignupFormData)=>{
    try{
      let payload = {
        "email": signupData.email,
        "password": signupData.password,
        "first_name": signupData.firstName,
        "last_name": signupData.lastName

      }
      const response = await axiosClient.post(
        "/auth/signup",payload
      )
      console.log('Signup successfully')
      showAlert(
        "Singup successfully", "success",
        "Signed In Successfully",
      )
      navigate("/login")
    }
    catch(err: any){
      console.error("Failed to signup", err)
      const message =err?.response?.data?.detail || "Something went wrong.";
      showAlert(
        message, "error",
        "Signup failed",
      )
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Signup submitted:', formData);
      signupUser(formData)
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      setErrors({});
      setTouched({});
    }
  };

  return (
    <div className="signup-container">
      <Alert alert={alert} onClose={closeAlert} />
      <div className="signup-card">
        <div className="signup-header">
          <h2>Create Account</h2>
          <p>Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.firstName && touched.firstName ? 'input-error' : ''}
                placeholder="First name"
              />
              {touched.firstName && errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.lastName && touched.lastName ? 'input-error' : ''}
                placeholder="Last name"
              />
              {touched.lastName && errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email && touched.email ? 'input-error' : ''}
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.password && touched.password ? 'input-error' : ''}
              placeholder="Enter Password"
            />
            {touched.password && errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;