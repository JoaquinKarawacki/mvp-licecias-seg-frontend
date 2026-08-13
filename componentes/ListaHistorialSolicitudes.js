import { formatearDias } from "@/librerias/fechas";
import EstadoBadge from "@/componentes/EstadoBadge";

export default function ListaHistorialSolicitudes({ solicitudes }) {
  if (solicitudes.length === 0) {
    return (
      <p className="text-sm text-gray-400">Sin solicitudes registradas.</p>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((solicitud) => (
        <div key={solicitud.id} className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {solicitud.tipo_licencia?.nombre}
              </h3>
              <p className="text-sm text-gray-500">
                {formatearDias(solicitud.dias)}
              </p>
            </div>
            <EstadoBadge estado={solicitud.estado} />
          </div>

          <p className="text-sm text-gray-600">
            Días descontados: {solicitud.dias_descontados}
          </p>

          {solicitud.comentario && (
            <p className="text-sm text-gray-500 mt-1">
              Comentario: {solicitud.comentario}
            </p>
          )}

          {solicitud.motivo_rechazo && (
            <p className="text-sm text-[#ca3517] mt-1">
              Motivo de rechazo: {solicitud.motivo_rechazo}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
