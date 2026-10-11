import { AlertCircle, XCircle } from "lucide-react";
import type { RegistrationStatus } from "@/lib/api/types";

export function PendingApproval({
  status,
  pendingTitle,
  pendingBody,
  rejectedTitle,
  rejectedBody,
}: {
  status: RegistrationStatus;
  pendingTitle: string;
  pendingBody: string;
  rejectedTitle: string;
  rejectedBody: string;
}) {
  const isRejected = status === "rejected";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {isRejected ? (
        <XCircle className="h-10 w-10 text-danger" />
      ) : (
        <AlertCircle className="h-10 w-10 text-warning" />
      )}
      <h1 className="text-xl font-semibold text-foreground">
        {isRejected ? rejectedTitle : pendingTitle}
      </h1>
      <p className="text-sm text-muted">{isRejected ? rejectedBody : pendingBody}</p>
    </div>
  );
}
