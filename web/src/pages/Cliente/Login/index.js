import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fazerLogin } from "../../../store/slices/authSlice";
import { Link } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !senha) {
            return;
        }
        const result = await dispatch(fazerLogin({ email, senha }));
        if (fazerLogin.fulfilled.match(result)) {
            const usuario = result.payload;
            if (usuario.tipo === 'salao') {
                navigate('/servicos');
            } else if (usuario.tipo === 'colaborador') {
                navigate('/agendamentos');
            } else {
                navigate('/agendamento');
            }
        }
    };
    return (
        <div
            className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/salao-login3.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md min-h-[480px] flex flex-col justify-center">
                    {/* Botão voltar */}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="absolute left-10 top-12 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Voltar para a Home"
                    >
                        <CaretLeft size={20} weight="bold" />
                    </button>
                    <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
                        Faça login
                    </h2>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 placeholder-transparent 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            />
                            <label
                                htmlFor="email"
                                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                                    transition-all duration-200 ease-in-out
                                    ${email ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
                            >
                                Email
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 placeholder-transparent 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            />
                            <label
                                htmlFor="password"
                                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                                    transition-all duration-200 ease-in-out
                                    ${senha ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
                            >
                                Senha
                            </label>
                            <div className="text-sm text-right text-gray-500 mt-4 hover:underline cursor-pointer">
                                Esqueceu sua senha?
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 mt-4 transition-colors shadow-md"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500 mt-8">
                        Ainda não tem uma conta?{" "}
                        <Link
                            to="/cadastro"
                            className="text-gray-800 hover:text-yellow-600 hover:underline transition-colors cursor-pointer"
                        >
                            Cadastre-se
                        </Link>
                    </div>

                    <div className="mt-4 text-xs text-center text-gray-800">
                        <a href="#" className="hover:underline">
                            Termos de uso
                        </a>{" "}
                        ·{" "}
                        <a href="#" className="hover:underline">
                            Políticas de privacidade
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
