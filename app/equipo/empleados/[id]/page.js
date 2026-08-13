"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";
import ListaHistorialSolicitudes from "@/componentes/ListaHistorialSolicitudes";

export default function PaginaHistorialEmpleado() {
  const { usuario } = usarAuth();
  const params = useParams();
  const empleadoId = params.id;

  const [empleado, setEmpleado] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario || !empleadoId) return;
    setCargando(true);
    setError("");
    pedirApi(`/solicitudes/empleado/${empleadoId}`)
      .then((datos) => {
        setEmpleado(datos.empleado);
        setSolicitudes(datos.solicitudes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [usuario, empleadoId]);

  return (
    <RutaProtegida>
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Link
          href="/equipo/saldos"
          className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          ← Saldos del Equipo
        </Link>
        {empleado && (
          <>
            <span className="text-gray-300">/</span>
            <h1 className="text-2xl font-black text-gray-900">
              {empleado.nombre} {empleado.apellido}
            </h1>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
      )}

      {cargando ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
          <h2 className="font-bold text-gray-900 mb-5">Historial de licencias</h2>
          <ListaHistorialSolicitudes solicitudes={solicitudes} />
        </div>
      )}
    </RutaProtegida>
  );
}
