"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

export default function PaginaSaldo() {
  const { usuario } = usarAuth();

  const [saldos, setSaldos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const anioActual = new Date().getFullYear();

  useEffect(() => {
    // Solo pedimos cuando ya hay usuario cargado
    if (!usuario) return;

    pedirApi(`/saldos/mios?anio=${anioActual}`)
      .then((datos) => setSaldos(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario, anioActual]);

  return (
    <RutaProtegida>
      <h1 className="text-2xl font-black text-gray-900 mb-1">Mi Saldo</h1>
      <p className="text-sm text-gray-500 mb-8">Año {anioActual}</p>

      {cargando && (
        <p className="text-sm text-gray-400">Cargando saldos...</p>
      )}

      {error && (
        <p className="text-sm text-[#ca3517] font-medium">{error}</p>
      )}

      {!cargando && !error && saldos.length === 0 && (
        <p className="text-sm text-gray-500">
          No tenés saldos generados para este año.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {saldos.map((saldo) => (
          <div
            key={saldo.id}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-[#ca3517] px-6 py-4">
              <h2 className="text-white font-bold">
                {saldo.tipo_licencia?.nombre}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-gray-900">
                  {saldo.disponible}
                </span>
                <span className="text-sm text-gray-500">días disponibles</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Total del año: {saldo.total_dias}</li>
                <li>Usados: {saldo.dias_usados}</li>
                <li>Ajustes: {saldo.dias_ajustados}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </RutaProtegida>
  );
}