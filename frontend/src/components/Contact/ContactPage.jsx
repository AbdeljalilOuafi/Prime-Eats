import React from 'react'
import ContactForm from './ContactForm'
import ContactHero from './ContactHero'
import ContactInfo from './ContactInfo'

export default function ContactPage() {
  return (
    <div>
      <ContactHero />
      <ContactForm />
      <ContactInfo />
    </div>
  )
}
