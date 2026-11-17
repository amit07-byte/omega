import { redirect } from "next/navigation";
import { loadAccount, type AccountState } from "@/lib/auth/profile";

export async function requireAccount(role: "business" | "creator"): Promise<AccountState> {
  const account = await loadAccount();
  if (!account) {
    redirect("/login");
  }
  if (account.profile?.role === role) {
    return account;
  }
  if (account.profile?.role === "business") {
    redirect("/business/campaigns");
  }
  if (account.profile?.role === "creator") {
    redirect("/campaigns");
  }
  redirect("/account");
}
