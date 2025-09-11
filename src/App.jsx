import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NovaDemanda from './pages/NovaDemanda';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  // Se não houver usuário, mostre apenas a página de login, não importa a URL
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  // Se houver usuário, mostre o aplicativo normal dentro do Layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/novademanda" element={<NovaDemanda />} />
        {/* Se o usuário tentar acessar /login estando logado, redirecione para o dashboard */}
        <Route path="/login" element={<Dashboard />} /> 
      </Routes>
    </Layout>
  );
}

export default App;