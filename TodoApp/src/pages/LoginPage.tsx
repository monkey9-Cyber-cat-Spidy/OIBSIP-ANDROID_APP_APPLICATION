import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonToast,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonCheckbox
} from '@ionic/react';
import { logIn, personAdd, person, lockClosed, mail, eye, eyeOff } from 'ionicons/icons';
import { DatabaseService, User } from '../services/DatabaseService';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('danger');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Form validation
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const dbService = new DatabaseService();

  const showToastMessage = (message: string, color: string = 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Username validation
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    }

    // Email validation (for signup)
    if (!isLogin) {
      if (!email.trim()) {
        setEmailError('Email is required');
        isValid = false;
      } else if (!validateEmail(email)) {
        setEmailError('Please enter a valid email');
        isValid = false;
      }
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Confirm password validation (for signup)
    if (!isLogin) {
      if (!confirmPassword.trim()) {
        setConfirmPasswordError('Please confirm your password');
        isValid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    console.log('Starting login process...');

    try {
      // Initialize database with timeout
      console.log('Initializing database...');
      await Promise.race([
        dbService.initializeDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database initialization timeout')), 8000)
        )
      ]);
      console.log('Database initialized');

      // Authenticate with timeout
      console.log('Authenticating user...');
      const authPromise = dbService.authenticateUser(username, password);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 5000)
      );
      
      const user = await Promise.race([authPromise, timeoutPromise]);
      console.log('Authentication result:', user ? 'Success' : 'Failed');
      
      if (user) {
        if (rememberMe) {
          localStorage.setItem('rememberUser', JSON.stringify({
            username: user.username,
            id: user.id
          }));
        }
        console.log('Calling onLogin...');
        onLogin(user);
        showToastMessage('Login successful!', 'success');
      } else {
        showToastMessage('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          showToastMessage('Login is taking too long. Please try again.');
        } else {
          showToastMessage('Login failed: ' + error.message);
        }
      } else {
        showToastMessage('Login failed. Please try again.');
      }
    } finally {
      console.log('Login process completed');
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    await dbService.initializeDatabase();

    try {
      // Check if user already exists
      const userExists = await dbService.checkUserExists(username, email);
      
      if (userExists) {
        showToastMessage('Username or email already exists');
        setIsLoading(false);
        return;
      }

      const user = await dbService.createUser(username, email, password);
      
      if (user) {
        onLogin(user);
        showToastMessage('Account created successfully!', 'success');
      } else {
        showToastMessage('Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showToastMessage('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear form and errors
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    console.log('Starting demo login...');

    try {
      // Initialize database with timeout
      console.log('Initializing database for demo...');
      await Promise.race([
        dbService.initializeDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database initialization timeout')), 8000)
        )
      ]);
      console.log('Database initialized for demo');

      // Try to authenticate existing demo user
      console.log('Checking for existing demo user...');
      const demoUser = await Promise.race([
        dbService.authenticateUser('demo', 'demo123'),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Demo auth timeout')), 5000)
        )
      ]);
      
      if (!demoUser) {
        console.log('Creating new demo user...');
        const newDemoUser = await Promise.race([
          dbService.createUser('demo', 'demo@todoapp.com', 'demo123'),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Demo creation timeout')), 5000)
          )
        ]);
        
        if (newDemoUser) {
          console.log('Demo user created successfully');
          onLogin(newDemoUser);
          showToastMessage('Demo account created and logged in!', 'success');
        } else {
          throw new Error('Failed to create demo user');
        }
      } else {
        console.log('Existing demo user found');
        onLogin(demoUser);
        showToastMessage('Logged in with demo account!', 'success');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      if (error instanceof Error && error.message.includes('timeout')) {
        showToastMessage('Demo login is taking too long. Please try again.');
      } else {
        showToastMessage('Demo login failed. Please try manual login.');
      }
    } finally {
      console.log('Demo login process completed');
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{isLogin ? 'Login' : 'Sign Up'} - Todo Keeper</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="auth-content">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <div className="auth-container">
                <div className="auth-header">
                  <IonIcon 
                    icon={isLogin ? logIn : personAdd} 
                    className="auth-icon"
                  />
                  <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                  <p>{isLogin ? 'Sign in to your account' : 'Join Todo Keeper today'}</p>
                </div>

                <IonCard className="auth-card">
                  <IonCardContent>
                    <div className="form-container">
                      {/* Username Field */}
                      <IonItem className={usernameError ? 'ion-invalid' : ''}>
                        <IonIcon icon={person} slot="start" />
                        <IonLabel position="stacked">Username</IonLabel>
                        <IonInput
                          type="text"
                          value={username}
                          placeholder="Enter your username"
                          onIonInput={(e) => setUsername(e.detail.value!)}
                          onIonBlur={() => {
                            if (!username.trim()) {
                              setUsernameError('Username is required');
                            } else if (username.length < 3) {
                              setUsernameError('Username must be at least 3 characters');
                            } else {
                              setUsernameError('');
                            }
                          }}
                        />
                      </IonItem>
                      {usernameError && (
                        <IonText color="danger" className="error-text">
                          <small>{usernameError}</small>
                        </IonText>
                      )}

                      {/* Email Field (Signup only) */}
                      {!isLogin && (
                        <>
                          <IonItem className={emailError ? 'ion-invalid' : ''}>
                            <IonIcon icon={mail} slot="start" />
                            <IonLabel position="stacked">Email</IonLabel>
                            <IonInput
                              type="email"
                              value={email}
                              placeholder="Enter your email"
                              onIonInput={(e) => setEmail(e.detail.value!)}
                              onIonBlur={() => {
                                if (!email.trim()) {
                                  setEmailError('Email is required');
                                } else if (!validateEmail(email)) {
                                  setEmailError('Please enter a valid email');
                                } else {
                                  setEmailError('');
                                }
                              }}
                            />
                          </IonItem>
                          {emailError && (
                            <IonText color="danger" className="error-text">
                              <small>{emailError}</small>
                            </IonText>
                          )}
                        </>
                      )}

                      {/* Password Field */}
                      <IonItem className={passwordError ? 'ion-invalid' : ''}>
                        <IonIcon icon={lockClosed} slot="start" />
                        <IonLabel position="stacked">Password</IonLabel>
                        <IonInput
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          placeholder="Enter your password"
                          onIonInput={(e) => setPassword(e.detail.value!)}
                          onIonBlur={() => {
                            if (!password.trim()) {
                              setPasswordError('Password is required');
                            } else if (password.length < 6) {
                              setPasswordError('Password must be at least 6 characters');
                            } else {
                              setPasswordError('');
                            }
                          }}
                        />
                        <IonButton
                          fill="clear"
                          slot="end"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <IonIcon icon={showPassword ? eyeOff : eye} />
                        </IonButton>
                      </IonItem>
                      {passwordError && (
                        <IonText color="danger" className="error-text">
                          <small>{passwordError}</small>
                        </IonText>
                      )}

                      {/* Confirm Password Field (Signup only) */}
                      {!isLogin && (
                        <>
                          <IonItem className={confirmPasswordError ? 'ion-invalid' : ''}>
                            <IonIcon icon={lockClosed} slot="start" />
                            <IonLabel position="stacked">Confirm Password</IonLabel>
                            <IonInput
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              placeholder="Confirm your password"
                              onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                              onIonBlur={() => {
                                if (!confirmPassword.trim()) {
                                  setConfirmPasswordError('Please confirm your password');
                                } else if (password !== confirmPassword) {
                                  setConfirmPasswordError('Passwords do not match');
                                } else {
                                  setConfirmPasswordError('');
                                }
                              }}
                            />
                            <IonButton
                              fill="clear"
                              slot="end"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              <IonIcon icon={showConfirmPassword ? eyeOff : eye} />
                            </IonButton>
                          </IonItem>
                          {confirmPasswordError && (
                            <IonText color="danger" className="error-text">
                              <small>{confirmPasswordError}</small>
                            </IonText>
                          )}
                        </>
                      )}

                      {/* Remember Me (Login only) */}
                      {isLogin && (
                        <IonItem lines="none" className="remember-me-item">
                          <IonCheckbox
                            checked={rememberMe}
                            onIonChange={(e) => setRememberMe(e.detail.checked)}
                            slot="start"
                          />
                          <IonLabel>Remember me</IonLabel>
                        </IonItem>
                      )}

                      {/* Action Buttons */}
                      <div className="button-container">
                        <IonButton
                          expand="block"
                          onClick={isLogin ? handleLogin : handleSignup}
                          disabled={isLoading}
                          className="primary-button"
                        >
                          <IonIcon icon={isLogin ? logIn : personAdd} slot="start" />
                          {isLogin ? 'Sign In' : 'Create Account'}
                        </IonButton>

                        <IonButton
                          fill="outline"
                          expand="block"
                          onClick={handleDemoLogin}
                          disabled={isLoading}
                          className="demo-button"
                        >
                          Try Demo Account
                        </IonButton>
                      </div>

                      {/* Toggle Mode */}
                      <div className="toggle-container">
                        <IonText>
                          <p>
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <IonButton
                              fill="clear"
                              onClick={toggleMode}
                              className="toggle-button"
                            >
                              {isLogin ? 'Sign Up' : 'Sign In'}
                            </IonButton>
                          </p>
                        </IonText>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading
          isOpen={isLoading}
          message={isLogin ? 'Signing in...' : 'Creating account...'}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;