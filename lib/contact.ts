/** Contact links: sales happen in conversation, so every piece leads to WhatsApp, email or Instagram. */
export const whatsappLink = (number: string, message: string) => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
export const mailLink = (email: string, subject: string, body: string) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
