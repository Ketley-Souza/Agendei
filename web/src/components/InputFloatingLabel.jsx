import { useState, useRef } from "react";
import { EyeIcon, EyeSlashIcon, CalendarDotsIcon } from "@phosphor-icons/react";

export default function InputFloatingLabel({ id, type, label, required = false }) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [valor, setValor] = useState("");
    const inputRef = useRef(null);

    const tipoInput = type === "password" && mostrarSenha ? "text" : type;

    return (
        <div className="relative">
            <input
                ref={inputRef}
                id={id}
                type={tipoInput}
                required={required}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder=" "
                className="peer input-date w-full border border-gray-300 border-solid rounded-xl p-3.5 pr-10 
                    bg-white text-gray-900 placeholder-transparent 
                    outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500
                    transition-all duration-200`"
            />

            <label
                htmlFor={id}
                className={`absolute left-3.5 bg-white px-1 text-gray-500 
                    transition-all duration-200 ease-in-out
                    ${valor ? "-top-2 text-xs text-yellow-600" : "top-3.5 text-base text-gray-400"}
                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-yellow-600`}
            >
                {label}
            </label>

            {/* Ícone para senha */}
            {
                type === "password" && (
                    <button
                        type="button"
                        onClick={() => setMostrarSenha((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {mostrarSenha ? <EyeSlashIcon size={22} weight="regular" /> : <EyeIcon size={22} weight="regular" />}
                    </button>
                )
            }

            {/* Ícone para data que abre o calendário nativo */}
            {
                type === "date" && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.focus()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label="Abrir calendário"
                    >
                        <CalendarDotsIcon size={22} weight="regular" />
                    </button>
                )
            }
        </div >
    );
}
