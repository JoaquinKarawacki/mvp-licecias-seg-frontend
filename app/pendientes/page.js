"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import { formatearDias } from "@/librerias/fechas";
import RutaProtegida from "@/componentes/RutaProtegida";
import EstadoBadge from "@/componentes/EstadoBadge";

export default function PaginaPendientes() {
  const { usuario } = usarAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Para el motivo de rechazo: guardamos qué solicitud está en modo "rechazar"
  // y el texto del motivo
  const [rechazandoId, setRechazandoId] = useState(null);
  const [motivo, setMotivo] = useState("");

  function cargarPendientes() {
    pedirApi("/solicitudes/pendientes")
      .then((datos) => setSolicitudes(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    if (!usuario) return;
    cargarPendientes();
  }, [usuario]);

  async function aprobar(id) {
    setError("");
    try {
      await pedirApi(`/solicitudes/${id}/aprobar`, { metodo: "PATCH" });
      cargarPendientes();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmarRechazo(id) {
    setError("");
    if (!motivo.trim()) {
      setError("Escribí un motivo para rechazar.");
      return;
    }
    try {
      await pedirApi(`/solicitudes/${id}/rechazar`, {
        metodo: "PATCH",
        cuerpo: { motivo_rechazo: motivo },
      });
      // Limpiamos el modo rechazo y recargamos
      setRechazandoId(null);
      setMotivo("");
      cargarPendientes();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RutaProtegida>
      <h1 className="text-2xl font-black text-gray-900 mb-8">
        Solicitudes Pendientes
      </h1>

      {cargando && (
        <p className="text-sm text-gray-400">Cargando pendientes...</p>
      )}

      {error && (
        <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
      )}

      {!cargando && !error && solicitudes.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay solicitudes pendientes.
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
                  {solicitud.empleado?.nombre} {solicitud.empleado?.apellido}
                </h2>
                <p className="text-sm text-gray-500">
                  {solicitud.tipo_licencia?.nombre} ·{" "}
                  {formatearDias(solicitud.dias)}
                </p>
              </div>
              <EstadoBadge estado={solicitud.estado} />
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Días descontados: {solicitud.dias_descontados}
            </p>

            {solicitud.comentario && (
              <p className="text-sm text-gray-500 mb-3">
                Comentario: {solicitud.comentario}
              </p>
            )}

            {/* Si esta solicitud está en modo rechazo, mostramos el campo */}
            {rechazandoId === solicitud.id ? (
              <div className="mt-4">
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo del rechazo..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2
                             focus:outline-none focus:border-[#ca3517]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmarRechazo(solicitud.id)}
                    className="bg-[#ca3517] text-white px-6 py-1.5 rounded-full
                               font-semibold text-sm hover:bg-[#a82d12]
                               transition-colors duration-200"
                  >
                    Confirmar rechazo
                  </button>
                  <button
                    onClick={() => {
                      setRechazandoId(null);
                      setMotivo("");
                    }}
                    className="text-gray-500 px-4 py-1.5 text-sm font-medium
                               hover:text-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => aprobar(solicitud.id)}
                  className="bg-[#ca3517] text-white px-6 py-1.5 rounded-full
                             font-semibold text-sm hover:bg-[#a82d12]
                             transition-colors duration-200"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => {
                    setRechazandoId(solicitud.id);
                    setMotivo("");
                  }}
                  className="border-2 border-[#ca3517] text-[#ca3517] px-6 py-1.5
                             rounded-full font-semibold text-sm hover:bg-[#ca3517]
                             hover:text-white transition-colors duration-200"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </RutaProtegida>
  );
}