import { auth } from "@/auth";
import LoginForm from "@/components/auth/login-form";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await auth();

  if (user) {
    redirect("/tracks");
  }
  return <LoginForm />;
}
