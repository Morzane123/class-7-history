import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getSections, getAllUsers } from "@/lib/db";
import AdminTabs from "./AdminTabs";

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  if (!user || !isAdmin(user)) {
    redirect("/auth/login");
  }

  const sections = await getSections();
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-app-gray">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-semibold text-app-text mb-8">
            管理后台
          </h1>

          <AdminTabs 
            sections={sections} 
            users={users} 
            currentUserRole={user.role}
          />
        </div>
      </main>
    </div>
  );
}
