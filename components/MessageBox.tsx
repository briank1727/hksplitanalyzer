import type { ReactNode } from "react";
import Panel from "@/components/Panel";

export type MessageStatus = "success" | "warning" | "error";

// Panel background colour and text colour for each status: a deep tint of the
// status colour behind a pale version of it, so the text stays readable.
const STATUS_STYLES: Record<MessageStatus, { background: string; text: string }> = {
  success: { background: "#052e16", text: "text-green-200" }, // green-950
  warning: { background: "#422006", text: "text-yellow-200" }, // yellow-950
  error: { background: "#450a0a", text: "text-red-200" }, // red-950
};

export default function MessageBox({
  message,
  status,
  className = "",
}: {
  message: ReactNode;
  status: MessageStatus;
  className?: string;
}) {
  const { background, text } = STATUS_STYLES[status];

  // `className` goes on a wrapper so outer spacing (e.g. `mt-3`) sits outside the
  // panel's background rather than inside it.
  return (
    <div className={className}>
      <Panel
        color={background}
        showEmbellishments={false}
        // Errors interrupt screen readers; success and warning are announced politely.
        role={status === "error" ? "alert" : "status"}
        className={`text-left text-base ${text}`}
      >
        {message}
      </Panel>
    </div>
  );
}
