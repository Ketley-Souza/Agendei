//A página já mostra os serviços, horários e especialistas com dados simulados (mock).
//Quando o backend estiver ok, basta trocar um array por uma chamada api.get('/...').
//O botão AGENDAR já tem estrutura pra enviar o agendamento (mesmo que por enquanto só faça console.log).
//E ela já será integrada no routes.js sem quebrar nada.

import React from "react";

const Agendamento = () => {
  return (
    <div className="flex justify-center items-center h-full bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Agende um atendimento
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Selecione data, horário e profissional para criar o agendamento
        </p>

        {/* Serviços */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Serviços</h3>
          <div className="flex items-center gap-3">
            <img
              src="https://via.placeholder.com/60"
              alt="Serviço"
              className="rounded-lg"
            />
            <div>
              <p className="font-semibold">NOME PROCEDIMENTO</p>
              <p className="text-gray-500 text-sm">Total $1000</p>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Data</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            defaultValue="2024-10-01"
          />
        </div>

        {/* Horários */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Horários
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["09:00", "10:00", "11:00", "12:00", "19:00", "20:00", "21:00"].map(
              (hora) => (
                <button
                  key={hora}
                  className="border rounded-lg py-2 hover:bg-yellow-500 hover:text-white transition"
                >
                  {hora}
                </button>
              )
            )}
          </div>
        </div>

        {/* Especialista */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Especialista
          </label>
          <select className="w-full border rounded-lg px-3 py-2">
            <option>Nome do especialista</option>
          </select>
        </div>

        {/* Botão Agendar */}
        <button className="w-full bg-yellow-600 text-white font-semibold py-3 rounded-lg hover:bg-yellow-700 transition">
          AGENDAR
        </button>
      </div>
    </div>
  );
};

export default Agendamento;


