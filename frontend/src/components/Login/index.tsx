import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './style.css';
import { useNavigate } from "react-router-dom";
import { Alert, useAlert } from "../common/Alert";
import axiosClient from '../../api/axiosClient';


interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const { alert, showAlert, closeAlert } = useAlert();

  
  const [errors, setErrors] = useState<LoginErrors>({});
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
    validateField(name, formData[name as keyof LoginFormData]);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
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
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      loginUser(formData.email, formData.password);
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });
      setErrors({});
      setTouched({});
    }
  };

  const loginUser = async(email: string, password: string)=>{
    try {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    const response = await axiosClient.post("/auth/login",
      params, {headers:{
          "Content-Type": "application/x-www-form-urlencoded"
        }}
      );
    const token = response.data.access_token;
    localStorage.setItem("token", token);
    navigate("/calculator");

    } catch (err: any) {
      const message = err?.response?.data?.detail || "Something went wrong.";
      showAlert(
        message, "error",
        "Login failed",
      )  
    }
  }

  return (
    <div className="login-container">
      <Alert alert={alert} onClose={closeAlert} />
      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
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
              placeholder="Enter email"
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
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;