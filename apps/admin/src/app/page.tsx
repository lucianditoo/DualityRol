import { redirect } from "next/navigation";
import { validateCurrentSession } from "../lib/auth";
import AdminShellClient from "./AdminShellClient";

export default async function AdminHomePage() {
  // Validación estricta en el servidor: ninguna vista administrativa se renderiza sin sesión válida
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    redirect("/login");
  }

  return <AdminShellClient user={session.user} />;
}
