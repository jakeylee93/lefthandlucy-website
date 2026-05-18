import type { CmsContentItem } from './types'

const item = (key: string, label: string, section: string, type: CmsContentItem['type'], value: string): CmsContentItem => ({
  key,
  label,
  page: '/',
  section,
  type,
  value,
})

export const CMS_DEFAULT_ITEMS: CmsContentItem[] = [
  item('home.nav.home', 'Nav: Home', 'Navigation', 'shortText', 'Home'),
  item('home.nav.services', 'Nav: Services', 'Navigation', 'shortText', 'Services'),
  item('home.nav.meet', 'Nav: Meet Lucy', 'Navigation', 'shortText', 'Meet Lucy'),
  item('home.nav.contact', 'Nav: Let’s Talk', 'Navigation', 'shortText', "Let's Talk"),
  item('home.hero.tags', 'Hero: eyebrow', 'Hero', 'shortText', 'IN PERSON. VIRTUAL. FLEXIBLE.'),
  item('home.hero.title', 'Hero: title', 'Hero', 'shortText', 'Left Hand Lucy'),
  item('home.hero.tagline', 'Hero: tagline', 'Hero', 'shortText', "A steady hand for life's busy corners."),
  item('home.hero.mobileIntro', 'Hero: mobile intro', 'Hero', 'longText', 'Multilingual EA, teacher and event planner in Madrid — calm support for busy people.'),
  item('home.hero.intro', 'Hero: intro', 'Hero', 'longText', "I'm Lucy - a multilingual Executive Assistant, qualified teacher, event planner and organiser based in Madrid. I help busy people feel clearer, more confident and more in control, whether that means project support, English lessons, or a beautifully organised event."),
  item('home.hero.ctaPrimary', 'Hero: primary CTA', 'Hero', 'shortText', "Let's talk?"),
  item('home.hero.ctaSecondary', 'Hero: secondary CTA', 'Hero', 'shortText', 'See how I can help'),
  item('home.hero.tag.executive', 'Hero tag: Executive Assistant', 'Hero', 'shortText', 'Executive Assistant'),
  item('home.hero.tag.multilingual', 'Hero tag: Multilingual', 'Hero', 'shortText', 'Multilingual'),
  item('home.hero.tag.teacher', 'Hero tag: Qualified Teacher', 'Hero', 'shortText', 'Qualified Teacher'),
  item('home.hero.tag.planner', 'Hero tag: Event Planner', 'Hero', 'shortText', 'Event Planner'),
  item('home.services.mode', 'Services: eyebrow', 'Services', 'shortText', 'IN PERSON. VIRTUAL. FLEXIBLE.'),
  item('home.services.title', 'Services: title', 'Services', 'shortText', 'Three ways Lucy can help'),
  item('home.services.helper', 'Services: helper copy', 'Services', 'longText', 'Tap a tab to preview the service. The full detail appears below.'),
  item('home.services.project.title', 'Service: Project Support title', 'Services', 'shortText', 'Project Support'),
  item('home.services.project.desc', 'Service: Project Support description', 'Services', 'longText', 'Let Lucy take care of the to-do list. From inboxes and schedules to research and organisation, I offer support that helps keep things moving. I enjoy getting involved in different projects and helping bring ideas to life - offering calm, flexible support wherever it is needed.'),
  item('home.services.english.title', 'Service: English Lessons title', 'Services', 'shortText', 'English Lessons'),
  item('home.services.english.desc', 'Service: English Lessons description', 'Services', 'longText', 'Whether you want to improve conversation, writing or professional communication, I adapt lessons to your goals, pace and learning style. The lessons are designed to be enjoyable and help build confidence.'),
  item('home.services.events.title', 'Service: Events & Experiences title', 'Services', 'shortText', 'Events & Experiences'),
  item('home.services.events.desc', 'Service: Events & Experiences description', 'Services', 'longText', "Whether you're planning an event or visiting Madrid for the first time, I offer personal support to help everything run smoothly from start to finish. From curated city experiences to social gatherings and event coordination, I take care of the details so you can enjoy the moment."),
  item('home.services.spotlight.label', 'Services: spotlight label', 'Services', 'shortText', 'Service spotlight'),
  item('home.services.includes.label', 'Services: includes label', 'Services', 'shortText', 'What this can include'),
  item('home.services.ask', 'Services: ask CTA', 'Services', 'shortText', 'Ask Lucy about this'),
  item('home.who.label', 'Who I help: eyebrow', 'Who I help', 'shortText', 'Who I help'),
  item('home.who.title', 'Who I help: title', 'Who I help', 'longText', 'Calm support for busy people, growing confidence and memorable plans.'),
  item('home.who.desc', 'Who I help: description', 'Who I help', 'longText', 'Left Hand Lucy brings together executive support, teaching and event experience, so the help feels practical, personal and easy to work with.'),
  item('home.work.label', 'Ways to work: eyebrow', 'Ways to work', 'shortText', 'Ways we can work together'),
  item('home.work.title', 'Ways to work: title', 'Ways to work', 'shortText', 'In person, virtual and flexible around real life.'),
  item('home.about.label', 'About: eyebrow', 'Meet Lucy', 'shortText', 'Meet Lucy'),
  item('home.about.title1', 'About: title', 'Meet Lucy', 'shortText', 'Welcome to Left Hand Lucy'),
  item('home.about.title2', 'About: subtitle', 'Meet Lucy', 'shortText', "I'm glad you found me!"),
  item('home.about.p1', 'About: paragraph 1', 'Meet Lucy', 'longText', '"Another string to your bow" is something I\'ve heard often over the years, and it perfectly sums up my journey.'),
  item('home.about.p2', 'About: paragraph 2', 'Meet Lucy', 'longText', "I've built a varied career supporting High Net Worth Executives, teaching English as a Foreign Language to children and adults in Madrid, creating memorable events, and building strong connections along the way."),
  item('home.about.p3', 'About: paragraph 3', 'Meet Lucy', 'longText', 'Left Hand Lucy grew from a desire to bring together the things I enjoy most: supporting people with their personal and professional projects, helping others build confidence through English lessons, and creating meaningful events and experiences that bring people together.'),
  item('home.about.p4', 'About: paragraph 4', 'Meet Lucy', 'longText', "I'm confident working across different kinds of projects, adapting to what's needed, and being a reliable and discreet extra pair of hands behind the scenes."),
  item('home.about.cta', 'About: CTA', 'Meet Lucy', 'shortText', "Let's talk?"),
  item('home.about.badge', 'About: badge', 'Meet Lucy', 'shortText', 'Qualified Teacher'),
  item('home.about.badge.sub', 'About: badge subtitle', 'Meet Lucy', 'shortText', 'QTS · Madrid-based'),
  item('home.testimonials.label', 'Testimonials: eyebrow', 'Testimonials', 'shortText', 'Kind Words'),
  item('home.testimonials.title', 'Testimonials: title', 'Testimonials', 'shortText', 'What people say'),
  item('home.faq.label', 'FAQ: eyebrow', 'FAQ', 'shortText', 'FAQs'),
  item('home.faq.title', 'FAQ: title', 'FAQ', 'shortText', 'A few useful things to know.'),
  item('home.contact.label', 'Contact: eyebrow', 'Contact', 'shortText', 'Get in Touch'),
  item('home.contact.title', 'Contact: title', 'Contact', 'shortText', "Let's talk about how I can help"),
  item('home.contact.desc', 'Contact: description', 'Contact', 'longText', "Whether you have a project to organise, English confidence to build, or an event to plan - I'd love to hear from you. I usually reply within 1-2 working days."),
  item('home.contact.email.label', 'Contact card: email label', 'Contact', 'shortText', 'Email'),
  item('home.contact.location.label', 'Contact card: location label', 'Contact', 'shortText', 'Location'),
  item('home.contact.reply.label', 'Contact card: reply label', 'Contact', 'shortText', 'Reply time'),
  item('home.contact.reply.value', 'Contact card: reply value', 'Contact', 'shortText', 'Usually 1-2 working days'),
  item('home.footer.brand', 'Footer: brand', 'Footer', 'shortText', 'Left Hand Lucy'),
  item('home.footer.tagline', 'Footer: tagline', 'Footer', 'shortText', "A steady hand for life's busy corners"),
  item('home.footer.rights', 'Footer: rights', 'Footer', 'shortText', '© 2026 Left Hand Lucy. All rights reserved.'),
  item('home.footer.contact', 'Footer: contact line', 'Footer', 'shortText', 'Lucy@lefthandlucy.com · Madrid, Spain'),
]

export const CMS_DEFAULT_CONTENT = CMS_DEFAULT_ITEMS.reduce<Record<string, CmsContentItem>>((acc, entry) => {
  acc[entry.key] = entry
  return acc
}, {})

export function withCmsDefaults(content: Record<string, CmsContentItem> = {}) {
  return Object.fromEntries(
    Object.entries(CMS_DEFAULT_CONTENT).map(([key, fallback]) => [
      key,
      { ...fallback, ...(content[key] || {}), value: content[key]?.value || fallback.value },
    ]),
  ) as Record<string, CmsContentItem>
}
