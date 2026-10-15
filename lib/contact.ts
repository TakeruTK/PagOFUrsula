/** "@user" for an Instagram or TikTok profile, or the page name of a Facebook one. */
export const profileHandle = (url: string) => { const last = url.split('?')[0].split('/').filter(Boolean).pop() || ''; return last.startsWith('@') ? last : `@${last}`; };

/** Contact links: sales happen in conversation, so every piece leads to WhatsApp, email or Instagram. */
export const whatsappLink = (number: string, message: string) => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
export const mailLink = (email: string, subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
