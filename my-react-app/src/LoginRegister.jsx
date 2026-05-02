import { useState } from 'react';
import {getUID, setUID} from "./varManager.jsx";

function LoginRegister() {
  // Selects between Login and Register form.
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [loginUsername, setLoginUsername] = useState('');
  const [UID, settUID] = useState(getUID());
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);


  function registerUser(username, password) {
    fetch(`${import.meta.env.VITE_API_URL}/api/user/adduser?user=${username}&pass=${password}`)
        .then(res => res.json())
        .then(data => setRegisterError(data));
  }

  async function loginUser(username, password) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/login?user=${username}&pass=${password}`);
    return res.json();
  }


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }

    setLoginLoading(true);
    try {
      const loginData = await loginUser(loginUsername, loginPassword);

      if (loginData != 'none')
      {
        setUID(loginData);
        settUID(loginData)
        setLoginError('');
        alert('Login successful');
        return;
      }

      setLoginError(loginData);
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  //This handles registering an account,
  //Usernames must be unique, passwords are encrypted
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerUsername || !registerPassword || !confirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

    setRegisterLoading(true);
    try {
      // TODO: implement register API/database call and handle response
      console.log('Register attempt:', { username: registerUsername, password: registerPassword });

      registerUser(registerUsername, registerPassword);

      // TODO: handle successful register (e.g. store auth token, update user context, redirect)
    } catch {
      setRegisterError('Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <h3 style={{ color:'#ffffff' }}>
        Login
      </h3>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setIsLoginMode(true)}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            borderRadius: '4px',
            border: 'none',
            background: isLoginMode ? '#4CAF50' : '#666',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button
          onClick={() => setIsLoginMode(false)}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            background: !isLoginMode ? '#2196F3' : '#666',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </div>

      {isLoginMode ? (
        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
          <h4 style={{ color: '#ffffff' }}>Login Form</h4>
          <form onSubmit={handleLoginSubmit}>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              Username
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                disabled={loginLoading}
              />
            </label>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                disabled={loginLoading}
              />
            </label>
            {loginError && <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>{loginError}</div>}
            <button
              type="submit"
              disabled={loginLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: '#4CAF50', color: '#fff' }}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
          <h4 style={{ color: '#ffffff' }}>Register Form</h4>
          <form onSubmit={handleRegisterSubmit}>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              Username
              <input
                type="text"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                disabled={registerLoading}
              />
            </label>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              Password
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                disabled={registerLoading}
              />
            </label>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '4px' }}
                disabled={registerLoading}
              />
            </label>
            {registerError && <div style={{ color: '#ff6b6b', marginBottom: '12px' }}>{registerError}</div>}
            <button
              type="submit"
              disabled={registerLoading}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: '#2196F3', color: '#fff' }}
            >
              {registerLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default LoginRegister;
