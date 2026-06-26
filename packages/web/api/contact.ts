import { VercelRequest, VercelResponse } from "@vercel/node";

const TO_EMAIL = "campmomoyama@gmail.com";

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeMimeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

async function getAccessToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN が未設定です"
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("access_token の取得に失敗しました");
  return data.access_token;
}

async function sendGmail(params: {
  accessToken: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}) {
  const rawMessage = [
    `From: ${encodeMimeHeader(params.from)}`,
    `To: ${params.to}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "MIME-Version: 1.0",
    `Subject: ${encodeMimeHeader(params.subject)}`,
    "",
    params.text,
  ].join("\r\n");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: base64UrlEncode(rawMessage) }),
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, name, email, year, message } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ ok: false, error: "必要項目が足りません" });
  }

  const typeLabel = type === "visit" ? "見学申込" : "お問い合わせ";
  const subject = `[桃山学院大学キャンプサークル] ${typeLabel} from ${name}`;

  try {
    const accessToken = await getAccessToken();
    const from = process.env.GMAIL_USER || "campmomoyama@gmail.com";

    const inquiryText = `
お問い合わせ種別: ${typeLabel}
お名前: ${name}
メールアドレス: ${email}
学年: ${year || "未入力"}

メッセージ:
${message || "（未入力）"}
`.trim();

    const isVisit = type === "visit";
    const autoReplyText = `
${name} 様

${isVisit ? "見学のお申し込み" : "お問い合わせ"}をいただき、ありがとうございます！
桃山学院大学キャンプサークルです。

${
  isVisit
    ? `ご希望の見学日など、内容を確認のうえ３日以内（土日祝を除く）にご連絡いたします。
初めての見学でも全然大丈夫です。道具も知識もゼロからで大歓迎！
一緒に楽しいキャンプライフをはじめましょう。`
    : `いただいた内容を確認のうえ、３日以内（土日祝を除く）にご返信いたします。
サークルに関するご質問はなんでもお気軽にどうぞ。`
}

もし返信が届かない場合は、お手数ですが迷惑メールフォルダをご確認いただくか、
campmomoyama@gmail.com まで直接ご連絡ください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【送信内容の控え】
お問い合わせ種別: ${typeLabel}
お名前: ${name}
メールアドレス: ${email}
学年: ${year ? year + "年生" : "未入力"}

${message ? `メッセージ:\n${message}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

桃山学院大学キャンプサークル
campmomoyama@gmail.com
https://momoyama-camp.jp
`.trim();

    await sendGmail({
      accessToken,
      from: `桃山学院大学キャンプサークル <${from}>`,
      to: TO_EMAIL,
      subject,
      text: inquiryText,
    });
    await sendGmail({
      accessToken,
      from: `桃山学院大学キャンプサークル <${from}>`,
      to: email,
      subject: "お問い合わせありがとうございます",
      text: autoReplyText,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error ? error.message : "メール送信に失敗しました",
    });
  }
}
