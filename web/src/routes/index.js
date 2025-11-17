import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { verificarUsuario } from '../store/slices/authSlice';
import PublicRoutes from './public.routes';
import ClienteRoutes from './cliente.routes';
import AdminRoutes from './admin.routes';

/**
 * Lobby de rotas
 * Escolhendo as rotas que serão usadas
 */
export default function AppRoutes() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { isLogado, tipo, loading } = useSelector((state) => state.auth);

    //Validando usuário
    useEffect(() => {
        //Confere armazementamento local
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo && !isLogado) {
            try {
                JSON.parse(usuarioSalvo); //Valida json
                dispatch(verificarUsuario());
            } catch (err) {
                //Se não for json válido limpa
                localStorage.removeItem('usuario');
            }
        }
    }, [dispatch, isLogado]);

    //Redux falhou usa armazenamento local
    let usuarioLocal = null;
    let isLogadoLocal = false;
    let tipoLocal = null;
    
    try {
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
            usuarioLocal = JSON.parse(usuarioSalvo);
            isLogadoLocal = !!usuarioLocal && !!usuarioLocal.id;
            tipoLocal = usuarioLocal?.tipo || null;
        }
    } catch (err) {
        //Se houver erro ao parsear, limpa
        localStorage.removeItem('usuario');
    }

    //Redux, se não tem vai no armazenamento local
    const autenticado = isLogado || isLogadoLocal;
    const tipoUsuario = tipo || tipoLocal;

    //Loading para quando estiver verificando e não em rota pública
    const rotasPublicas = ['/', '/login', '/cadastro'];
    const isRotaPublica = rotasPublicas.includes(location.pathname);
    
    if (loading && !isRotaPublica && !autenticado) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    //Se não está logado, aparecem só as rotas públicas
    if (!autenticado) {
        return <PublicRoutes />;
    }
    
    //Caso esteja logado, escolhe as rotas
    switch (tipoUsuario) {
        case 'salao':
        case 'colaborador':
            return <AdminRoutes />;
        case 'cliente':
            return <ClienteRoutes />;
        default:
            //Return em caso de erro
            return <PublicRoutes />;
    }
}

