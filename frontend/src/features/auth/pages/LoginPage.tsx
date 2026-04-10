import { Button } from '@shared/components/Button';

/**
 * LoginPage: Sample page demonstrating the feature-based structure
 */
export const LoginPage = () => {
  return (
    <div className="login-page">
      <h1>Login to ClassManagement</h1>
      <p>This is a sample login page located in @features/auth/pages</p>
      <Button onClick={() => alert('Logging in...')}>Click to Login</Button>
    </div>
  );
};
