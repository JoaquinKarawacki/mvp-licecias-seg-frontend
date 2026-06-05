import { Red_Hat_Display } from "next/font/google";
import { ProveedorAuth } from "@/contexto/contexto";
import "./globals.css";

const redHat = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Control de Licencias — SEG Ingenieria",
  description: "Sistema interno de gestion de licencias",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={redHat.variable}>
      <body>
        <ProveedorAuth>{children}</ProveedorAuth>
      </body>
    </html>
  );
}