import { sendPasswordResetEmail as _sendPasswordResetEmail } from "firebase/auth";

// RECUPERAR CONTRASEÑA
export async function sendPasswordResetEmail(email: string) {
	await _sendPasswordResetEmail(auth, email);
}
import { auth } from "./firebase";
import {
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	getIdToken,
	User,
} from "firebase/auth";

// LOGIN
export async function loginUser(email: string, password: string) {
	const userCredential = await signInWithEmailAndPassword(auth, email, password);
	const user = userCredential.user;
	
	// ⚠️ IMPORTANTE: Validar que el email esté verificado SIEMPRE
	if (!user.emailVerified) {
		// Cerrar sesión inmediata para evitar sesión local
		await signOut(auth);
		throw new Error("Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu email y haz clic en el enlace de verificación.");
	}
	
	const idToken = await getIdToken(user, true);
	// Puedes hacer fetch a tu API para guardar la sesión/cookie aquí
	return { success: true, user, idToken };
}

// REGISTRO - ⚠️ NUNCA autentica al cliente
export async function registerUser(email: string, password: string, profile: { name?: string } = {}) {
	// ✅ Crear usuario desde BACKEND (Admin SDK) - NO autentica al cliente
	const createRes = await fetch("/api/auth/create-account", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ 
			email: email.trim(),
			password: password,
			displayName: profile.name?.trim()
		}),
	});

	if (!createRes.ok) {
		const err = await createRes.json();
		throw new Error(err.error || "Error al crear la cuenta");
	}

	const userData = await createRes.json();

	// Enviar email de verificación
	const emailRes = await fetch("/api/auth/send-verification-email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: userData.email }),
	});

	if (!emailRes.ok) {
		const emailErr = await emailRes.json();
		console.error("[registerUser] Error enviando email:", emailErr);
		throw new Error(emailErr.error || "Error al enviar email de verificación");
	}

	return { 
		success: true, 
		message: "Cuenta creada. Revisa tu email para verificar tu cuenta."
	};
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
