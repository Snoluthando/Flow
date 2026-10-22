import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendInvoiceEmail({
  to,
  businessName,
  invoiceNumber,
  amount,
  dueDate,
  publicUrl,
  pdfBuffer,
}: {
  to: string;
  businessName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string | null;
  publicUrl: string;
  pdfBuffer: Buffer;
}) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL ?? "invoices@resend.dev";

  const subject = `Invoice ${invoiceNumber} from ${businessName}`;

  const { error } = await resend.emails.send({
    from: `${businessName} <${from}>`,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; color: #17233b; max-width: 480px;">
        <p>Hi,</p>
        <p>${businessName} has sent you invoice <strong>${invoiceNumber}</strong> for
        <strong>${amount}</strong>${dueDate ? `, due ${dueDate}` : ""}.</p>
        <p>The PDF is attached. You can also view and pay it online:</p>
        <p><a href="${publicUrl}">${publicUrl}</a></p>
        <p>Thanks,<br/>${businessName}</p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send email.");
  }

  return subject;
}
