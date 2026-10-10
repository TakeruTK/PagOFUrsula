import Link from 'next/link';
import { whatsappLink } from '@/lib/contact';
import type { Dictionary } from '@/lib/dictionaries';
import { pagePath, type Locale } from '@/lib/i18n';
import type { Settings } from '@/lib/pieces';

/** Closing call to action shared by the pages: sales happen in conversation. */
export default function Cta({ lang, dict, settings, id }: { lang: Locale; dict: Dictionary; settings: Settings; id?: string }) {
  return <section className="cta" id={id}>
    <h2>{dict.cta.title}</h2>
    <div className="cta-row">
      {settings.whatsapp && <a className="btn solid" href={whatsappLink(settings.whatsapp, dict.cta.whatsappMessage)} target="_blank" rel="noreferrer noopener">{dict.cta.whatsapp}</a>}
      {settings.contactEmail && <a className="btn" href={`mailto:${settings.contactEmail}`}>{dict.cta.email}</a>}
      {!settings.whatsapp && !settings.contactEmail && <Link className="btn solid" href={pagePath(lang, 'contact')}>{dict.home.contactLink}</Link>}
    </div>
    <small>{dict.cta.note}</small>
  </section>;
}
