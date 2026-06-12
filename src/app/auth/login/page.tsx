import type { Metadata } from "next";
import { LoginExperience } from "@/components/premium-shell";

export const metadata: Metadata = {
  title: "دخول علي | Saloni Pro",
  description: "دخول تجريبي جاهز باسم علي لاختبار لوحة Saloni Pro.",
};

export default function LoginPage() {
  return <LoginExperience />;
}
