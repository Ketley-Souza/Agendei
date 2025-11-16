import React, { useEffect, useState, useMemo } from "react";
import { Check, MagnifyingGlassIcon } from "@phosphor-icons/react";

const DrawerServicos = ({ open, onClose, servicos = [], onSelect }) => {
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState("");

    // Permite fechar com tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => e.key === "Escape" && onClose(false);
        if (open) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // Filtro de busca
    const filteredServicos = useMemo(() => {
        const term = search.toLowerCase();
        return servicos.filter((s) =>
            s.nomeServico.toLowerCase().includes(term)
        );
    }, [servicos, search]);

    // Adicionar/remover seleção
    const toggleSelect = (servico) => {
        setSelected((prev) => {
            const exists = prev.some((s) => s._id === servico._id);
            const updated = exists
                ? prev.filter((s) => s._id !== servico._id)
                : [...prev, servico];
            return updated;
        });
    };

    // Fechar ao clicar fora
    const handleOutsideClick = (e) => {
        if (e.target.id === "drawer-overlay") {
            onClose(false);
        }
    };

    return (
        <>
            {/* Overlay que fecha ao clicar fora */}
            {open && (
                <div
                    id="drawer-overlay"
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-40"
                    onClick={handleOutsideClick}
                />
            )}

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                className={`fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-2xl 
                    transition-all duration-500 ease-in-out overflow-hidden flex flex-col font-catamaran z-50
                    ${open ? "translate-y-0 h-[90%]" : "translate-y-[calc(100%-32px)] h-[40px]"}
                `}
            >
                {/* Tracinho (sempre visível para abrir/fechar) */}
                <div
                    className="flex items-center justify-center pt-3 pb-2 cursor-pointer select-none"
                    onClick={() => onClose(!open)}
                >
                    <div className="w-14 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Conteúdo só aparece quando aberto */}
                {open && (
                    <>
                        {/* Cabeçalho */}
                        <div className="flex justify-center items-center pb-2 pt-2">
                            <span className="font-semibold text-gray-800 text-lg">
                                Selecione os serviços
                            </span>
                        </div>

                        {/* Campo de busca */}
                        <div className="relative w-full max-w-3xl mx-auto px-5 mb-3">
                            <MagnifyingGlassIcon
                                size={20}
                                className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="Pesquisar serviço..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 
                                    focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-700 
                                    placeholder-gray-400 transition-colors duration-200 ease-in-out font-opensans"
                            />
                        </div>

                        {/* Lista de serviços */}
                        <div className="flex-1 overflow-y-auto py-3">
                            <div className="max-w-3xl mx-auto px-5 space-y-3">
                                {filteredServicos.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-6 font-catamaran">
                                        Nenhum serviço encontrado.
                                    </p>
                                ) : (
                                    filteredServicos.map((s) => {
                                        const checked = selected.some(
                                            (sel) => sel._id === s._id
                                        );
                                        return (
                                            <button
                                                key={s._id}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // impede que feche ao clicar
                                                    toggleSelect(s);
                                                }}
                                                className={`w-full flex justify-between items-center rounded-xl px-4 py-4 text-left transition-all duration-200 shadow-sm
                                                    ${checked
                                                        ? "border-solid border-[1.5px] border-[#CDA327] bg-[#CDA327]/10"
                                                        : "bg-gray-50 hover:bg-[#CDA327]/5"
                                                    }`}
                                            >
                                                <div>
                                                    <p className="font-catamaran font-semibold text-gray-900">
                                                        {s.nomeServico}
                                                    </p>
                                                    <p className="font-opensans text-sm text-gray-500">
                                                        A partir de R$ {s.preco}
                                                    </p>
                                                </div>


                                                {/* Check circular */}
                                                <div
                                                    className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-200 ${checked
                                                        ? "border-[#CDA327] bg-[#CDA327]"
                                                        : "border-solid border-[1.5px] border-gray-200 bg-gray-100"
                                                        }`}
                                                >
                                                    {checked && (
                                                        <Check
                                                            size={14}
                                                            weight="bold"
                                                            className="text-white transition-transform scale-100"
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Rodapé */}
                        <div className="border-t bg-white">
                            <div className="max-w-3xl mx-auto px-5 py-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelect(selected);
                                        onClose(false);
                                    }}
                                    disabled={!selected.length}
                                    className={`w-full py-3 font-semibold text-lg rounded-xl transition-all duration-200 ${selected.length
                                        ? "bg-[#CDA327] text-white hover:bg-yellow-600"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    Confirmar ({selected.length})
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default DrawerServicos;
