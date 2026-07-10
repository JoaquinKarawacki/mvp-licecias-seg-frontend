// Convierte "2026-07-01T00:00:00.000Z" en fecha LOCAL (evita el corrimiento por UTC-3)
export function aFechaLocal(valor) {
  const [anio, mes, dia] = valor.split("T")[0].split("-");
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
}

function esConsecutivo(anterior, fecha) {
  const unDiaMs = 24 * 60 * 60 * 1000;
  return fecha - anterior === unDiaMs;
}

// Separa un array de fechas (ya ordenado) en tramos de dias consecutivos.
// Ej: [13,14,15,16,17,20,21,22] -> [[13..17], [20,21,22]]
function agruparConsecutivos(fechas) {
  const grupos = [[fechas[0]]];
  for (let i = 1; i < fechas.length; i++) {
    if (esConsecutivo(fechas[i - 1], fechas[i])) {
      grupos[grupos.length - 1].push(fechas[i]);
    } else {
      grupos.push([fechas[i]]);
    }
  }
  return grupos;
}

// Da formato a un array de dias ({ fecha }) de una solicitud, tramo por tramo:
// - Cada tramo de MAS de 3 dias consecutivos -> rango ("13/07/2026 al 17/07/2026")
// - Tramos cortos o dias sueltos -> se listan uno por uno
// - Los tramos se combinan en un solo texto, ej:
//   "13/07/2026 al 17/07/2026, 20/07/2026, 21/07/2026 y 22/07/2026"
export function formatearDias(dias) {
  if (!dias || dias.length === 0) return "-";

  const fechas = dias.map((d) => aFechaLocal(d.fecha)).sort((a, b) => a - b);
  const grupos = agruparConsecutivos(fechas);

  const segmentos = grupos.flatMap((grupo) => {
    if (grupo.length > 3) {
      const desde = grupo[0].toLocaleDateString("es-UY");
      const hasta = grupo[grupo.length - 1].toLocaleDateString("es-UY");
      return [`${desde} al ${hasta}`];
    }
    return grupo.map((f) => f.toLocaleDateString("es-UY"));
  });

  if (segmentos.length === 1) return segmentos[0];
  return `${segmentos.slice(0, -1).join(", ")} y ${segmentos[segmentos.length - 1]}`;
}
