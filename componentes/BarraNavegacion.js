"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usarAuth } from "@/contexto/contexto";

export default function BarraNavegacion() {
  const { usuario, cerrarSesion } = usarAuth();
  const rutaActual = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(rutaActual);

  // Cierra el menu movil cada vez que cambia de ruta (ajuste de estado
  // durante el render, no en un efecto: evita el re-render en cascada).
  if (rutaActual !== rutaAnterior) {
    setRutaAnterior(rutaActual);
    setMenuAbierto(false);
  }

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
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Image
            src="/logo-seg.png"
            alt="SEG Ingenieria"
            width={36}
            height={36}
            className="rounded-md shrink-0"
          />

          {/* Links - fila completa desde lg (1024px) */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {enlaces.map((enlace) => {
              const activo = rutaActual === enlace.href;
              return (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  className={`px-2.5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-200 ${
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

          {/* Usuario + cerrar sesion - fila completa desde lg */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/cambiar-contrasena"
              className="text-gray-400 hover:text-white text-xs hidden xl:block
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

          {/* Boton hamburguesa - visible debajo de lg */}
          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2
                       rounded-full text-gray-300 hover:text-white hover:bg-white/10
                       transition-colors duration-200"
            aria-label={menuAbierto ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
          >
            {menuAbierto ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu movil - siempre en el DOM, se muestra/oculta con display */}
      <div
        id="menu-movil"
        className={`lg:hidden border-t border-white/10 ${
          menuAbierto ? "block" : "hidden"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
          {enlaces.map((enlace) => {
            const activo = rutaActual === enlace.href;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={`block px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  activo
                    ? "text-[#ca3517]"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {enlace.etiqueta}
              </Link>
            );
          })}

          <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
            <Link
              href="/cambiar-contrasena"
              className="text-gray-400 hover:text-white text-xs
                        transition-colors duration-200"
            >
              {usuario?.nombre}
            </Link>
            <button
              onClick={cerrarSesion}
              className="px-3 py-2 text-gray-300 hover:text-white text-sm font-medium
                         transition-colors duration-200"
            >
              Salir
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}