//TESTE PARA ADIIÇÃO DE HORÁRIO - REMOVER APÓS TESTES


import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addHorario, updateHorario } from '../../store/slices/horarioSlice';
import { toast, Toaster } from 'react-hot-toast';

export default function TestHorario() {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        salaoId: '609310a1002ab333d1ae1716',
        dias: '',
        inicio: '',
        fim: '',
        especialidades: '',
        colaboradores: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🔹 Validação simples antes de enviar
        if (!form.inicio || !form.fim || !form.dias || !form.especialidades || !form.colaboradores) {
            return toast.error('Preencha todos os campos obrigatórios!');
        }

        // Converte tipos para o formato esperado pelo backend
        const payload = {
            salaoId: form.salaoId,
            dias: form.dias.split(',').map((d) => parseInt(d.trim())),
            inicio: new Date(form.inicio),
            fim: new Date(form.fim),
            especialidades: form.especialidades.split(',').map((id) => id.trim()),
            colaboradores: form.colaboradores.split(',').map((id) => id.trim()),
        };

        dispatch(updateHorario({ horario: payload }));
        dispatch(addHorario());
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <Toaster position="top-right" />
            <h2 className="text-xl font-bold mb-4">Teste de Criação de Horário</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block">Dias (ex: 1,3,5)</label>
                    <input name="dias" value={form.dias} onChange={handleChange} className="border p-2 w-full" />
                </div>

                <div>
                    <label className="block">Início</label>
                    <input type="datetime-local" name="inicio" value={form.inicio} onChange={handleChange} className="border p-2 w-full" />
                </div>

                <div>
                    <label className="block">Fim</label>
                    <input type="datetime-local" name="fim" value={form.fim} onChange={handleChange} className="border p-2 w-full" />
                </div>

                <div>
                    <label className="block">Especialidades (IDs separados por vírgula)</label>
                    <input name="especialidades" value={form.especialidades} onChange={handleChange} className="border p-2 w-full" />
                </div>

                <div>
                    <label className="block">Colaboradores (IDs separados por vírgula)</label>
                    <input name="colaboradores" value={form.colaboradores} onChange={handleChange} className="border p-2 w-full" />
                </div>

                <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
                    Enviar Horário
                </button>
            </form>
        </div>
    );
}
