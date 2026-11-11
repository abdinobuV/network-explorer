import { redirect } from "next/navigation";

/** Rute lama — diarahkan ke sandbox topologi Star. */
export default function LegacySandbox() {
  redirect("/sandbox/star");
}
