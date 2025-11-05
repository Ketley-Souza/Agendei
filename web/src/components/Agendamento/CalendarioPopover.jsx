// src/components/Agendamento/CalendarioPopover.jsx
import React, { useState } from "react";

const CalendarioPopover = ({ onSelect, defaultDate = "" }) => {
  const [data, setData] = useState(defaultDate);

  const handleChange = (e) => {
    setData(e.target.value);
    onSelect && onSelect(e.target.value);
  };

  return (
    <div>
      <input
        type="date"
        value={data}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
};

export default CalendarioPopover;
