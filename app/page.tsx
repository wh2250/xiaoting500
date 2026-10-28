import { redirect } from "next/navigation";
import { getRole } from "@/lib/auth";

export default async function RootPage() {
  const role = await getRole();

  if (role === "admin") redirect("/admin");
  if (role === "student") redirect("/student");
  redirect("/login");
}
