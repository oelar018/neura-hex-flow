export interface WaitlistData {
  name: string;
  email: string;
  role?: string;
  use_case?: string;
}

export async function sendToDiscord(data: WaitlistData): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    // Fail silently if webhook URL is not configured
    return;
  }

  try {
    const embed = {
      title: "🚀 New Neura AI Waitlist Signup",
      color: 0x00FFDD, // Cyan color matching the brand
      fields: [
        {
          name: "Name",
          value: data.name,
          inline: true
        },
        {
          name: "Email",
          value: data.email,
          inline: true
        },
        {
          name: "Role",
          value: data.role || "Not specified",
          inline: true
        },
        {
          name: "Use Case",
          value: data.use_case || "Not specified",
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Neura AI Waitlist"
      }
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      }),
    });
  } catch (error) {
    // Fail silently - don't break the user experience if Discord fails
    console.warn('Failed to send Discord notification:', error);
  }
}