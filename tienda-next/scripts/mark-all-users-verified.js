/**
 * Script para marcar todos los usuarios existentes como verificados
 * Ejecutar: node scripts/mark-all-users-verified.js
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, "../firebase-adminsdk.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function markAllUsersAsVerified() {
  try {
    console.log("🔄 Iniciando proceso de verificación de usuarios existentes...\n");

    const auth = admin.auth();
    let count = 0;
    let pageToken;

    do {
      const result = await auth.listUsers(1000, pageToken);

      for (const user of result.users) {
        // Si el usuario NO está verificado, lo marcamos como verificado
        if (!user.emailVerified) {
          await auth.updateUser(user.uid, {
            emailVerified: true,
          });
          console.log(`✅ ${user.email} - Marcado como verificado`);
          count++;
        } else {
          console.log(`⏭️  ${user.email} - Ya estaba verificado`);
        }
      }

      pageToken = result.pageToken;
    } while (pageToken);

    console.log(
      `\n✨ Proceso completado. ${count} usuarios marcados como verificados.\n`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

markAllUsersAsVerified();
