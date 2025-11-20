import { useState, useRef } from "react";
import { CaretDown, UserCircle } from "@phosphor-icons/react";
import { urlImagem } from "../../services/api";

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
            <label className="text-sm font-medium text-gray-700 mb-1 block">
                Especialista
            </label>

            <div
                onClick={() => setAberto((p) => !p)}
                className={`flex items-center justify-between w-full p-3 rounded-xl cursor-pointer transition-all bg-white border border-solid
                    ${aberto ? "border-[#CDA327]/50 shadow-[0_0_0_3px_rgba(205,163,39,0.15)]" : "border-gray-300"}
                `}
            >
                <div className="flex items-center gap-2">
                    <UserCircle
                        size={20}
                        className={`transition-colors ${aberto ? "text-[#CDA327]" : "text-gray-400"}`}
                    />
                    <span className={`transition-colors ${especialistaSelecionado ? "text-gray-700" : "text-gray-400"}`}>
                        {especialistaSelecionado
                            ? especialistaSelecionado.nome
                            : "Selecione um especialista"}
                    </span>
                </div>

                <CaretDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-200 ${aberto ? "rotate-180 text-[#CDA327]" : "rotate-0"}`}
                />
            </div>

            {aberto && (
                <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white shadow-xl z-30 border border-gray-200 animate-fadeIn">
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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                                    ${selecionado === c._id
                                        ? "bg-gray-100 border-2 border-gray-300"
                                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
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
                                    className="w-14 h-14 rounded-full object-cover"
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
