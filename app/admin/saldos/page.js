"use client";

import { useEffect, useState } from "react";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";

export default function PaginaAdminSaldos() {
  const { usuario } = usarAuth();

  const [empleados, setEmpleados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Campos compartidos por las dos acciones
  const [empleadoId, setEmpleadoId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [diasAjuste, setDiasAjuste] = useState("");

  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    pedirApi("/empleados")
      .then((datos) => setEmpleados(datos))
      .catch((err) => setError(err.message));
    pedirApi("/tipos-licencia")
      .then((datos) => setTipos(datos))
      .catch((err) => setError(err.message));
  }, [usuario]);

  // Valida que estén los tres campos base
  function faltanDatosBase() {
    if (!empleadoId || !tipoId || !anio) {
      setError("Elegí empleado, tipo y año.");
      return true;
    }
    return false;
  }

  async function generar() {
    setError("");
    setMensaje("");
    if (faltanDatosBase()) return;

    setProcesando(true);
    try {
      await pedirApi("/saldos/generar", {
        metodo: "POST",
        cuerpo: {
          empleado_id: Number(empleadoId),
          tipo_licencia_id: Number(tipoId),
          anio: Number(anio),
        },
      });
      setMensaje("Saldo generado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function ajustar() {
    setError("");
    setMensaje("");
    if (faltanDatosBase()) return;
    if (diasAjuste === "" || isNaN(Number(diasAjuste))) {
      setError("Ingresá un número de días para ajustar (puede ser negativo).");
      return;
    }

    setProcesando(true);
    try {
      await pedirApi("/saldos/ajustar", {
        metodo: "PATCH",
        cuerpo: {
          empleado_id: Number(empleadoId),
          tipo_licencia_id: Number(tipoId),
          anio: Number(anio),
          dias: Number(diasAjuste),
        },
      });
      setMensaje("Saldo ajustado correctamente.");
      setDiasAjuste("");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <RutaProtegida>
      {usuario?.usuario?.rol !== "ADMIN" ? (
        <p className="text-sm text-[#ca3517] font-medium">
          No tenés permisos para ver esta sección.
        </p>
      ) : (
        <>
          <h1 className="text-2xl font-black text-gray-900 mb-8">Saldos</h1>

          {error && (
            <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
          )}
          {mensaje && (
            <p className="text-sm text-green-700 font-medium mb-4">{mensaje}</p>
          )}

          {/* Campos compartidos */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-4">Empleado y tipo</h2>

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Empleado
            </label>
            <select
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            >
              <option value="">Elegí un empleado...</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Tipo de licencia
            </label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            >
              <option value="">Elegí un tipo...</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>

            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Año
            </label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:border-[#ca3517]"
            />
          </div>

          {/* Acción: generar */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-2">Generar saldo</h2>
            <p className="text-sm text-gray-500 mb-4">
              Calcula el saldo del año según la antigüedad del empleado.
            </p>
            <button
              onClick={generar}
              disabled={procesando}
              className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                         text-sm hover:bg-[#a82d12] transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {procesando ? "Procesando..." : "Generar saldo"}
            </button>
          </div>

          {/* Acción: ajustar */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
            <h2 className="font-bold text-gray-900 mb-2">Ajustar saldo</h2>
            <p className="text-sm text-gray-500 mb-4">
              Suma o resta días manualmente (usá negativo para restar).
            </p>
            <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
              Días a ajustar
            </label>
            <input
              type="number"
              value={diasAjuste}
              onChange={(e) => setDiasAjuste(e.target.value)}
              placeholder="Ej: 5 o -3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4
                         focus:outline-none focus:border-[#ca3517]"
            />
            <button
              onClick={ajustar}
              disabled={procesando}
              className="border-2 border-[#ca3517] text-[#ca3517] px-8 py-2.5 rounded-full
                         font-semibold text-sm hover:bg-[#ca3517] hover:text-white
                         transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {procesando ? "Procesando..." : "Ajustar saldo"}
            </button>
          </div>
        </>
      )}
    </RutaProtegida>
  );
}