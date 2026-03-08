import { auth } from "./firebase";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	getIdToken,
	User,
	updateProfile
} from "firebase/auth";

// LOGIN
export async function loginUser(email: string, password: string) {
	const userCredential = await signInWithEmailAndPassword(auth, email, password);
	const user = userCredential.user;
	const idToken = await getIdToken(user, true);
	// Puedes hacer fetch a tu API para guardar la sesión/cookie aquí
	return { success: true, user, idToken };
}

// REGISTRO
export async function registerUser(email: string, password: string, profile: { name?: string } = {}) {
	const userCredential = await createUserWithEmailAndPassword(auth, email, password);
	const user = userCredential.user;
	if (profile.name) {
		await updateProfile(user, { displayName: profile.name });
	}
	const idToken = await getIdToken(user, true);
	// Puedes hacer fetch a tu API para guardar la sesión/cookie aquí
	return { success: true, user, idToken };
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
