import React from "react";

const DrawerServicos = ({ open, onClose, servicos = [], onSelect }) => {
    const drawerHeight = open ? "90%" : "60px";

    const toggleDrawer = () => {
        if (onClose) onClose(!open);
    };

    return (
        <div
            style={{ height: drawerHeight }}
            className="fixed bottom-0 left-0 w-full bg-white shadow-xl rounded-t-xl transition-all duration-300 overflow-hidden"
        >
            {/* Cabeçalho */}
            <div
                className="w-full bg-yellow-600 text-white py-3 px-4 cursor-pointer flex justify-between items-center"
                onClick={toggleDrawer}
            >
                <span>Selecione um serviço</span>
                <span>{open ? "↓" : "↑"}</span>
            </div>

            {/* Corpo do drawer */}
            {open && (
                <div className="p-4 overflow-y-auto h-full">
                    {servicos.length === 0 ? (
                        <p>Nenhum serviço encontrado.</p>
                    ) : (
                        servicos.map((s) => (
                            <div
                                key={s._id}
                                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                                onClick={() => onSelect && onSelect(s)}
                            >
                                <strong>{s.nomeServico}</strong>
                                <p>R$ {s.preco}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DrawerServicos;
