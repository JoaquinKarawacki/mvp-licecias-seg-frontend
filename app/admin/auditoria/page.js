"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

// Muestra el timestamp ISO (UTC) en hora local de Uruguay.
// Acá SÍ queremos hora local: es el momento exacto en que pasó la acción.
function formatearFechaHora(valor) {
  return new Date(valor).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Color del badge según el tipo de acción.
// Verde: crear/aprobar. Rojo: eliminar/rechazar. Ámbar: ajustes/cambios. Gris: cancelar.
function claseAccion(accion) {
  if (/(CREAD|APROBAD|GENERAD)/.test(accion)) {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (/(ELIMINAD|RECHAZAD)/.test(accion)) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (/(CANCELAD)/.test(accion)) {
    return "bg-gray-100 text-gray-600 border-gray-200";
  }
  // actualizado, ajustado, contraseña cambiada, etc.
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function PaginaAdminAuditoria() {
  const { usuario } = usarAuth();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Filtros de vista (no tocan el backend)
  const [accionFiltro, setAccionFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!usuario) return;
    pedirApi("/auditoria")
      .then((datos) => setRegistros(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario]);

  // Lista de acciones únicas presentes en los datos, para el <select>
  const acciones = [...new Set(registros.map((r) => r.accion))].sort();

  // Aplicamos filtros sobre lo traído
  const registrosFiltrados = registros.filter((r) => {
    const coincideAccion = !accionFiltro || r.accion === accionFiltro;
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      !texto ||
      r.descripcion.toLowerCase().includes(texto) ||
      r.usuario_email.toLowerCase().includes(texto);
    return coincideAccion && coincideBusqueda;
  });

  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-black text-gray-900 mb-8">Auditoría</h1>

          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}

          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Buscar
              </label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Descripción o email"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64
                           focus:outline-none focus:border-[#ca3517]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Acción
              </label>
              <select
                value={accionFiltro}
                onChange={(e) => setAccionFiltro(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                           focus:outline-none focus:border-[#ca3517]"
              >
                <option value="">Todas</option>
                {acciones.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}

          {!cargando && registrosFiltrados.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay registros que coincidan.
            </p>
          )}

          {!cargando && registrosFiltrados.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="font-bold text-gray-700 px-4 py-3 whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="font-bold text-gray-700 px-4 py-3">Usuario</th>
                    <th className="font-bold text-gray-700 px-4 py-3">Acción</th>
                    <th className="font-bold text-gray-700 px-4 py-3">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatearFechaHora(r.fecha_creacion)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {r.usuario_email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold rounded-full border px-3 py-1 whitespace-nowrap ${claseAccion(
                            r.accion
                          )}`}
                        >
                          {r.accion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{r.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && registrosFiltrados.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {registrosFiltrados.length} registro
              {registrosFiltrados.length !== 1 ? "s" : ""}.
            </p>
          )}
        </>
      )}
    </RutaProtegida>
  );
}