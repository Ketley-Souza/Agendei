import React, { useState } from "react";

const DropdownEspecialistas = ({ especialistas = [], onSelect }) => {
  const [selecionado, setSelecionado] = useState("");

  const handleChange = (e) => {
    const nome = e.target.value;
    setSelecionado(nome);
    onSelect && onSelect(nome);
  };

  return (
    <select
      value={selecionado}
      onChange={handleChange}
      className="w-full border rounded-lg px-3 py-2"
    >
      <option value="">Selecione o especialista</option>
      {especialistas.map((esp) => (
        <option key={esp.id} value={esp.nome}>
          {esp.nome}
        </option>
      ))}
    </select>
  );
};

export default DropdownEspecialistas;
