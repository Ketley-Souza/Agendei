import { useState, useRef } from "react";
import { CaretDown, UserCircle } from "@phosphor-icons/react";
import { urlImagem } from "../services/api";

export default function EspecialistaPicker({
    colaboradores = [],
    selecionado = null,
    onSelect,
}) {
    const [aberto, setAberto] = useState(false);
    const boxRef = useRef(null);

    const especialistaSelecionado = colaboradores.find(
        (c) => c._id === selecionado
    );

    return (
        <div className="relative mb-4" ref={boxRef}>
            <label className="block text-gray-700 font-semibold mb-1 text-sm">
                Especialista
            </label>

            {/* INPUT */}
            <div
                onClick={() => setAberto((p) => !p)}
                className={`
                    flex items-center justify-between w-full px-3 py-2 border border-solid rounded-lg cursor-pointer
                    bg-white transition-all
                    ${aberto ? "border-yellow-600 shadow-[0_0_0_2px_rgba(251,191,36,0.25)]" : "border-gray-300"}
                `}
            >
                <div className="flex items-center gap-2">
                    <UserCircle
                        size={20}
                        className={aberto ? "text-yellow-600" : "text-gray-400"}
                    />
                    <span className={especialistaSelecionado ? "text-gray-800" : "text-gray-400"}>
                        {especialistaSelecionado
                            ? especialistaSelecionado.nome
                            : "Selecione um especialista"}
                    </span>
                </div>

                <CaretDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${aberto ? "rotate-180 text-yellow-600" : "rotate-0"
                        }`}
                />
            </div>

            {/* DROPDOWN */}
            {aberto && (
                <div
                    className="
                        absolute left-0 right-0 mt-2 rounded-xl bg-white shadow-2xl z-30 border border-gray-200 
                        overflow-hidden animate-fadeIn
                    "
                >
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1 no-scrollbar">
                        {colaboradores.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-3">
                                Nenhum especialista encontrado
                            </p>
                        )}

                        {colaboradores.map((c) => (
                            <div
                                key={c._id}
                                onClick={() => {
                                    onSelect(c._id);
                                    setAberto(false);
                                }}
                                className={`
                                    flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition border
                                    ${selecionado === c._id
                                        ? "bg-yellow-100 border-yellow-600"
                                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                                    }
                                `}
                            >
                                <img
                                    src={
                                        c.foto
                                            ? urlImagem(c.foto)
                                            : "https://via.placeholder.com/50"
                                    }
                                    alt={c.nome}
                                    className="w-10 h-10 rounded-full object-cover"
                                />

                                <div>
                                    <p className="font-medium text-sm text-gray-800">{c.nome}</p>
                                    <p className="text-xs text-gray-500">{c.email ?? "Sem e-mail"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
