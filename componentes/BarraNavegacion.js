"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usarAuth } from "@/contexto/contexto";

export default function BarraNavegacion() {
  const { usuario, cerrarSesion } = usarAuth();
  const rutaActual = usePathname();

  // Links que ve todo el mundo
  const enlaces = [
    { href: "/", etiqueta: "Inicio" },
    { href: "/saldo", etiqueta: "Mi Saldo" },
    { href: "/solicitudes", etiqueta: "Mis Solicitudes" },
    { href: "/solicitudes/nueva", etiqueta: "Pedir Licencia" },
  ];

  // Solo si puede aprobar solicitudes
  if (usuario?.puede_aprobar) {
    enlaces.push({ href: "/pendientes", etiqueta: "Pendientes" });
    enlaces.push({ href: "/equipo/saldos", etiqueta: "Saldos del Equipo" });
  }

  // Solo si es admin
  if (usuario?.usuario?.rol === "ADMIN") {
    enlaces.push({ href: "/admin", etiqueta: "Administracion" });
  }

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Image
            src="/logo-seg.png"
            alt="SEG Ingenieria"
            width={36}
            height={36}
            className="rounded-md"
          />

          {/* Links */}
          <nav className="flex items-center gap-1">
            {enlaces.map((enlace) => {
              const activo = rutaActual === enlace.href;
              return (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                    activo
                      ? "text-[#ca3517]"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {enlace.etiqueta}
                </Link>
              );
            })}
          </nav>

          {/* Usuario + cerrar sesion */}
          <div className="flex items-center gap-3">
              <Link
                href="/cambiar-contrasena"
                className="text-gray-400 hover:text-white text-xs hidden sm:block
                          transition-colors duration-200"
              >
                {usuario?.nombre}
              </Link>
            <button
              onClick={cerrarSesion}
              className="text-gray-300 hover:text-white text-sm font-medium
                         transition-colors duration-200"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}