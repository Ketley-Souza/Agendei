export function filterAgendamentos(payload) {
  return {
    type: '@agendamento/FILTER_REQUEST',
    payload,
  };
}
