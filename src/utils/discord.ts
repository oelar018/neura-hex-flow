export interface WaitlistData {
  name: string;
  email: string;
  role?: string;
  use_case?: string;
}

export async function sendToDiscord(data: WaitlistData): Promise<void> {
  // Use environment variable or fallback to provided webhook URL
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 
    "https://discord.com/api/webhooks/1418048569025232942/n_vrx9_32mwLw1CgllNvSkMW4Hhl5zqberPY_5CG2mN8w6wOJnX5FsQ4-7vOebKiPf3-";
  
  if (!webhookUrl) {
    // Fail silently if webhook URL is not configured
    return;
  }

  try {
    // Format message field by combining role and use_case
    const messageText = [data.role, data.use_case]
      .filter(Boolean)
      .join(" - ") || "";

    const payload = {
      name: data.name || "",
      email: data.email || "",
      message: messageText
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Fail silently - don't break the user experience if Discord fails
    console.warn('Failed to send Discord notification:', error);
  }
}