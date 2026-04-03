import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('UserAuth in App', () => {
  // Use real timers for async behavior to avoid fake timer act issues.
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows login form after clicking login tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText('login'));

    // Ensure the login tab and its specific form controls are rendered
    expect(screen.getByRole('heading', { name: /login form/i })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /username/i })).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it('shows error when submitting empty login form', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('login'));

    // Submit login form (select form submit button specifically)
    const [loginTabButton, loginFormButton] = screen.getAllByRole('button', { name: 'Login' });
    fireEvent.click(loginFormButton);

    expect(await screen.findByText('Please fill in all fields')).toBeTruthy();
  });

  it('shows register password mismatch error', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('login'));

    const registerTabButton = screen.getAllByRole('button', { name: 'Register' })[0];
    fireEvent.click(registerTabButton);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass321' } });

    const registerSubmitButton = screen.getAllByRole('button', { name: 'Register' }).find((btn) => btn.closest('form'));
    fireEvent.click(registerSubmitButton);

    expect(await screen.findByText('Passwords do not match')).toBeTruthy();
  });

  it('calls alert with success on valid login', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);
    fireEvent.click(screen.getByText('login'));

    fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    const loginSubmitButton = screen.getAllByRole('button', { name: 'Login' }).find((btn) => btn.closest('form'));
    fireEvent.click(loginSubmitButton);

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Login successful'), { timeout: 2000 });
  });
});
