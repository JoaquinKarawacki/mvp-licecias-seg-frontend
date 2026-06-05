const ESTILOS = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  APROBADA: "bg-green-50 text-green-700 border-green-200",
  RECHAZADA: "bg-red-50 text-red-700 border-red-200",
  CANCELADA: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function EstadoBadge({ estado }) {
  const estilo = ESTILOS[estado] || ESTILOS.CANCELADA;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${estilo}`}
    >
      {estado}
    </span>
  );
}