/**
 * Retorna uma data no formato yyyy-MM-dd usando os componentes LOCAIS do navegador
 * (ano/mês/dia), sem nenhuma conversão de fuso horário.
 *
 * NUNCA use `date.toISOString().split('T')[0]` para isso: toISOString() converte
 * a data para UTC antes de formatar, o que troca o dia sempre que o horário local
 * já passou da meia-noite UTC (ex: qualquer horário após as 21h no Brasil, UTC-3).
 * Essa confusão já causou datas de consulta salvas com 1 dia de diferença da data
 * real em várias telas do sistema.
 */
export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
