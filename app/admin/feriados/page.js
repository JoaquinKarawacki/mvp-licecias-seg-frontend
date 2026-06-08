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

export default function PaginaAdminFeriados() {
  const { usuario } = usarAuth();

  const [feriados, setFeriados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [fecha, setFecha] = useState("");
  const [nombre, setNombre] = useState("");
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [creando, setCreando] = useState(false);

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
            {feriados.map((feriado) => (
              <div
                key={feriado.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-gray-900">{feriado.nombre}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {formatearFecha(feriado.fecha)}
                  </span>
                </div>
                {feriado.es_recurrente && (
                  <span className="text-xs text-gray-400">Anual</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </RutaProtegida>
  );
}