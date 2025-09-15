import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Este componente protege rotas que requerem autenticação:
 * - Se o usuário estiver logado: renderiza o componente protegido
 * - Se o usuário não estiver logado: redireciona para a landing page
 */
function ProtectedRoute({ children, ...props }) {
  const { isLoggedIn } = useContext(AuthContext);

  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn);
  console.log('ProtectedRoute - current path:', window.location.pathname);

  // Se não estiver logado, redireciona para a landing page
  if (!isLoggedIn) {
    console.log('ProtectedRoute - User not logged in, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // Se estiver logado, renderiza o componente protegido
  console.log('ProtectedRoute - User logged in, rendering children');
  return children;
}

export default ProtectedRoute;
