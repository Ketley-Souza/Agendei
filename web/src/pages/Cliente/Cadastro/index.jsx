import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cadastrarCliente } from "../../../store/slices/authSlice";
import { Link } from "react-router-dom";
import CONSTS from "../../../consts";

export default function Cadastro() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [sexo, setSexo] = useState("Masculino");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nome || !email || !telefone || !senha) {
            return;
        }
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }
        const dadosCliente = {
            nome,
            email,
            telefone,
            dataNascimento: dataNascimento || new Date().toISOString().split('T')[0],
            sexo,
            senha,
            salaoId: CONSTS.salaoId,
        };
        const result = await dispatch(cadastrarCliente(dadosCliente));
        if (cadastrarCliente.fulfilled.match(result)) {
            navigate('/agendamento');
        }
    };

    return (
        <div
            className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/salao-login3.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md min-h-[580px] flex flex-col justify-center">
                    <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
                        Criar conta
                    </h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 placeholder-transparent 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            />
                            <label
                                htmlFor="nome"
                                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                                    transition-all duration-200 ease-in-out
                                    ${nome ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
                            >
                                Nome completo
                            </label>
                        </div>

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
                                id="telefone"
                                type="tel"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 placeholder-transparent 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            />
                            <label
                                htmlFor="telefone"
                                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                                    transition-all duration-200 ease-in-out
                                    ${telefone ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
                            >
                                Telefone
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                id="dataNascimento"
                                type="date"
                                value={dataNascimento}
                                onChange={(e) => setDataNascimento(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 placeholder-transparent 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            />
                            <label
                                htmlFor="dataNascimento"
                                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                                    transition-all duration-200 ease-in-out
                                    ${dataNascimento ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
                            >
                                Data de nascimento
                            </label>
                        </div>

                        <div className="relative">
                            <select
                                id="sexo"
                                value={sexo}
                                onChange={(e) => setSexo(e.target.value)}
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            >
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                            <label
                                htmlFor="sexo"
                                className="absolute left-3.5 bg-white px-1 text-gray-500 
                                    -top-2 text-xs text-yellow-600"
                            >
                                Sexo
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
                        </div>

                        <div className="relative">
                            <input
                                id="confirmarSenha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder=" "
                                required
                                className="peer w-full border border-gray-300 border-solid rounded-xl p-3.5 
                                    bg-white text-gray-900 placeholder-transparent 
                                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                                    transition-all duration-200"
                            />
                            <label
                                htmlFor="confirmarSenha"
                                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                                    transition-all duration-200 ease-in-out
                                    ${confirmarSenha ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
                            >
                                Confirmar senha
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 mt-4 transition-colors shadow-md"
                        >
                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500 mt-8">
                        Já tem uma conta?{" "}
                        <Link
                            to="/login"
                            className="text-gray-800 hover:text-yellow-600 hover:underline transition-colors cursor-pointer"
                        >
                            Faça login
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
