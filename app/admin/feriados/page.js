"use client";
 
import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";
 
// Muestra "2026-07-09T00:00:00Z" como fecha local legible (mismo fix de zona)
function formatearFecha(valor) {
  const [anio, mes, dia] = valor.split("T")[0].split("-");
  return new Date(Number(anio), Number(mes) - 1, Number(dia)).toLocaleDateString("es-UY");
}
 
// El input type="date" necesita "YYYY-MM-DD"; lo extraemos del ISO que llega del back
function aValorInput(valor) {
  return valor.split("T")[0];
}
 
export default function PaginaAdminFeriados() {
  const { usuario } = usarAuth();
 
  const [feriados, setFeriados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
 
  const [fecha, setFecha] = useState("");
  const [nombre, setNombre] = useState("");
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [creando, setCreando] = useState(false);
 
  // Estado de edición inline
  const [editandoId, setEditandoId] = useState(null);
  const [editFecha, setEditFecha] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editEsRecurrente, setEditEsRecurrente] = useState(false);
  const [guardando, setGuardando] = useState(false);
 
  // Id que se está eliminando
  const [eliminandoId, setEliminandoId] = useState(null);
 
  function cargarFeriados() {
    pedirApi("/feriados")
      .then((datos) => setFeriados(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }
 
  useEffect(() => {
    if (!usuario) return;
    cargarFeriados();
  }, [usuario]);
 
  async function crear() {
    setError("");
    if (!fecha || !nombre.trim()) {
      setError("Fecha y nombre son obligatorios.");
      return;
    }
 
    setCreando(true);
    try {
      await pedirApi("/feriados", {
        metodo: "POST",
        cuerpo: {
          // El input ya da "2026-07-09"; lo mandamos así (formato ISO de fecha)
          fecha,
          nombre,
          es_recurrente: esRecurrente,
        },
      });
      setFecha("");
      setNombre("");
      setEsRecurrente(false);
      cargarFeriados();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }
 
  // Abre el modo edición precargando los valores actuales
  function empezarEdicion(feriado) {
    setError("");
    setEditandoId(feriado.id);
    setEditFecha(aValorInput(feriado.fecha));
    setEditNombre(feriado.nombre);
    setEditEsRecurrente(feriado.es_recurrente);
  }
 
  function cancelarEdicion() {
    setEditandoId(null);
  }
 
  async function guardarEdicion(id) {
    setError("");
    if (!editFecha || !editNombre.trim()) {
      setError("Fecha y nombre son obligatorios.");
      return;
    }
 
    setGuardando(true);
    try {
      await pedirApi(`/feriados/${id}`, {
        metodo: "PATCH",
        cuerpo: {
          fecha: editFecha,
          nombre: editNombre,
          es_recurrente: editEsRecurrente,
        },
      });
      setEditandoId(null);
      cargarFeriados();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }
 
  async function eliminar(feriado) {
    setError("");
    const confirmado = window.confirm(
      `¿Eliminar el feriado "${feriado.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;
 
    setEliminandoId(feriado.id);
    try {
      await pedirApi(`/feriados/${feriado.id}`, { metodo: "DELETE" });
      cargarFeriados();
    } catch (err) {
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
          <h1 className="text-2xl font-black text-gray-900 mb-8">Feriados</h1>
 
          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}
 
          {/* Formulario */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-4">Nuevo feriado</h2>
 
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />
 
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Día del Trabajador"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />
 
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
              <input
                type="checkbox"
                checked={esRecurrente}
                onChange={(e) => setEsRecurrente(e.target.checked)}
              />
              Se repite todos los años
            </label>
 
            <button
              onClick={crear}
              disabled={creando}
              className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                         text-sm hover:bg-[#a82d12] transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creando ? "Creando..." : "Crear feriado"}
            </button>
          </div>
 
          {/* Listado */}
          <h2 className="font-bold text-gray-900 mb-4">Feriados cargados</h2>
 
          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}
 
          {!cargando && feriados.length === 0 && (
            <p className="text-sm text-gray-500">No hay feriados cargados.</p>
          )}
 
          <div className="space-y-3">
            {feriados.map((feriado) =>
              editandoId === feriado.id ? (
                // ----- Fila en modo EDICIÓN -----
                <div
                  key={feriado.id}
                  className="bg-white rounded-xl border border-gray-100 p-4"
                >
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3
                               focus:outline-none focus:border-[#ca3517]"
                  />
 
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                    Nombre
                  </label>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3
                               focus:outline-none focus:border-[#ca3517]"
                  />
 
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                    <input
                      type="checkbox"
                      checked={editEsRecurrente}
                      onChange={(e) => setEditEsRecurrente(e.target.checked)}
                    />
                    Se repite todos los años
                  </label>
 
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarEdicion(feriado.id)}
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
                  key={feriado.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-gray-900">
                      {feriado.nombre}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      {formatearFecha(feriado.fecha)}
                    </span>
                  </div>
 
                  <div className="flex items-center gap-3">
                    {feriado.es_recurrente && (
                      <span className="text-xs text-gray-400">Anual</span>
                    )}
                    <button
                      onClick={() => empezarEdicion(feriado)}
                      className="border border-[#ca3517] text-[#ca3517] px-4 py-1.5 rounded-full
                                 font-semibold text-sm hover:bg-[#ca3517] hover:text-white
                                 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(feriado)}
                      disabled={eliminandoId === feriado.id}
                      className="border border-[#ca3517] text-[#ca3517] px-4 py-1.5 rounded-full
                                 font-semibold text-sm hover:bg-[#ca3517] hover:text-white
                                 transition-colors duration-200
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {eliminandoId === feriado.id ? "Eliminando..." : "Eliminar"}
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