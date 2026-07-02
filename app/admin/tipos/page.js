"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

export default function PaginaAdminTipos() {
  const { usuario } = usarAuth();

  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Campos del formulario de creación
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [requiereSaldo, setRequiereSaldo] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [creando, setCreando] = useState(false);

  // Estado de edición inline: guardamos el id que se está editando
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCodigo, setEditCodigo] = useState("");
  const [editRequiereSaldo, setEditRequiereSaldo] = useState(true);
  const [editDescripcion, setEditDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Id que se está eliminando (para deshabilitar su botón)
  const [eliminandoId, setEliminandoId] = useState(null);

  function cargarTipos() {
    pedirApi("/tipos-licencia")
      .then((datos) => setTipos(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    if (!usuario) return;
    cargarTipos();
  }, [usuario]);

  async function crear() {
    setError("");
    if (!nombre.trim() || !codigo.trim()) {
      setError("Nombre y código son obligatorios.");
      return;
    }

    setCreando(true);
    try {
      await pedirApi("/tipos-licencia", {
        metodo: "POST",
        cuerpo: {
          nombre,
          codigo,
          requiere_saldo: requiereSaldo,
          descripcion: descripcion || undefined,
        },
      });
      // Limpiamos el formulario y recargamos la lista
      setNombre("");
      setCodigo("");
      setRequiereSaldo(true);
      setDescripcion("");
      cargarTipos();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }

  // Abre el modo edición de una fila, precargando sus valores actuales
  function empezarEdicion(tipo) {
    setError("");
    setEditandoId(tipo.id);
    setEditNombre(tipo.nombre);
    setEditCodigo(tipo.codigo);
    setEditRequiereSaldo(tipo.requiere_saldo);
    setEditDescripcion(tipo.descripcion || "");
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  async function guardarEdicion(id) {
    setError("");
    if (!editNombre.trim() || !editCodigo.trim()) {
      setError("Nombre y código son obligatorios.");
      return;
    }

    setGuardando(true);
    try {
      await pedirApi(`/tipos-licencia/${id}`, {
        metodo: "PATCH",
        cuerpo: {
          nombre: editNombre,
          codigo: editCodigo,
          requiere_saldo: editRequiereSaldo,
          descripcion: editDescripcion || undefined,
        },
      });
      setEditandoId(null);
      cargarTipos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(tipo) {
    setError("");
    const confirmado = window.confirm(
      `¿Eliminar el tipo "${tipo.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setEliminandoId(tipo.id);
    try {
      await pedirApi(`/tipos-licencia/${tipo.id}`, { metodo: "DELETE" });
      cargarTipos();
    } catch (err) {
      // Acá cae el 409 si tiene saldos/solicitudes asociadas
      setError(err.message);
    } finally {
      setEliminandoId(null);
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
          <h1 className="text-2xl font-black text-gray-900 mb-8">
            Tipos de Licencia
          </h1>

          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}

          {/* Formulario de creación */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-4">Nuevo tipo</h2>

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Código
            </label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: NORMAL, ESTUDIO"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />

            <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
              <input
                type="checkbox"
                checked={requiereSaldo}
                onChange={(e) => setRequiereSaldo(e.target.checked)}
              />
              Requiere saldo
            </label>

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />

            <button
              onClick={crear}
              disabled={creando}
              className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                         text-sm hover:bg-[#a82d12] transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creando ? "Creando..." : "Crear tipo"}
            </button>
          </div>

          {/* Listado */}
          <h2 className="font-bold text-gray-900 mb-4">Tipos existentes</h2>

          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}

          {!cargando && tipos.length === 0 && (
            <p className="text-sm text-gray-500">No hay tipos cargados.</p>
          )}

          <div className="space-y-3">
            {tipos.map((tipo) =>
              editandoId === tipo.id ? (
                // ----- Fila en modo EDICIÓN -----
                <div
                  key={tipo.id}
                  className="bg-white rounded-xl border border-gray-100 p-4"
                >
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                    Nombre
                  </label>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3
                               focus:outline-none focus:border-[#ca3517]"
                  />

                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                    Código
                  </label>
                  <input
                    value={editCodigo}
                    onChange={(e) => setEditCodigo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3
                               focus:outline-none focus:border-[#ca3517]"
                  />

                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                    <input
                      type="checkbox"
                      checked={editRequiereSaldo}
                      onChange={(e) => setEditRequiereSaldo(e.target.checked)}
                    />
                    Requiere saldo
                  </label>

                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                               focus:outline-none focus:border-[#ca3517]"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarEdicion(tipo.id)}
                      disabled={guardando}
                      className="bg-[#ca3517] text-white px-6 py-2 rounded-full font-semibold
                                 text-sm hover:bg-[#a82d12] transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      disabled={guardando}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full
                                 font-semibold text-sm hover:bg-gray-50 transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // ----- Fila en modo LECTURA -----
                <div
                  key={tipo.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-gray-900">{tipo.nombre}</span>
                    <span className="text-sm text-gray-400 ml-2">
                      ({tipo.codigo})
                    </span>
                    {tipo.descripcion && (
                      <p className="text-sm text-gray-500">{tipo.descripcion}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {tipo.requiere_saldo ? "Requiere saldo" : "Sin saldo"}
                    </span>
                    <button
                      onClick={() => empezarEdicion(tipo)}
                      className="border border-[#ca3517] text-[#ca3517] px-4 py-1.5 rounded-full
                                 font-semibold text-sm hover:bg-[#ca3517] hover:text-white
                                 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(tipo)}
                      disabled={eliminandoId === tipo.id}
                      className="border border-[#ca3517] text-[#ca3517] px-4 py-1.5 rounded-full
                                 font-semibold text-sm hover:bg-[#ca3517] hover:text-white
                                 transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {eliminandoId === tipo.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </RutaProtegida>
  );
}