// Convierte "2026-07-01T00:00:00.000Z" en fecha LOCAL (evita el corrimiento por UTC-3)
export function aFechaLocal(valor) {
  const [anio, mes, dia] = valor.split("T")[0].split("-");
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
}

function esConsecutivo(anterior, fecha) {
  const unDiaMs = 24 * 60 * 60 * 1000;
  return fecha - anterior === unDiaMs;
}

// Da formato a un array de dias ({ fecha }) de una solicitud:
// - Consecutivos y MAS de 3 -> rango ("01/07/2026 al 05/07/2026")
// - Con algun salto, o pocos dias -> listado ("01/07/2026, 03/07/2026 y 05/07/2026")
export function formatearDias(dias) {
  if (!dias || dias.length === 0) return "-";

  const fechas = dias.map((d) => aFechaLocal(d.fecha)).sort((a, b) => a - b);

  const sonConsecutivos = fechas.every(
    (fecha, i) => i === 0 || esConsecutivo(fechas[i - 1], fecha)
  );

  if (sonConsecutivos && fechas.length > 3) {
    const desde = fechas[0].toLocaleDateString("es-UY");
    const hasta = fechas[fechas.length - 1].toLocaleDateString("es-UY");
    return `${desde} al ${hasta}`;
  }

  const textos = fechas.map((f) => f.toLocaleDateString("es-UY"));
  if (textos.length === 1) return textos[0];
  return `${textos.slice(0, -1).join(", ")} y ${textos[textos.length - 1]}`;
}
