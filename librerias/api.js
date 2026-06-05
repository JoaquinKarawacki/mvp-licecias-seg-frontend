const URL_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function pedirApi(ruta, { metodo = "GET", cuerpo } = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const cabeceras = { "Content-Type": "application/json" };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${URL_API}${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  if (!respuesta.ok) {
    let mensaje = "Ocurrio un error";
    try {
      const datos = await respuesta.json();
      // NestJS manda message como string o como array (validaciones)
      mensaje = Array.isArray(datos.message)
        ? datos.message.join(", ")
        : datos.message || mensaje;
    } catch {
      // la respuesta no era JSON, dejamos el mensaje generico
    }
    throw new Error(mensaje);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}