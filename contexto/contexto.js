"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pedirApi } from "@/librerias/api";

const ContextoAuth = createContext(null);

export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  // Al cargar la app: si hay token guardado, recuperamos el perfil
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCargando(false);
      return;
    }
    pedirApi("/empleados/perfil")
      .then((perfil) => setUsuario(perfil))
      .catch(() => localStorage.removeItem("token")) // token vencido o invalido
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(email, contrasena) {
    const datos = await pedirApi("/autenticacion/login", {
      metodo: "POST",
      cuerpo: { email, contrasena },
    });

    // linea que depende de la forma de tu respuesta de login.
    localStorage.setItem("token", datos.token);

    const perfil = await pedirApi("/empleados/perfil");
    setUsuario(perfil);
    return perfil;
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    setUsuario(null);
    router.push("/login");
  }

  return (
    <ContextoAuth.Provider
      value={{ usuario, cargando, iniciarSesion, cerrarSesion }}
    >
      {children}
    </ContextoAuth.Provider>
  );
}

export function usarAuth() {
  return useContext(ContextoAuth);
}