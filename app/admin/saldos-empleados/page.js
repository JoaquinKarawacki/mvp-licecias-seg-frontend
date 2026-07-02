"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

// Busca dentro del array de saldos de un empleado el que corresponde a un código de tipo
function saldoPorCodigo(saldos, codigo) {
  return saldos.find((s) => s.tipo_licencia?.codigo === codigo) || null;
}

// Clase de color para el disponible: rojo si es negativo, gris normal si no
function claseDisponible(valor) {
  return valor < 0 ? "text-[#ca3517] font-bold" : "text-gray-900 font-bold";
}

export default function PaginaAdminSaldosEmpleados() {
  const { usuario } = usarAuth();

  const anioActual = new Date().getFullYear();

  const [anio, setAnio] = useState(anioActual);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Filtros de la vista (no tocan el backend, filtran lo ya traído)
  const [busqueda, setBusqueda] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState("");

  function cargar() {
    setCargando(true);
    setError("");
    pedirApi(`/saldos/todos?anio=${anio}`)
      .then((datos) => setEmpleados(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  // Recarga cada vez que cambia el año o el usuario
  useEffect(() => {
    if (!usuario) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, anio]);

  // Lista de sectores únicos para el <select> del filtro
  const sectores = [
    ...new Set(empleados.map((e) => e.sector?.nombre).filter(Boolean)),
  ].sort();

  // Aplicamos los filtros de búsqueda y sector sobre los datos traídos
  const empleadosFiltrados = empleados.filter((e) => {
    const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase());
    const coincideSector = !sectorFiltro || e.sector?.nombre === sectorFiltro;
    return coincideBusqueda && coincideSector;
  });

  // Opciones de año: el actual y los 3 anteriores
  const opcionesAnio = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3];

  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-black text-gray-900 mb-8">
            Saldos por empleado
          </h1>

          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}

          {/* Barra de filtros */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Buscar
              </label>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o apellido"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-[#ca3517]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Sector
              </label>
              <select
                value={sectorFiltro}
                onChange={(e) => setSectorFiltro(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                           focus:outline-none focus:border-[#ca3517]"
              >
                <option value="">Todos</option>
                {sectores.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Año
              </label>
              <select
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                           focus:outline-none focus:border-[#ca3517]"
              >
                {opcionesAnio.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}

          {!cargando && empleadosFiltrados.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay empleados que coincidan.
            </p>
          )}

          {/* Tabla */}
          {!cargando && empleadosFiltrados.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {/* Fila de grupos de columnas */}
                  <tr className="border-b border-gray-100">
                    <th
                      rowSpan={2}
                      className="text-left font-bold text-gray-700 px-4 py-3 align-bottom"
                    >
                      Empleado
                    </th>
                    <th
                      rowSpan={2}
                      className="text-left font-bold text-gray-700 px-4 py-3 align-bottom"
                    >
                      Sector
                    </th>
                    <th
                      colSpan={4}
                      className="text-center font-bold text-gray-700 px-4 py-2 border-l border-gray-100"
                    >
                      Común
                    </th>
                    <th
                      colSpan={4}
                      className="text-center font-bold text-gray-700 px-4 py-2 border-l border-gray-100"
                    >
                      Estudio
                    </th>
                  </tr>
                  {/* Fila de sub-columnas */}
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="font-semibold px-3 py-2 border-l border-gray-100">
                      Total
                    </th>
                    <th className="font-semibold px-3 py-2">Usados</th>
                    <th className="font-semibold px-3 py-2">Ajuste</th>
                    <th className="font-semibold px-3 py-2">Disp.</th>
                    <th className="font-semibold px-3 py-2 border-l border-gray-100">
                      Total
                    </th>
                    <th className="font-semibold px-3 py-2">Usados</th>
                    <th className="font-semibold px-3 py-2">Ajuste</th>
                    <th className="font-semibold px-3 py-2">Disp.</th>
                  </tr>
                </thead>
                <tbody>
                  {empleadosFiltrados.map((empleado) => {
                    const comun = saldoPorCodigo(empleado.saldos, "COMUN");
                    const estudio = saldoPorCodigo(empleado.saldos, "ESTUDIO");

                    return (
                      <tr
                        key={empleado.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {empleado.apellido}, {empleado.nombre}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {empleado.sector?.nombre || "—"}
                        </td>

                        {/* Bloque Común */}
                        {comun ? (
                          <>
                            <td className="px-3 py-3 text-center text-gray-700 border-l border-gray-100">
                              {comun.total_dias}
                            </td>
                            <td className="px-3 py-3 text-center text-gray-700">
                              {comun.dias_usados}
                            </td>
                            <td className="px-3 py-3 text-center text-gray-700">
                              {comun.dias_ajustados}
                            </td>
                            <td
                              className={`px-3 py-3 text-center ${claseDisponible(
                                comun.disponible
                              )}`}
                            >
                              {comun.disponible}
                            </td>
                          </>
                        ) : (
                          <td
                            colSpan={4}
                            className="px-3 py-3 text-center text-gray-300 border-l border-gray-100"
                          >
                            —
                          </td>
                        )}

                        {/* Bloque Estudio */}
                        {estudio ? (
                          <>
                            <td className="px-3 py-3 text-center text-gray-700 border-l border-gray-100">
                              {estudio.total_dias}
                            </td>
                            <td className="px-3 py-3 text-center text-gray-700">
                              {estudio.dias_usados}
                            </td>
                            <td className="px-3 py-3 text-center text-gray-700">
                              {estudio.dias_ajustados}
                            </td>
                            <td
                              className={`px-3 py-3 text-center ${claseDisponible(
                                estudio.disponible
                              )}`}
                            >
                              {estudio.disponible}
                            </td>
                          </>
                        ) : (
                          <td
                            colSpan={4}
                            className="px-3 py-3 text-center text-gray-300 border-l border-gray-100"
                          >
                            —
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && empleadosFiltrados.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {empleadosFiltrados.length} empleado
              {empleadosFiltrados.length !== 1 ? "s" : ""}. Disponible = total +
              ajuste − usados. En rojo, saldo negativo.
            </p>
          )}
        </>
      )}
    </RutaProtegida>
  );
}