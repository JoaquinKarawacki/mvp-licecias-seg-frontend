"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import { formatearDias } from "@/librerias/fechas";
import RutaProtegida from "@/componentes/RutaProtegida";
import EstadoBadge from "@/componentes/EstadoBadge";

export default function PaginaSolicitudes() {
  const { usuario } = usarAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Funcion para traer las solicitudes (la usamos al cargar y al cancelar)
  function cargarSolicitudes() {
    pedirApi("/solicitudes/mias")
      .then((datos) => setSolicitudes(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    if (!usuario) return;
    cargarSolicitudes();
  }, [usuario]);

  async function cancelar(id) {
    try {
      await pedirApi(`/solicitudes/${id}/cancelar`, { metodo: "PATCH" });
      cargarSolicitudes(); // recargamos para ver el nuevo estado
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RutaProtegida>
      <h1 className="text-2xl font-black text-gray-900 mb-8">Mis Solicitudes</h1>

      {cargando && (
        <p className="text-sm text-gray-400">Cargando solicitudes...</p>
      )}

      {error && (
        <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
      )}

      {!cargando && !error && solicitudes.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no hiciste ninguna solicitud.
        </p>
      )}

      <div className="space-y-4">
        {solicitudes.map((solicitud) => (
          <div
            key={solicitud.id}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-900">
                  {solicitud.tipo_licencia?.nombre}
                </h2>
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

            {solicitud.estado === "PENDIENTE" && (
              <button
                onClick={() => cancelar(solicitud.id)}
                className="mt-4 border-2 border-[#ca3517] text-[#ca3517] px-6 py-1.5
                           rounded-full font-semibold text-sm hover:bg-[#ca3517]
                           hover:text-white transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </RutaProtegida>
  );
}