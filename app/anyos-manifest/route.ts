import { translations } from '../translations'
import { SERVICES, TESTIMONIALS } from '../site-data'

export function GET() {
  const text: Record<string, string> = {}
  for (const [key, value] of Object.entries(translations.en)) {
    if (/^(hero\.|about\.|services\.(label|title|ps\.|el\.|ee\.)|testimonials\.|footer\.(tagline|rights)$|nav\.(home|services|contact)$|contact\.(label|title|desc|sent|service|send)$|contact\.service\.)/.test(key)) text[key === 'about.title1' ? 'about.title' : key] = value
  }
  for (const service of SERVICES) { service.includes.forEach((item, i) => { text[`services.${service.id}.item${i + 1}`] = item }); text[`services.${service.id}.cta`] = 'Get in touch' }
  for (const item of TESTIMONIALS) for (const key of ['text', 'name', 'role', 'service'] as const) text[`testimonials.${item.id}.${key}`] = item[key]
  Object.assign(text, { 'hero.title': 'Left Hand Lucy', 'nav.brand': 'Left Hand Lucy', 'nav.cta': translations.en['nav.contact'], 'footer.brand': 'Left Hand Lucy', 'footer.link.services': translations.en['nav.services'], 'footer.link.about': translations.en['about.label'], 'footer.link.contact': translations.en['nav.contact'], 'footer.link.conectados': 'Conectados', 'footer.contactline': 'Lucy@lefthandlucy.com · Madrid, Spain', 'contact.card.email.label': 'Email', 'contact.card.email.value': 'Lucy@lefthandlucy.com', 'contact.card.location.label': 'Location', 'contact.card.location.value': 'Madrid, Spain', 'contact.card.whatsapp.label': 'WhatsApp', 'contact.card.whatsapp.value': 'Message me' })
  return Response.json({ version: 1, site: 'left-hand-lucy', text, images: { 'hero.image': '/images/lucy-hero.jpg', 'about.image': '/images/lucy.jpg' }, styles: {
    '__var.lucy-sage': { type: 'color', default: '#436c57' }, '__var.lucy-gold': { type: 'color', default: '#94713b' }, '__var.lucy-charcoal': { type: 'color', default: '#273d35' }, '__var.lucy-cream': { type: 'color', default: '#faf8f3' },
    '__var.section-space': { type: 'px', min: 24, max: 120, default: '72px' }, '__var.heading-size': { type: 'px', min: 36, max: 100, default: '68px' }, '__var.hero-image-height': { type: 'px', min: 400, max: 900, default: '620px' }, '__var.button-radius': { type: 'px', min: 0, max: 30, default: '8px' }, '__var.card-radius': { type: 'px', min: 0, max: 40, default: '16px' }, '__var.content-width': { type: 'px', min: 900, max: 1440, default: '1160px' },
  }, sections: true })
}
