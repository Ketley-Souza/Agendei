import React, { useState } from "react";
import InputFloatingLabel from "../../../components/InputFloatingLabel";
import { Link } from "react-router-dom";

export default function Cadastro() {
    // Declarando o state para sexo
    const [sexo, setSexo] = useState("");

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

                    <form className="space-y-5">
                        <InputFloatingLabel
                            id="nome"
                            type="text"
                            label="Nome completo"
                            required
                        />
                        <InputFloatingLabel
                            id="email"
                            type="email"
                            label="Email"
                            required
                        />
                        <InputFloatingLabel
                            id="telefone"
                            type="tel"
                            label="Telefone"
                            required
                        />
                        <InputFloatingLabel
                            id="dataNascimento"
                            type="date"
                            label="Data de nascimento"
                            required
                        />

                        {/* Campo de seleção de sexo usando o mesmo InputFloatingLabel */}
                        <InputFloatingLabel
                            id="sexo"
                            type="select"
                            label="Sexo"
                            options={["Masculino", "Feminino"]}
                            required
                        />

                        <InputFloatingLabel
                            id="password"
                            type="password"
                            label="Senha"
                            required
                        />
                        <InputFloatingLabel
                            id="confirmarSenha"
                            type="password"
                            label="Confirmar senha"
                            required
                        />

                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl py-3.5 mt-4 transition-colors shadow-md"
                        >
                            Cadastrar
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
