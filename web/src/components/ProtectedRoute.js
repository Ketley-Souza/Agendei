import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import util from '../services/util';

export default function ProtectedRoute({ children, requiredType = null }) {
    const { isLogado, tipo } = useSelector((state) => state.auth);
    //Vendo se o usuário está no armazenamento local
    const usuarioLocal = util.getUsuarioFromLocalStorage();
    const isLogadoLocal = !!usuarioLocal;
    const tipoLocal = usuarioLocal?.tipo || null;
  //Alterna entre local e redux
    const autenticado = isLogado || isLogadoLocal;
    const tipoUsuario = tipo || tipoLocal;
  //Não logado manda para login
    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }
    //Validando tipo de usuário
    if (requiredType) {
        //Conferir se o tipo de usuário do arrray está certo
        if (Array.isArray(requiredType)) {
            if (!requiredType.includes(tipoUsuario)) {
                return <Navigate to="/login" replace />;
            }
        } else {
            //Verificar em caso de string
            if (tipoUsuario !== requiredType) {
                return <Navigate to="/login" replace />;
            }
        }
    }
    return children;
}

