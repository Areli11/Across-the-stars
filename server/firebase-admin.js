import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const serviceAccount = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://across-the-stars-e6675-default-rtdb.firebaseio.com"
});

// Exporta la instancia de la base de datos
export const db = admin.database();

// Exporta admin completo por si lo necesitas
export default admin;
