"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usarAuth } from "@/contexto/contexto";

export default function PaginaLogin() {
  const { iniciarSesion } = usarAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError("");
    setCargando(true);
    try {
      await iniciarSesion(email, contrasena);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1 bg-[#ca3517]" />
        <div className="p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Control de Licencias
          </h1>
          <p className="text-sm text-gray-500 mb-8">SEG Ingenieria</p>

          <form onSubmit={manejarEnvio} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-[#ca3517] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:border-[#ca3517] transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-[#ca3517] font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[#ca3517] text-white py-2.5 rounded-full font-semibold
                         text-sm hover:bg-[#a82d12] transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}