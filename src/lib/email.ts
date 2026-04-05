import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.exmail.qq.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true" || true,
  auth: {
    user: process.env.SMTP_USER || "northland@xuanjian.top",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003";
  const verifyUrl = `${baseUrl}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"北域工作室" <${process.env.SMTP_USER || "northland@xuanjian.top"}>`,
    to: email,
    subject: "【璧山中学高2027届7班班史】邮箱验证",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1d1d1f; font-size: 24px; margin-bottom: 20px;">邮箱验证</h1>
        <p style="color: #6e6e73; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          您正在注册璧山中学高2027届7班班史系统账号，请点击下方按钮验证您的邮箱地址：
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          验证邮箱
        </a>
        <p style="color: #86868b; font-size: 14px; margin-top: 30px;">
          如果您没有注册账号，请忽略此邮件。
        </p>
        <p style="color: #86868b; font-size: 14px;">
          链接有效期：24小时
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3003";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"北域工作室" <${process.env.SMTP_USER || "northland@xuanjian.top"}>`,
    to: email,
    subject: "【璧山中学高2027届7班班史】密码重置",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1d1d1f; font-size: 24px; margin-bottom: 20px;">密码重置</h1>
        <p style="color: #6e6e73; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          您正在重置璧山中学高2027届7班班史系统的密码，请点击下方按钮设置新密码：
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          重置密码
        </a>
        <p style="color: #86868b; font-size: 14px; margin-top: 30px;">
          如果您没有请求重置密码，请忽略此邮件。
        </p>
        <p style="color: #86868b; font-size: 14px;">
          链接有效期：1小时
        </p>
      </div>
    `,
  });
}
