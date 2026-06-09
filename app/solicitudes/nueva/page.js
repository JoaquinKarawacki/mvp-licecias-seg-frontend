"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { usarAuth } from "@/contexto/contexto";
import { pedirApi } from "@/librerias/api";
import RutaProtegida from "@/componentes/RutaProtegida";
import "react-day-picker/style.css";

// Convierte un Date a "YYYY-MM-DD" usando la fecha LOCAL (sin corrimiento de zona)
function aFechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export default function PaginaPedirLicencia() {
  const { usuario } = usarAuth();
  const router = useRouter();

  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [comentario, setComentario] = useState("");

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Traer los tipos de licencia al cargar
  useEffect(() => {
    if (!usuario) return;
    pedirApi("/tipos-licencia")
      .then((datos) => setTipos(datos))
      .catch((err) => setError(err.message));
  }, [usuario]);

  const tiposVisibles = tipos.filter((tipo) => {
    if (tipo.codigo === "ESTUDIO" && !usuario?.es_estudiante) {
      return false;
    }
    return true;
  });

  async function manejarEnvio() {
    setError("");

    // Validaciones del lado del cliente
    if (!tipoSeleccionado) {
      setError("Elegí un tipo de licencia.");
      return;
    }
    if (diasSeleccionados.length === 0) {
      setError("Marcá al menos un día en el calendario.");
      return;
    }

    setEnviando(true);
    try {
      await pedirApi("/solicitudes", {
        metodo: "POST",
        cuerpo: {
          tipo_licencia_id: Number(tipoSeleccionado),
          dias: diasSeleccionados.map(aFechaLocal),
          comentario: comentario || undefined,
        },
      });
      // Salió bien: vamos a Mis Solicitudes a ver la nueva
      router.push("/solicitudes");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <RutaProtegida>
      <h1 className="text-2xl font-black text-gray-900 mb-8">Pedir Licencia</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
        {/* Tipo de licencia */}
        <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
          Tipo de licencia
        </label>
        <select
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6
                     focus:outline-none focus:border-[#ca3517]"
        >
          <option value="">Elegí un tipo...</option>
          {tiposVisibles.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>

        {/* Calendario */}
        <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
          Días solicitados
        </label>
        <div className="border border-gray-200 rounded-lg p-3 mb-2 inline-block">
          <DayPicker
            mode="multiple"
            selected={diasSeleccionados}
            onSelect={setDiasSeleccionados}
            locale={es}
            weekStartsOn={1}
          />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {diasSeleccionados.length} día(s) marcado(s)
        </p>

        {/* Comentario */}
        <label className="block text-xs uppercase tracking-widest font-bold text-gray-600 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6
                     focus:outline-none focus:border-[#ca3517]"
        />

        {error && (
          <p className="text-sm text-[#ca3517] font-medium mb-4">{error}</p>
        )}

        <button
          onClick={manejarEnvio}
          disabled={enviando}
          className="bg-[#ca3517] text-white px-8 py-2.5 rounded-full font-semibold
                     text-sm hover:bg-[#a82d12] transition-colors duration-200
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </button>
      </div>
    </RutaProtegida>
  );
}