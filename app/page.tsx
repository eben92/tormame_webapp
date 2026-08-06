import { redirect } from "next/navigation";

/**
 * The native app shows a brand splash while it decides where to send you. On
 * web that decision is instant and lives in the lobby, so `/` just forwards.
 */
export default function RootPage() {
  redirect("/lobby");
}
