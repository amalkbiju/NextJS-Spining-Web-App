import nodemailer from "nodemailer";

// Store sent emails for development/testing
const sentEmails: any[] = [];

/**
 * Send invitation email to a user
 * Logs email details to console in development
 * If Gmail credentials provided in .env, sends actual email
 */
export async function sendInvitationEmail(
  toEmail: string,
  creatorName: string,
  roomId: string,
): Promise<boolean> {
  const joinLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/room/${roomId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; background: #f8f9fa; }
          .content h2 { margin-top: 0; color: #333; }
          .content p { color: #666; line-height: 1.6; margin: 15px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
          .button:hover { opacity: 0.9; }
          .link { word-break: break-all; color: #667eea; }
          .footer { background: #e9ecef; padding: 20px 30px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎡 Spin & Win</h1>
            <p style="margin: 10px 0 0 0; color: white; opacity: 0.9;">Game Invitation</p>
          </div>
          <div class="content">
            <h2>Hello! 👋</h2>
            <p><strong>${creatorName}</strong> has invited you to join a spinning wheel game!</p>
            <p>Get ready for some fun and competition. Click the button below to join the game now:</p>
            <div class="button-container">
              <a href="${joinLink}" class="button">Join Game Now →</a>
            </div>
            <p>Or copy this link:<br><span class="link">${joinLink}</span></p>
            <p style="color: #6c757d; font-size: 14px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              This invitation is unique to you and will link you directly to ${creatorName}'s game room.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Spin & Win. All rights reserved.</p>
            <p>If you did not expect this email, please ignore it.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Log email info to console (visible in development)
    const emailData = {
      to: toEmail,
      subject: `🎮 ${creatorName} invited you to Spin & Win!`,
      html: htmlContent,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    sentEmails.push(emailData);

    // Log to console with clear formatting
    console.log("\n" + "=".repeat(60));
    console.log("📧 EMAIL INVITATION LOGGED");
    console.log("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`From: ${creatorName}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`Room Link: ${joinLink}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log("=".repeat(60) + "\n");

    // Try to send actual email if Gmail credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const result = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: toEmail,
          subject: emailData.subject,
          html: htmlContent,
        });

        console.log("✅ Email actually sent via Gmail:", result.messageId);
        return true;
      } catch (gmailError) {
        console.log(
          "⚠️ Gmail send failed (check credentials), but email was logged",
        );
        return true;
      }
    }

    // Email logged successfully (real sending requires Gmail credentials)
    return true;
  } catch (error) {
    console.error("❌ Error logging email:", error);
    return false;
  }
}

/**
 * Send confirmation email when user accepts game invitation
 */
export async function sendRoomJoinedEmail(
  toEmail: string,
  playerName: string,
  roomId: string,
): Promise<boolean> {
  const gameLink = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/room/${roomId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 0; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; background: #f8f9fa; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background: #e9ecef; padding: 20px 30px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Game Starting!</h1>
          </div>
          <div class="content">
            <h2>Great news!</h2>
            <p><strong>${playerName}</strong> has accepted your game invitation!</p>
            <p>Both players are ready. Your game will start soon. Head over to your room to begin spinning!</p>
            <div class="button-container">
              <a href="${gameLink}" class="button">Go to Game Room →</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Spin & Win. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Log email info
    const emailData = {
      to: toEmail,
      subject: `🎮 ${playerName} accepted your game invitation!`,
      html: htmlContent,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    sentEmails.push(emailData);

    console.log("\n" + "=".repeat(60));
    console.log("📧 GAME JOINED CONFIRMATION LOGGED");
    console.log("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Player: ${playerName}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log(`Game Link: ${gameLink}`);
    console.log("=".repeat(60) + "\n");

    // Try to send actual email if Gmail credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const result = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: toEmail,
          subject: emailData.subject,
          html: htmlContent,
        });

        console.log("✅ Email actually sent via Gmail:", result.messageId);
        return true;
      } catch (gmailError) {
        console.log("⚠️ Gmail send failed, but email was logged");
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error logging email:", error);
    return false;
  }
}

/**
 * Get all logged emails (for development purposes)
 */
export function getSentEmails() {
  return sentEmails;
}
