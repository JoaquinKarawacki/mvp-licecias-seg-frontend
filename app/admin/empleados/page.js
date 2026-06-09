"use client";

import { useEffect, useState } from "react";
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

  // Campos del formulario
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [esEncargado, setEsEncargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Si editandoId es null -> estamos creando. Si tiene un id -> estamos editando ese empleado.
  const [editandoId, setEditandoId] = useState(null);

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

  // Limpia el formulario y vuelve al modo "crear"
  function limpiarFormulario() {
    setEditandoId(null);
    setEmail("");
    setContrasena("");
    setNombre("");
    setApellido("");
    setFechaIngreso("");
    setSectorId("");
    setEsEncargado(false);
  }

  // Carga los datos de un empleado en el formulario para editarlo
  function empezarEdicion(empleado) {
    setEditandoId(empleado.id);
    setEmail(empleado.usuario?.email || "");
    setContrasena(""); // vacía: solo se cambia si el admin escribe una nueva
    setNombre(empleado.nombre || "");
    setApellido(empleado.apellido || "");
    setFechaIngreso(empleado.fecha_ingreso ? empleado.fecha_ingreso.split("T")[0] : "");
    setSectorId(String(empleado.sector_id || ""));
    setEsEncargado(empleado.es_encargado || false);
    setMensaje("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function guardar() {
    setError("");
    setMensaje("");

    // Al editar, la contraseña es opcional. Al crear, es obligatoria.
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !fechaIngreso || !sectorId) {
      setError("Completá nombre, apellido, email, fecha y sector.");
      return;
    }
    if (!editandoId && !contrasena.trim()) {
      setError("La contraseña es obligatoria al crear.");
      return;
    }

    // Armamos el cuerpo. Solo incluimos contraseña si el admin escribió una.
    const cuerpo = {
      email,
      nombre,
      apellido,
      fecha_ingreso: fechaIngreso,
      sector_id: Number(sectorId),
      es_encargado: esEncargado,
    };
    if (contrasena.trim()) {
      cuerpo.contrasena = contrasena;
    }

    setGuardando(true);
    try {
      if (editandoId) {
        // EDITAR: PATCH al empleado existente
        await pedirApi(`/empleados/${editandoId}`, { metodo: "PATCH", cuerpo });
        setMensaje("Empleado actualizado correctamente.");
      } else {
        // CREAR: POST
        await pedirApi("/empleados", { metodo: "POST", cuerpo });
        setMensaje("Empleado creado correctamente.");
      }
      limpiarFormulario();
      cargarEmpleados();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

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

          {/* Formulario (sirve para crear Y editar) */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-4">
              {editandoId ? "Editar empleado" : "Nuevo empleado"}
            </h2>

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
              Contraseña {editandoId && "(dejala vacía para no cambiarla)"}
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder={editandoId ? "Solo si querés cambiarla" : "Mínimo 6 caracteres"}
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

            <div className="flex gap-2">
              <button
                onClick={guardar}
                disabled={guardando}
                className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                           text-sm hover:bg-[#a82d12] transition-colors duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear empleado"}
              </button>
              {editandoId && (
                <button
                  onClick={limpiarFormulario}
                  className="text-gray-500 px-4 py-2.5 text-sm font-medium
                             hover:text-gray-700 transition-colors"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>

          {/* Listado */}
          <h2 className="font-bold text-gray-900 mb-4">Empleados</h2>

          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}

          {!cargando && empleados.length === 0 && (
            <p className="text-sm text-gray-500">No hay empleados cargados.</p>
          )}

          <div className="space-y-3">
            {empleados.map((empleado) => (
              <div
                key={empleado.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-gray-900">
                    {empleado.nombre} {empleado.apellido}
                  </span>
                  {empleado.es_encargado && (
                    <span className="text-xs text-[#ca3517] ml-2 font-bold">Encargado</span>
                  )}
                  <p className="text-sm text-gray-500">
                    {empleado.usuario?.email} · {empleado.sector?.nombre}
                  </p>
                </div>
                <button
                  onClick={() => empezarEdicion(empleado)}
                  className="border-2 border-[#ca3517] text-[#ca3517] px-5 py-1.5
                             rounded-full font-semibold text-sm hover:bg-[#ca3517]
                             hover:text-white transition-colors duration-200"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </RutaProtegida>
  );
}