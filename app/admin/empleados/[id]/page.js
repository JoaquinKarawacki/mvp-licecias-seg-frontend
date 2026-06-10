"use client";
 
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";
 
export default function PaginaDetalleEmpleado() {
  const { usuario } = usarAuth();
  const params = useParams();
  const empleadoId = params.id;
 
  const [empleado, setEmpleado] = useState(null);
  const [saldos, setSaldos] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [anio, setAnio] = useState(2026);
  const [cargando, setCargando] = useState(true);
  const [cargandoSaldos, setCargandoSaldos] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modoEditar, setModoEditar] = useState(false);
  const [guardando, setGuardando] = useState(false);
 
  // Estados del formulario de edición
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [esEncargado, setEsEncargado] = useState(false);
  const [esEstudiante, setEsEstudiante] = useState(false);
  const [horasSemanales, setHorasSemanales] = useState("");
  const [esActivo, setEsActivo] = useState(true);
 
  // Carga el empleado y rellena el formulario de edición
  function cargarEmpleado() {
    return pedirApi(`/empleados/${empleadoId}`).then((datos) => {
      setEmpleado(datos);
      setEmail(datos.usuario?.email || "");
      setNombre(datos.nombre || "");
      setApellido(datos.apellido || "");
      setFechaIngreso(datos.fecha_ingreso ? datos.fecha_ingreso.split("T")[0] : "");
      setSectorId(String(datos.sector_id || ""));
      setEsEncargado(datos.es_encargado || false);
      setEsEstudiante(datos.es_estudiante || false);
      setHorasSemanales(datos.horas_semanales ? String(datos.horas_semanales) : "");
      setEsActivo(datos.esta_activo !== false);
      setContrasena("");
    });
  }
 
  function cargarSaldos(anioTarget) {
    setCargandoSaldos(true);
    return pedirApi(`/saldos/empleado/${empleadoId}?anio=${anioTarget}`)
      .then((datos) => setSaldos(datos))
      .catch(() => setSaldos([]))
      .finally(() => setCargandoSaldos(false));
  }
 
  // Carga inicial
  useEffect(() => {
    if (!usuario || !empleadoId) return;
    setCargando(true);
    Promise.all([
      cargarEmpleado(),
      cargarSaldos(anio),
      pedirApi("/sectores").then((datos) => setSectores(datos)),
    ])
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario, empleadoId]);
 
  // Recarga saldos cuando cambia el año
  function cambiarAnio(nuevoAnio) {
    setAnio(nuevoAnio);
    cargarSaldos(nuevoAnio);
  }
 
  async function guardar() {
    setError("");
    setMensaje("");
 
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !fechaIngreso || !sectorId) {
      setError("Completá nombre, apellido, email, fecha y sector.");
      return;
    }
 
    const cuerpo = {
      email,
      nombre,
      apellido,
      fecha_ingreso: fechaIngreso,
      sector_id: Number(sectorId),
      es_encargado: esEncargado,
      es_estudiante: esEstudiante,
      horas_semanales: esEstudiante ? Number(horasSemanales) : 0,
      esta_activo: esActivo,
    };
    if (contrasena.trim()) {
      cuerpo.contrasena = contrasena;
    }
 
    setGuardando(true);
    try {
      await pedirApi(`/empleados/${empleadoId}`, { metodo: "PATCH", cuerpo });
      setMensaje("Empleado actualizado correctamente.");
      setModoEditar(false);
      await cargarEmpleado();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }
 
  function cancelarEdicion() {
    setModoEditar(false);
    setError("");
    setMensaje("");
    // Restaurar los campos al estado actual del empleado
    if (empleado) {
      setEmail(empleado.usuario?.email || "");
      setNombre(empleado.nombre || "");
      setApellido(empleado.apellido || "");
      setFechaIngreso(empleado.fecha_ingreso ? empleado.fecha_ingreso.split("T")[0] : "");
      setSectorId(String(empleado.sector_id || ""));
      setEsEncargado(empleado.es_encargado || false);
      setEsEstudiante(empleado.es_estudiante || false);
      setHorasSemanales(empleado.horas_semanales ? String(empleado.horas_semanales) : "");
      setEsActivo(empleado.esta_activo !== false);
      setContrasena("");
    }
  }
 
  // Formatea fecha UTC sin corrimiento de zona horaria
  function formatearFecha(isoString) {
    if (!isoString) return "-";
    const [a, m, d] = isoString.split("T")[0].split("-");
    return `${d}/${m}/${a}`;
  }
 
  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          {/* Breadcrumb + título */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <Link
              href="/admin/empleados"
              className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              ← Empleados
            </Link>
            {empleado && (
              <>
                <span className="text-gray-300">/</span>
                <h1 className="text-2xl font-black text-gray-900">
                  {empleado.nombre} {empleado.apellido}
                </h1>
                {empleado.esta_activo === false && (
                  <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                    Inactivo
                  </span>
                )}
              </>
            )}
          </div>
 
          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}
          {mensaje && (
            <p className="text-sm text-green-700 font-medium mb-4">{mensaje}</p>
          )}
 
          {cargando ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : !empleado ? (
            <p className="text-sm text-gray-500">Empleado no encontrado.</p>
          ) : (
            <>
              {/* ─── MODO VER ──────────────────────────────────────────── */}
              {!modoEditar && (
                <div className="space-y-6 max-w-2xl">
 
                  {/* Card datos personales */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-gray-900">Datos personales</h2>
                      <button
                        onClick={() => setModoEditar(true)}
                        className="border-2 border-[#ca3517] text-[#ca3517] px-5 py-1.5
                                   rounded-full font-semibold text-sm hover:bg-[#ca3517]
                                   hover:text-white transition-colors duration-200"
                      >
                        Editar
                      </button>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Email</p>
                        <p className="text-gray-900">{empleado.usuario?.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Sector</p>
                        <p className="text-gray-900">{empleado.sector?.nombre || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Fecha de ingreso</p>
                        <p className="text-gray-900">{formatearFecha(empleado.fecha_ingreso)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Rol</p>
                        <p className="text-gray-900">{empleado.usuario?.rol || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Encargado del sector</p>
                        <p className="text-gray-900">{empleado.es_encargado ? "Sí" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Estado</p>
                        <p className={
                          empleado.esta_activo !== false
                            ? "text-green-700 font-semibold"
                            : "text-gray-400 font-semibold"
                        }>
                          {empleado.esta_activo !== false ? "Activo" : "Inactivo"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Estudiante</p>
                        <p className="text-gray-900">{empleado.es_estudiante ? "Sí" : "No"}</p>
                      </div>
                      {empleado.es_estudiante && (
                        <div>
                          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Horas semanales</p>
                          <p className="text-gray-900">{empleado.horas_semanales}h</p>
                        </div>
                      )}
                    </div>
                  </div>
 
                  {/* Card saldos */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-bold text-gray-900">Saldos de licencias</h2>
                      <select
                        value={anio}
                        onChange={(e) => cambiarAnio(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm
                                   focus:outline-none focus:border-[#ca3517]"
                      >
                        {[2026, 2025, 2024].map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
 
                    {cargandoSaldos ? (
                      <p className="text-sm text-gray-400">Cargando saldos...</p>
                    ) : saldos.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin saldos generados para {anio}.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left pb-3 text-xs uppercase tracking-widest font-bold text-gray-400">Tipo</th>
                              <th className="text-right pb-3 text-xs uppercase tracking-widest font-bold text-gray-400">Asignado</th>
                              <th className="text-right pb-3 text-xs uppercase tracking-widest font-bold text-gray-400">Ajuste (SI)</th>
                              <th className="text-right pb-3 text-xs uppercase tracking-widest font-bold text-gray-400">Usado</th>
                              <th className="text-right pb-3 text-xs uppercase tracking-widest font-bold text-gray-400">Disponible</th>
                            </tr>
                          </thead>
                          <tbody>
                            {saldos.map((saldo) => (
                              <tr key={saldo.id} className="border-b border-gray-50 last:border-0">
                                <td className="py-3 text-gray-900 font-medium">
                                  {saldo.tipo_licencia?.nombre || "-"}
                                </td>
                                <td className="py-3 text-right text-gray-700">{saldo.total_dias}</td>
                                <td className={`py-3 text-right font-semibold ${
                                  saldo.dias_ajustados > 0
                                    ? "text-green-600"
                                    : saldo.dias_ajustados < 0
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }`}>
                                  {saldo.dias_ajustados > 0 ? `+${saldo.dias_ajustados}` : saldo.dias_ajustados}
                                </td>
                                <td className="py-3 text-right text-gray-700">{saldo.dias_usados}</td>
                                <td className={`py-3 text-right font-bold text-base ${
                                  saldo.disponible < 0
                                    ? "text-red-500"
                                    : saldo.disponible <= 2
                                    ? "text-amber-500"
                                    : "text-gray-900"
                                }`}>
                                  {saldo.disponible}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
 
                </div>
              )}
 
              {/* ─── MODO EDITAR ───────────────────────────────────────── */}
              {modoEditar && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
                  <h2 className="font-bold text-gray-900 mb-5">Editar empleado</h2>
 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">Nombre</label>
                      <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                   focus:outline-none focus:border-[#ca3517]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">Apellido</label>
                      <input
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                   focus:outline-none focus:border-[#ca3517]"
                      />
                    </div>
                  </div>
 
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                               focus:outline-none focus:border-[#ca3517]"
                  />
 
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                    Contraseña (dejala vacía para no cambiarla)
                  </label>
                  <input
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Solo si querés cambiarla"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                               focus:outline-none focus:border-[#ca3517]"
                  />
 
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">Fecha de ingreso</label>
                  <input
                    type="date"
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                               focus:outline-none focus:border-[#ca3517]"
                  />
 
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">Sector</label>
                  <select
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                               focus:outline-none focus:border-[#ca3517]"
                  >
                    <option value="">Elegí un sector...</option>
                    {sectores.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
 
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                    <input
                      type="checkbox"
                      checked={esEncargado}
                      onChange={(e) => setEsEncargado(e.target.checked)}
                    />
                    Es encargado del sector
                  </label>
 
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                    <input
                      type="checkbox"
                      checked={esEstudiante}
                      onChange={(e) => setEsEstudiante(e.target.checked)}
                    />
                    Es estudiante
                  </label>
 
                  {esEstudiante && (
                    <div className="mb-4">
                      <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                        Horas semanales
                      </label>
                      <input
                        type="number"
                        value={horasSemanales}
                        onChange={(e) => setHorasSemanales(e.target.value)}
                        placeholder="Ej: 30, 40, 48"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                  focus:outline-none focus:border-[#ca3517]"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Hasta 36h → 6 días · 37-47h → 9 días · 48h o más → 12 días
                      </p>
                    </div>
                  )}
 
                  <div className="mb-5 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={esActivo}
                        onChange={(e) => setEsActivo(e.target.checked)}
                      />
                      Empleado activo
                    </label>
                    {!esActivo && (
                      <p className="text-xs text-amber-600 mt-1">
                        Al desactivar, el empleado no podrá iniciar sesión.
                      </p>
                    )}
                  </div>
 
                  <div className="flex gap-2">
                    <button
                      onClick={guardar}
                      disabled={guardando}
                      className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                                 text-sm hover:bg-[#a82d12] transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="text-gray-500 px-4 py-2.5 text-sm font-medium
                                 hover:text-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </RutaProtegida>
  );
}