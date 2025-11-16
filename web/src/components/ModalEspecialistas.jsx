import React from "react";
import { X } from "lucide-react";
import { urlImagem } from "../../services/api";

const ModalEspecialistas = ({
    open,
    onClose,
    especialistas,
    onSelect,
}) => {
    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                animation: "fade .2s ease",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                    animation: "scale .2s ease",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                    }}
                >
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 600 }}>Escolher especialista</h3>

                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Lista */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {especialistas.map((esp) => (
                        <div
                            key={esp._id}
                            onClick={() => onSelect(esp)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "14px",
                                borderRadius: "12px",
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                                transition: ".2s",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#fafafa")
                            }
                            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                        >
                            <img
                                src={
                                    esp.foto ? urlImagem(esp.foto) : "https://via.placeholder.com/60"
                                }
                                alt={esp.nome}
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />

                            <div>
                                <p style={{ fontWeight: 600, color: "#333" }}>{esp.nome}</p>
                                <p style={{ color: "#777", fontSize: "0.9rem" }}>
                                    {esp.especialidade || "Profissional"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* animações */}
            <style>
                {`
        @keyframes fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes scale {
          from { transform: scale(.93); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        `}
            </style>
        </div>
    );
};

export default ModalEspecialistas;
