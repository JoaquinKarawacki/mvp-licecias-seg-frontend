"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

export default function PaginaAdminSectores() {
  const { usuario } = usarAuth();

  const [sectores, setSectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);

  function cargarSectores() {
    pedirApi("/sectores")
      .then((datos) => setSectores(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    if (!usuario) return;
    cargarSectores();
  }, [usuario]);

  async function crear() {
    setError("");
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setCreando(true);
    try {
      await pedirApi("/sectores", {
        metodo: "POST",
        cuerpo: { nombre },
      });
      setNombre("");
      cargarSectores();
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
          <h1 className="text-2xl font-black text-gray-900 mb-8">Sectores</h1>

          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}

          {/* Formulario */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-4">Nuevo sector</h2>

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: RRHH, Ingeniería"
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
              {creando ? "Creando..." : "Crear sector"}
            </button>
          </div>

          {/* Listado */}
          <h2 className="font-bold text-gray-900 mb-4">Sectores existentes</h2>

          {cargando && <p className="text-sm text-gray-400">Cargando...</p>}

          {!cargando && sectores.length === 0 && (
            <p className="text-sm text-gray-500">No hay sectores cargados.</p>
          )}

          <div className="space-y-3">
            {sectores.map((sector) => (
              <div
                key={sector.id}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <span className="font-bold text-gray-900">{sector.nombre}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </RutaProtegida>
  );
}