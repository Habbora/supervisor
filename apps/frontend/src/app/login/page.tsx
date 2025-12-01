import { LoginForm } from "@/components/LoginForm";
import PopupShowComponent from "@/components/popup-show";
import { getServerAuth } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { user, token } = await getServerAuth();

  if (user && token) {
    redirect("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
