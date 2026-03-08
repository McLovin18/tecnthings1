import React from "react";

export default function AdminPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#3a1859] transition-colors">
			<div className="w-full max-w-2xl mx-auto mt-10 mb-6 text-center">
				<h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-[#3a1859] dark:text-white">¡Bienvenido, admin!</h2>
				<p className="text-lg md:text-xl mb-4 text-[#3a1859] dark:text-white/80">
					Accede al panel de administración y gestiona la tienda.
				</p>
			</div>
		</div>
	);
}
