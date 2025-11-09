import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function InputFloatingLabel({ id, type, label, required = false }) {
    const [mostrarSenha, setMostrarSenha] = useState(false);

    // Se for tipo password, alterna o type
    const tipoInput = type === "password" && mostrarSenha ? "text" : type;

    return (
        <div className="relative">
            <input
                id={id}
                type={tipoInput}
                required={required}
                placeholder=" "
                className={`peer w-full border border-gray-300 border-solid rounded-xl p-3.5 pr-10 
                    bg-white text-gray-900 placeholder-transparent 
                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                    transition-all duration-200`}
            />

            <label
                htmlFor={id}
                className="absolute left-3.5 top-3.5 bg-white px-1 text-gray-500 
                    transition-all duration-200 ease-in-out
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600
                    peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-yellow-600"
            >
                {label}
            </label>

            {/* Olhinho — só aparece se o tipo for password */}
            {type === "password" && (
                <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                    {mostrarSenha ? (
                        <EyeSlash size={22} weight="bold" />
                    ) : (
                        <Eye size={22} weight="bold" />
                    )}
                </button>
            )}
        </div>
    );
}
