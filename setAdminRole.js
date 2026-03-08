// Script para asignar el rol de admin a un usuario en Firebase Auth
// Ejecuta este script una sola vez para el correo del admin


const admin = require("firebase-admin");
const serviceAccount = require("./tienda-next/firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "8nZhnQFZOEQlMeikhrmBxOuFj4p2"; // Reemplaza con el UID real

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("¡El usuario ahora es admin!");
    process.exit();
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });