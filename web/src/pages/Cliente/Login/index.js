import React from "react";
import InputFloatingLabel from "../../../components/InputFloatingLabel";
import { Link } from "react-router-dom";

// Import moderno — React 17+ não precisa mais do "import React from 'react'"
export default function Login() {
    return (
        <div
            className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/salao-login3.jpg')" }}
        >
            {/* Overlay escuro para contraste */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal de login */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md min-h-[480px] flex flex-col justify-center">
                    <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
                        Faça login
                    </h2>

                    <form className="space-y-6">
                        {/* Campos de entrada reutilizáveis */}
                        <InputFloatingLabel
                            id="email"
                            type="email"
                            label="Email"
                            required
                        />

                        <div>
                            <InputFloatingLabel
                                id="password"
                                type="password"
                                label="Senha"
                                required
                            />
                            <div className="text-sm text-right text-gray-500 mt-4 hover:underline cursor-pointer">
                                Esqueceu sua senha?
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl py-3.5 mt-4 transition-colors shadow-md"
                        >
                            Entrar
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
