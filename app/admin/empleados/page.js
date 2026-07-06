"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";
 
export default function PaginaAdminEmpleados() {
  const { usuario } = usarAuth();
 
  const [empleados, setEmpleados] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
 
  // Campos del formulario (solo para CREAR)
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [esEncargado, setEsEncargado] = useState(false);
  const [esEstudiante, setEsEstudiante] = useState(false);
  const [horasSemanales, setHorasSemanales] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Filtros del listado (no tocan el backend)
  const [rolFiltro, setRolFiltro] = useState("");
  const [sectorFiltro, setSectorFiltro] = useState("");

  function cargarEmpleados() {
    pedirApi("/empleados")
      .then((datos) => setEmpleados(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }
 
  useEffect(() => {
    if (!usuario) return;
    cargarEmpleados();
    pedirApi("/sectores")
      .then((datos) => setSectores(datos))
      .catch((err) => setError(err.message));
  }, [usuario]);
 
  function limpiarFormulario() {
    setEmail("");
    setContrasena("");
    setNombre("");
    setApellido("");
    setFechaIngreso("");
    setSectorId("");
    setEsEncargado(false);
    setEsEstudiante(false);
    setHorasSemanales("");
  }
 
  async function crear() {
    setError("");
    setMensaje("");
 
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !fechaIngreso || !sectorId) {
      setError("Completá nombre, apellido, email, fecha y sector.");
      return;
    }
    if (!contrasena.trim()) {
      setError("La contraseña es obligatoria al crear.");
      return;
    }
 
    const cuerpo = {
      email,
      contrasena,
      nombre,
      apellido,
      fecha_ingreso: fechaIngreso,
      sector_id: Number(sectorId),
      es_encargado: esEncargado,
      es_estudiante: esEstudiante,
      horas_semanales: esEstudiante ? Number(horasSemanales) : 0,
    };
 
    setGuardando(true);
    try {
      await pedirApi("/empleados", { metodo: "POST", cuerpo });
      setMensaje("Empleado creado correctamente.");
      limpiarFormulario();
      cargarEmpleados();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }
 
  const empleadosFiltrados = empleados.filter((empleado) => {
    const coincideRol = !rolFiltro || empleado.usuario?.rol === rolFiltro;
    const coincideSector =
      !sectorFiltro || String(empleado.sector_id) === sectorFiltro;
    return coincideRol && coincideSector;
  });

  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-black text-gray-900 mb-8">Empleados</h1>
 
          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}
          {mensaje && (
            <p className="text-sm text-green-700 font-medium mb-4">{mensaje}</p>
          )}
 
          {/* Formulario solo para crear */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-4">Nuevo empleado</h2>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                  Nombre
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:border-[#ca3517]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                  Apellido
                </label>
                <input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:border-[#ca3517]"
                />
              </div>
            </div>
 
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />
 
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />
 
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Fecha de ingreso
            </label>
            <input
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />
 
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Sector
            </label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            >
              <option value="">Elegí un sector...</option>
              {sectores.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
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
 
            <button
              onClick={crear}
              disabled={guardando}
              className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                         text-sm hover:bg-[#a82d12] transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guardando ? "Guardando..." : "Crear empleado"}
            </button>
          </div>
 
          {/* Listado */}
          <h2 className="font-bold text-gray-900 mb-4">Empleados</h2>

          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Rol
              </label>
              <select
                value={rolFiltro}
                onChange={(e) => setRolFiltro(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                           focus:outline-none focus:border-[#ca3517]"
              >
                <option value="">Todos</option>
                <option value="EMPLEADO">Empleado</option>
                <option value="ADMIN">Admin</option>
              </select>
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
                {sectores.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}

          {!cargando && empleadosFiltrados.length === 0 && (
            <p className="text-sm text-gray-500">
              {empleados.length === 0
                ? "No hay empleados cargados."
                : "No hay empleados que coincidan con el filtro."}
            </p>
          )}

          <div className="space-y-3">
            {empleadosFiltrados.map((empleado) => (
              <div
                key={empleado.id}
                className={`bg-white rounded-xl border p-4 flex items-center justify-between
                  ${empleado.esta_activo === false
                    ? "border-gray-200 opacity-60"
                    : "border-gray-100"
                  }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {empleado.nombre} {empleado.apellido}
                    </span>
                    {empleado.es_encargado && (
                      <span className="text-xs text-[#ca3517] font-bold">Encargado</span>
                    )}
                    {empleado.esta_activo === false && (
                      <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {empleado.usuario?.email} · {empleado.sector?.nombre}
                  </p>
                </div>
                <Link
                  href={`/admin/empleados/${empleado.id}`}
                  className="border-2 border-[#ca3517] text-[#ca3517] px-5 py-1.5
                             rounded-full font-semibold text-sm hover:bg-[#ca3517]
                             hover:text-white transition-colors duration-200"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </RutaProtegida>
  );
}