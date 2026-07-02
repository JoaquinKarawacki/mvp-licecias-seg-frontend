"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

const SECCIONES = [
  { href: "/admin/tipos", titulo: "Tipos de Licencia", descripcion: "Catálogo de tipos (Normal, Estudio...)" },
  { href: "/admin/sectores", titulo: "Sectores", descripcion: "Áreas de la empresa" },
  { href: "/admin/empleados", titulo: "Empleados", descripcion: "Alta y edición de empleados" },
  { href: "/admin/feriados", titulo: "Feriados", descripcion: "Días no laborables" },
  { href: "/admin/saldos", titulo: "Saldos", descripcion: "Generar y ajustar saldos" },
  { href: "/admin/saldos-empleados", titulo: "Saldos por empleado", descripcion: "Tabla de todos los empleados y sus saldos" },
];

// Formatea un objeto Date a "YYYY-MM-DD" usando los componentes LOCALES.
// No usamos toISOString() porque convertiría a UTC y correría el día (UTC-3).
function aFechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Calcula el lunes y el viernes de la semana ACTUAL (hora local = Uruguay).
// getDay(): 0=domingo, 1=lunes, ... 6=sábado.
function calcularSemana() {
  const hoy = new Date();
  const diaSemana = hoy.getDay();

  // Cuántos días retroceder para llegar al lunes.
  // Si hoy es domingo (0), el lunes de "esta semana laboral" fue hace 6 días.
  const retrocesoALunes = diaSemana === 0 ? 6 : diaSemana - 1;

  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - retrocesoALunes);

  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);

  return { desde: aFechaLocal(lunes), hasta: aFechaLocal(viernes) };
}

// Convierte "2026-07-07" en "lun 7" (parseo local para no correr el día).
function formatearDia(valor) {
  const [anio, mes, dia] = valor.split("-");
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
  const nombreDia = fecha.toLocaleDateString("es-UY", { weekday: "short" });
  return `${nombreDia} ${Number(dia)}`;
}

export default function PaginaAdmin() {
  const { usuario } = usarAuth();

  const [semana, setSemana] = useState({ desde: "", hasta: "" });
  const [licencias, setLicencias] = useState([]);
  const [cargandoSemana, setCargandoSemana] = useState(true);
  const [errorSemana, setErrorSemana] = useState("");

  useEffect(() => {
    if (!usuario) return;

    const rango = calcularSemana();
    setSemana(rango);

    pedirApi(`/solicitudes/semana?desde=${rango.desde}&hasta=${rango.hasta}`)
      .then((datos) => setLicencias(datos))
      .catch((err) => setErrorSemana(err.message))
      .finally(() => setCargandoSemana(false));
  }, [usuario]);

  // Rango legible para el subtítulo, ej: "lun 7 al vie 11"
  const rangoLegible =
    semana.desde && semana.hasta
      ? `${formatearDia(semana.desde)} al ${formatearDia(semana.hasta)}`
      : "";

  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-black text-gray-900 mb-8">Administración</h1>

          {/* Bloque: quiénes están de licencia esta semana */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-10">
            <div className="bg-[#ca3517] px-6 py-4">
              <h2 className="font-bold text-white">De licencia esta semana</h2>
              {rangoLegible && (
                <p className="text-sm text-white/80 capitalize">{rangoLegible}</p>
              )}
            </div>

            <div className="p-6">
              {cargandoSemana && (
                <p className="text-sm text-gray-400">Cargando...</p>
              )}

              {errorSemana && (
                <p className="text-sm text-[#ca3517] font-medium">{errorSemana}</p>
              )}

              {!cargandoSemana && !errorSemana && licencias.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nadie de licencia esta semana.
                </p>
              )}

              {!cargandoSemana && !errorSemana && licencias.length > 0 && (
                <div className="space-y-3">
                  {licencias.map((lic) => (
                    <div
                      key={lic.solicitud_id}
                      className="flex flex-wrap items-center justify-between gap-2
                                 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <span className="font-bold text-gray-900">
                          {lic.apellido}, {lic.nombre}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {lic.sector || "—"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {lic.dias.map((dia) => (
                          <span
                            key={dia}
                            className="text-xs bg-gray-100 text-gray-700 rounded-full
                                       px-3 py-1 capitalize"
                          >
                            {formatearDia(dia)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tarjetas de secciones */}
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