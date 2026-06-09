"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

export default function PaginaCambiarContrasena() {
  const router = useRouter();

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio() {
    setError("");
    setExito("");

    // Validaciones del lado del cliente
    if (!contrasenaActual || !contrasenaNueva || !confirmacion) {
      setError("Completá todos los campos.");
      return;
    }
    if (contrasenaNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (contrasenaNueva !== confirmacion) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    if (contrasenaNueva === contrasenaActual) {
      setError("La nueva contraseña debe ser distinta a la actual.");
      return;
    }

    setEnviando(true);
    try {
      await pedirApi("/empleados/cambiar-contrasenia", {
        metodo: "PATCH",
        cuerpo: {
          contrasena_actual: contrasenaActual,
          contrasena_nueva: contrasenaNueva,
        },
      });
      setExito("Contraseña actualizada correctamente.");
      // Limpiamos los campos
      setContrasenaActual("");
      setContrasenaNueva("");
      setConfirmacion("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <RutaProtegida>
      <h1 className="text-2xl font-black text-gray-900 mb-8">
        Cambiar Contraseña
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-md">
        {/* Contraseña actual */}
        <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
          Contraseña actual
        </label>
        <input
          type="password"
          value={contrasenaActual}
          onChange={(e) => setContrasenaActual(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6
                     focus:outline-none focus:border-[#ca3517]"
        />

        {/* Contraseña nueva */}
        <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
          Contraseña nueva
        </label>
        <input
          type="password"
          value={contrasenaNueva}
          onChange={(e) => setContrasenaNueva(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-1
                     focus:outline-none focus:border-[#ca3517]"
        />
        <p className="text-xs text-gray-400 mb-6">Mínimo 6 caracteres.</p>

        {/* Confirmación */}
        <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
          Repetir contraseña nueva
        </label>
        <input
          type="password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6
                     focus:outline-none focus:border-[#ca3517]"
        />

        {error && (
          <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
        )}
        {exito && (
          <p className="text-sm text-green-700 font-medium mb-4">{exito}</p>
        )}

        <button
          onClick={manejarEnvio}
          disabled={enviando}
          className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                     text-sm hover:bg-[#a82d12] transition-colors duration-200
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </div>
    </RutaProtegida>
  );
}