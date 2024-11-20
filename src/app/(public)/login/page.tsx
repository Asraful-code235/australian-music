import LoginForm from '@/components/login/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login page',
};

export default function Login() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
