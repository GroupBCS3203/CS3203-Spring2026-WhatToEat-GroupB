import { useState } from 'react';
import {getUID, setUID} from "./varManager.jsx";
import {setUserData} from "./varManager.jsx";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function LoginRegister({ onLoginChange }) {
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
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

//Helps encode username and password into a format that can be sent in a URL query string, then makes a GET request to the server to either register a new user or log in an existing user. The server's response is expected to be in JSON format, which is returned as a JavaScript object.
  async function registerUser(username, password) {
    const params = new URLSearchParams({ user: username, pass: password });
    const res = await fetch(`${API_URL}/api/user/adduser?${params}`);
    return res.json();
  }
//Helps encode username and password into a format that can be sent in a URL query string, then makes a GET request to the server to either register a new user or log in an existing user. The server's response is expected to be in JSON format, which is returned as a JavaScript object.
  async function loginUser(username, password) {
    const params = new URLSearchParams({ user: username, pass: password });
    const res = await fetch(`${API_URL}/api/user/login?${params}`);
    return res.json();
  }
//gets the user data for a given user ID making a get request to the server with the user ID as a query parameters. 
  async function getdata (id)
    {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/getdata?id=${id}`)
        return res.json;
    }
//Checks if the login form fields are empty and if not, it attempts to log in the user by calling the loginUser function. If the login is successful, it updates the UID state and calls the onLoginChange callback with the new UID. If the login fails, it sets an appropriate error message.
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegisterSuccess('');
//checks if loginUsername and password are empty and if so, sets an error message and returns early to prevent the login attempt.  
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
        settUID(loginData);
        onLoginChange?.(loginData);
        setLoginError('');
        setUserData(UID);
        alert('Login successful');
        return;
      }

      setLoginError('Invalid username or password');
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
    setRegisterSuccess('');
    //check if any of the fields are empty, if the passwords do not match, or if the password is too short. If any of these conditions are true, it sets an appropriate error message and returns early to prevent the registration attempt.

    if (!registerUsername || !registerPassword || !confirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }
    //checks if the password and confirm passwords are the same and returns an error if they are not.
    if (registerPassword !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
//Checks if the password is at least 6 characters.
    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }
//If all checks are passed, it sets the registerLoading state to true and attempts to register the user by calling the registerUser function. If the registration is successful, it sets a success message, clears the form fields, switches to login mode, and pre-fills the login username with the registered username. If the registration fails, it sets an appropriate error message.
    setRegisterLoading(true);
    try {
      const registerData = await registerUser(registerUsername, registerPassword);

      if (registerData === 'success') {
        setRegisterSuccess('Registration successful. You can now log in.');
        setRegisterUsername('');
        setRegisterPassword('');
        setConfirmPassword('');
        setIsLoginMode(true);
        setLoginUsername(registerUsername);
        return;
      }

      if (registerData === 'failed, duplicate') {
        setRegisterError('That username is already taken.');
        return;
      }

      setRegisterError(registerData || 'Registration failed. Please try again.');
    } catch (error) {
      setRegisterError(error.message || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <>
      <h3 style={{ color:'#ffffff' }}>
        Login
      </h3>
      <div
        style={{
          maxWidth: '300px',
          margin: '0 auto 16px',
          padding: '10px 12px',
          borderRadius: '4px',
          border: UID !== 'none' ? '1px solid #4CAF50' : '1px solid #666',
          background: UID !== 'none' ? '#173d1a' : '#252525',
          color: '#fff',
          textAlign: 'center'
        }}
      >
        {UID !== 'none' ? 'Logged in' : 'Not logged in'}
      </div>
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
            {registerSuccess && <div style={{ color: '#7ee787', marginBottom: '12px' }}>{registerSuccess}</div>}
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
            {registerSuccess && <div style={{ color: '#7ee787', marginBottom: '12px' }}>{registerSuccess}</div>}
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
