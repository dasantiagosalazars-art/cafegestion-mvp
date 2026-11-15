import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "CafeGestión",
  url: "http://localhost:3000",
  version: packageJson.version,
  copyright: `© ${currentYear}, CafeGestión · Raíz Digital S.A.S.`,
  meta: {
    title: "CafeGestión",
    description: "Gestión de lotes, cosechas, inventario y ventas para fincas cafeteras.",
  },
};
