import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/contact';
import type { Dictionary } from '@/lib/dictionaries';

/** Fixed contact button on every page, shown once the owner has saved her WhatsApp number. */
export default function WhatsAppFloat({ number, dict }: { number: string; dict: Dictionary }) {
  return <a className="wa-float" href={whatsappLink(number, dict.cta.whatsappMessage)} target="_blank" rel="noreferrer noopener" aria-label={dict.cta.float}>
    <MessageCircle size={22} strokeWidth={1.5} aria-hidden />
    <span>WhatsApp</span>
  </a>;
}
