import CalendarioPopover from "../../../components/Agendamento/CalendarioPopover";
import { useDispatch, useSelector } from "react-redux";
import { updateAgendamento } from "../../store/slices/salaoSlice";
import { filterAgenda } from "../../store/slices/salaoSlice";
import { format } from "date-fns";

export default function SelecaoData() {
  const dispatch = useDispatch();
  const { agendamento } = useSelector(state => state.salao);

  const handleSelectDate = (date) => {
    const formatted = format(date, "yyyy-MM-dd");

    dispatch(updateAgendamento({ key: "data", value: formatted }));

    // carrega horários para esse dia
    dispatch(filterAgenda());
  };

  return (
    <CalendarioPopover
      dataSelecionada={agendamento.data}
      onSelecionar={handleSelectDate}
    />
  );
}
