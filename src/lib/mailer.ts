import { envConfig } from "@/config/env";
import { Resend } from "resend";

const resend = new Resend(envConfig.RESEND_API_KEY);

const STATUS_CONTENT: Record<
  string,
  { subject: string; heading: string; message: string }
> = {
  ACTIVE: {
    subject: "Account Approved — cPrism",
    heading: "Account Approved",
    message:
      "Your account has been approved by the system administrator. You may now log in to the cPrism application.",
  },
  REJECTED: {
    subject: "Account Not Approved — cPrism",
    heading: "Account Not Approved",
    message:
      "Your account registration has not been approved. For questions, please coordinate with the MPDO office.",
  },
  PENDING: {
    subject: "Account Pending — cPrism",
    heading: "Account Pending Approval",
    message:
      "Your account registration has been received and is currently pending approval. You will be notified once your account has been reviewed.",
  },
};

const LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/69/Carigara%2C_Leyte_Official_Seal.png";

export const mailer = {
  async sendStatusUpdate(email: string, name: string, status: string) {
    const content = STATUS_CONTENT[status];

    console.log(`Preparing to send email to ${email} with status ${status}`);

    if (!content) return;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>${content.subject}</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

                  <!-- Header -->
                  <tr>
                    <td style="background-color:#ffffff;padding:36px 40px 24px;text-align:center;border-bottom:1px solid #e2e8f0;">
                      <img
                        src="${LOGO_URL}"
                        alt="LGU Carigara Seal"
                        width="64"
                        height="64"
                        style="display:block;margin:0 auto 16px;"
                      />
                      <p style="margin:0;font-size:26px;font-weight:bold;color:#0f172a;letter-spacing:2px;">
                        cPrism
                      </p>
                      <p style="margin:5px 0 0;font-size:11px;color:#94a3b8;letter-spacing:0.5px;">
                       LGU Carigara
                      </p>
                    </td>
                  </tr>

                  <!-- Blue accent bar -->
                  <tr>
                    <td style="background-color:#1d4ed8;height:4px;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;background-color:#ffffff;">
                      <p style="margin:0 0 8px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">
                        Account Notification
                      </p>
                      <h2 style="margin:0 0 24px;font-size:20px;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:16px;">
                        ${content.heading}
                      </h2>
                      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.8;">
                        Dear <strong>${name}</strong>,
                      </p>
                      <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.8;">
                        ${content.message}
                      </p>
                      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
                        For concerns, please coordinate with the system administrator.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 40px;text-align:center;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:12px;color:#64748b;">
                        <strong>cPrism</strong> &mdash; Program Review and Implementation Status Monitoring<br/>
                        MPDO, LGU Carigara, Leyte
                      </p>
                      <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">
                        This is a system-generated email. Please do not reply to this message.
                      </p>
                      <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">
                        Developed by <strong style="color:#94a3b8;">Jomar Berdejo</strong>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `cPrism <no-reply@${envConfig.RESEND_DOMAIN}>`,
      to: email,
      subject: content.subject,
      html,
    });

    console.log("Email sent successfully:", response);
  },
};
