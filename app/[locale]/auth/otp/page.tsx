import { Suspense } from "react";
import { OtpForm } from "@/components/auth/OtpForm";

// useSearchParams() inside OtpForm always needs a Suspense boundary (search
// params are only known at request time) — see the Cache Components guide.
export default function OtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
