import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl mb-6 font-bold">Kanban Login</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
