"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usarAuth } from "@/contexto/contexto";
import BarraNavegacion from "@/componentes/BarraNavegacion";

export default function RutaProtegida({ children }) {
  const { usuario, cargando } = usarAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
  }, [cargando, usuario, router]);

  // Mientras verifica el token, o si no hay usuario (justo antes de redirigir)
  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Cargando...
      </div>
    );
  }

  // Hay usuario: mostramos la barra + el contenido de la pagina
  return (
    <div className="min-h-screen bg-gray-50">
      <BarraNavegacion />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}