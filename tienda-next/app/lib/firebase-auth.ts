import { sendPasswordResetEmail as _sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import {
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	getIdToken,
	User,
} from "firebase/auth";
import { registerWithRateLimit, loginWithRateLimit } from "./device-id-client";

// RECUPERAR CONTRASEÑA
export async function sendPasswordResetEmail(email: string) {
	await _sendPasswordResetEmail(auth, email);
}

// LOGIN
export async function loginUser(email: string, password: string) {
	try {
		// 🔒 Rate limit + validar credenciales en backend
		await loginWithRateLimit(email, password);
		
		// ✅ Luego: Login normal con Firebase SDK
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		
		// Validar que el email esté verificado
		if (!user.emailVerified) {
			await signOut(auth);
			throw new Error("Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu email y haz clic en el enlace de verificación.");
		}
		
		const idToken = await getIdToken(user, true);
		return { success: true, user, idToken };
	} catch (error: any) {
		// Si es error del rate limit o validación, propagar
		if (error.message.includes("Demasiados") || error.message.includes("Email")) {
			throw error;
		}
		// Otros errores de Firebase
		throw new Error(error.message || "Error al iniciar sesión");
	}
}

// REGISTRO - ⚠️ NUNCA autentica al cliente
export async function registerUser(email: string, password: string, profile: { name?: string } = {}) {
	try {
		// 🔒 Crear usuario desde BACKEND con rate limiting (Anti-spam)
		const result = await registerWithRateLimit(
			email.trim(),
			password,
			profile.name?.trim() || ""
		);

		// Enviar email de verificación (el backend ya lo envía en registerWithRateLimit)
		return { 
			success: true, 
			message: "Cuenta creada. Revisa tu email para verificar tu cuenta.",
			uid: result.uid
		};
	} catch (error: any) {
		console.error("[registerUser] Error:", error.message);
		throw new Error(error.message || "Error al crear la cuenta");
	}
}

// LOGOUT
export async function logoutUser() {
	await signOut(auth);
}

// OBTENER USUARIO ACTUAL Y SU ROL
export async function getCurrentUser(): Promise<null | (User & { role?: string })> {
	return new Promise((resolve) => {
		onAuthStateChanged(auth, async (user) => {
			if (!user) return resolve(null);
			const idToken = await getIdToken(user, true);
			// Llama a tu API para obtener el rol desde el token/cookie
			try {
				const res = await fetch("/api/auth/me", {
					headers: { Authorization: `Bearer ${idToken}` },
				});
				if (res.ok) {
					const data = await res.json();
					return resolve({ ...user, role: data.role });
				}
			} catch (e) {}
			// Si falla, solo devuelve el usuario
			resolve(user);
		});
	});
}

// REDIRECCIÓN AUTOMÁTICA SI YA ESTÁ LOGUEADO
export async function redirectIfLoggedIn(router: any) {
	onAuthStateChanged(auth, async (user) => {
		if (!user) return;
		// Obtener el rol real del usuario desde el backend
		const idToken = await getIdToken(user, true);
		try {
			const res = await fetch("/api/auth/me", {
				headers: { Authorization: `Bearer ${idToken}` },
			});
			if (res.ok) {
				const data = await res.json();
				if (data.role === "admin") {
					router.push("/admin");
				} else {
					router.push("/home");
				}
				return;
			}
		} catch (e) {}
		// Si falla, redirige a home por defecto
		router.push("/home");
	});
}
