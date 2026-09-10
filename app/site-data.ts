import { Briefcase, BookOpen, Compass } from 'lucide-react'

export const SERVICES = [
  { id: 'ps', Icon: Briefcase, includes: ['Email & inbox management', 'Calendar & scheduling', 'Research & analysis', 'Task coordination & deadlines', 'Document preparation', 'Travel arrangements'] },
  { id: 'el', Icon: BookOpen, includes: ['Conversational English', 'Business & professional English', 'Children & young adults', 'Exam preparation (Cambridge, IELTS)', 'Pronunciation & accent coaching', 'Flexible online or in-person'] },
  { id: 'ee', Icon: Compass, includes: ['Venue sourcing & coordination', 'Madrid city experiences & tours', 'Concierge planning for visitors', 'Group events & social gatherings', 'Restaurant & activity bookings', 'On-the-day coordination'] },
]
export const TESTIMONIALS = [
  { id: 't1', text: "I moved to Madrid recently, and Lucy's lessons helped me feel at home so quickly. Her explanations are simple, her examples practical, and she makes learning fun. I feel far more confident speaking now.", name: 'Amelia Grant', role: 'English student', service: 'English Lessons' },
  { id: 't2', text: "I've tried a few English tutors over the years, but Lucy stands out immediately. Her teaching style is clear, patient, and completely tailored to what I need. I genuinely look forward to our sessions each week.", name: 'Marco Hernández', role: 'Professional in Madrid', service: 'English Lessons' },
  { id: 't3', text: "Lucy is an absolute gem. She took my scattered ideas and turned them into a beautifully organised event that felt effortless from start to finish. Her calm approach and attention to detail made the whole experience stress-free.", name: 'Sophie Aldridge', role: 'Private event client', service: 'Events & Experiences' },
  { id: 't4', text: "I was drowning in admin and deadlines. Lucy stepped in and within a week everything was organised and running smoothly. She's incredibly reliable and nothing is too much trouble.", name: 'David Chen', role: 'Small business owner', service: 'Project Support' },
  { id: 't5', text: "My daughter's confidence in English has absolutely soared since starting lessons with Lucy. She makes it feel like fun, not work. We couldn't be happier.", name: 'Isabel Moreno', role: 'Parent', service: 'English Lessons' },
]
