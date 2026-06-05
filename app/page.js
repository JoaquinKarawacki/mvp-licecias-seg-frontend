"use client";

import { usarAuth } from "@/contexto/contexto";
import RutaProtegida from "@/componentes/RutaProtegida";

export default function PaginaHome() {
  const { usuario } = usarAuth();

  return (
    <RutaProtegida>
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Hola, {usuario?.nombre}
        </h1>
        <p className="text-sm text-gray-500 mb-1">
          {usuario?.usuario?.email} · Rol: {usuario?.usuario?.rol}
          {usuario?.es_encargado ? " · Encargado" : ""}
        </p>
        <p className="text-sm text-gray-500">
          Sector: {usuario?.sector?.nombre}
        </p>
      </div>
    </RutaProtegida>
  );
}