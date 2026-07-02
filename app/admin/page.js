"use client";
 
import Link from "next/link";
import { usarAuth } from "@/contexto/contexto";
import RutaProtegida from "@/componentes/RutaProtegida";
 
const SECCIONES = [
  { href: "/admin/tipos", titulo: "Tipos de Licencia", descripcion: "Catálogo de tipos (Normal, Estudio...)" },
  { href: "/admin/sectores", titulo: "Sectores", descripcion: "Áreas de la empresa" },
  { href: "/admin/empleados", titulo: "Empleados", descripcion: "Alta y edición de empleados" },
  { href: "/admin/feriados", titulo: "Feriados", descripcion: "Días no laborables" },
  { href: "/admin/saldos", titulo: "Saldos", descripcion: "Generar y ajustar saldos" },
  { href: "/admin/saldos-empleados", titulo: "Saldos por empleado", descripcion: "Tabla de todos los empleados y sus saldos" },
];
 
export default function PaginaAdmin() {
  const { usuario } = usarAuth();
 
  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-black text-gray-900 mb-8">Administración</h1>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECCIONES.map((seccion) => (
              <Link
                key={seccion.href}
                href={seccion.href}
                className="bg-white rounded-xl border border-gray-100 p-6
                           hover:border-[#ca3517] transition-colors duration-200"
              >
                <h2 className="font-bold text-gray-900 mb-1">{seccion.titulo}</h2>
                <p className="text-sm text-gray-500">{seccion.descripcion}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </RutaProtegida>
  );
}