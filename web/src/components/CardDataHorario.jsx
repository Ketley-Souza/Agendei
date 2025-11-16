import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
    CalendarBlank,
    CaretDown,
    User as UserIcon,
} from "@phosphor-icons/react";

export default function CardDataHorario({
    data,
    onChangeDate,
    horarios = [],
    onSelectHora,
    horaSelecionada,

    especialistas = [],
    especialistaSelecionado,
    onSelectEspecialista
}) {

    const today = new Date();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSelect, setShowSelect] = useState(false);
    const calendarRef = useRef(null);

    /* Fecha o calendário ao clicar fora */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
                setShowSelect(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* =====================
        ORGANIZAR HORÁRIOS
    ====================== */
    const separarHorariosPorPeriodo = (horarios) => {
        const manha = [], tarde = [], noite = [];

        horarios.forEach((hora) => {
            const h = parseInt(hora.split(":")[0], 10);
            if (h >= 6 && h < 12) manha.push(hora);
            else if (h >= 12 && h < 18) tarde.push(hora);
            else noite.push(hora);
        });

        return { manha, tarde, noite };
    };

    const { manha, tarde, noite } = separarHorariosPorPeriodo(horarios);

    /* =====================
         DRAG SCROLL
    ====================== */
    const useDragScroll = () => {
        const ref = useRef(null);
        const isDown = useRef(false);
        const startX = useRef(0);
        const scrollLeft = useRef(0);

        const onMouseDown = (e) => {
            isDown.current = true;
            startX.current = e.pageX - ref.current.offsetLeft;
            scrollLeft.current = ref.current.scrollLeft;
        };

        const onMouseLeave = () => (isDown.current = false);
        const onMouseUp = () => (isDown.current = false);

        const onMouseMove = (e) => {
            if (!isDown.current) return;
            e.preventDefault();
            const x = e.pageX - ref.current.offsetLeft;
            const walk = (x - startX.current) * 1.5;
            ref.current.scrollLeft = scrollLeft.current - walk;
        };

        return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
    };

    const dragManha = useDragScroll();
    const dragTarde = useDragScroll();
    const dragNoite = useDragScroll();

    /* =====================
         RENDER PERIODOS
    ====================== */
    const renderPeriod = (titulo, lista, drag) => (
        <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">{titulo}</p>

            {lista.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum horário disponível</p>
            ) : (
                <div
                    ref={drag.ref}
                    onMouseDown={drag.onMouseDown}
                    onMouseLeave={drag.onMouseLeave}
                    onMouseUp={drag.onMouseUp}
                    onMouseMove={drag.onMouseMove}
                    className="flex gap-2 overflow-x-auto no-scrollbar py-1 cursor-grab active:cursor-grabbing select-none"
                >
                    {lista.map((hora) => (
                        <button
                            key={hora}
                            onClick={() => onSelectHora(hora)}
                            className={`min-w-[64px] px-3 py-2 rounded-xl border text-sm transition-all
                                ${hora === horaSelecionada
                                    ? "border-yellow-500 bg-yellow-50 text-yellow-700 font-medium"
                                    : "border-gray-300 bg-gray-100 text-gray-700"
                                }
                                hover:border-black hover:bg-white
                            `}
                        >
                            {hora}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    /* =====================
         COMPONENTE FINAL
    ====================== */
    return (
        <div className="rounded-2xl bg-white">

            {/* ============================
                INPUT DE DATA (ESTILO DA IMAGEM)
            ============================ */}

            <label className="text-sm font-medium text-gray-700 mb-1">Data</label>

            <div className="relative mb-4">
                <div
                    onClick={() => setShowCalendar((prev) => !prev)}
                    className={` group flex items-center justify-between w-full p-3 rounded-xl cursor-pointer transition-all bg-white border border-solid
                        ${showCalendar ? "border-yellow-600 shadow-[0_0_0_3px_rgba(251,191,36,0.2)]" : "border-gray-300"}
                    `}
                >
                    <div className="flex items-center gap-2">
                        <CalendarBlank
                            size={20}
                            className={`transition-colors
                    ${showCalendar ? "text-yellow-600" : "text-gray-400"}
                `}
                        />
                        <span
                            className={`
                    transition-colors
                    ${data ? "text-gray-700" : "text-gray-400"}
                `}
                        >
                            {data
                                ? new Date(data).toLocaleDateString("pt-BR")
                                : "Selecione a data"}
                        </span>
                    </div>

                    <CaretDown
                        size={20}
                        className={`
                text-gray-400 transition-transform duration-200
                ${showCalendar ? "rotate-180 text-yellow-600" : "rotate-0"}
            `}
                    />
                </div>

                {showCalendar && (
                    <div
                        className="
                absolute left-0 right-0 mt-2 z-20 rounded-2xl overflow-hidden 
                bg-white shadow-2xl animate-fadeIn border border-gray-200
            "
                    >
                        <DayPicker
                            mode="single"
                            selected={data}
                            onSelect={(day) => {
                                if (day && day >= today) {
                                    onChangeDate(day);
                                    setShowCalendar(false);
                                }
                            }}
                            disabled={{ before: today }}
                            className="p-3 modern-calendar"
                        />
                    </div>
                )}
            </div>
            {/* ============================
                    HORÁRIOS
            ============================ */}
            <p className="text-sm font-medium text-gray-700 mb-2">Horários</p>

            {renderPeriod("Manhã", manha, dragManha)}
            {renderPeriod("Tarde", tarde, dragTarde)}
            {renderPeriod("Noite", noite, dragNoite)}

        </div>
    );
}
