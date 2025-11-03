
export const formatarDuracao = (minutos) => {
  if (!minutos || minutos === 0) return '0min';
  
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  if (horas > 0 && mins > 0) {
    return `${horas}h${mins.toString().padStart(2, '0')}min`;
  } else if (horas > 0) {
    return `${horas}h00min`;
  } else {
    return `${mins}min`;
  }
};
export const duracaoParaMinutos = (duracaoStr) => {
  if (!duracaoStr) return 0;
  
  // Se já é número, retorna
  if (typeof duracaoStr === 'number') return duracaoStr;
  
  const str = duracaoStr.toString().toLowerCase();
  
  // Padrão: "1h30min", "1h", "30min"
  const match = str.match(/(?:(\d+)h)?(?:(\d+)(?:min)?)?/);
  
  if (!match) return 0;
  
  const horas = parseInt(match[1] || 0);
  const minutos = parseInt(match[2] || 0);
  
  return horas * 60 + minutos;
};
export const calcularDuracaoTotal = (servicos) => {
  if (!servicos || !Array.isArray(servicos)) return 0;
  
  return servicos.reduce((total, servico) => {
    const duracao = servico.duracao || 0;
    return total + duracao;
  }, 0);
};

