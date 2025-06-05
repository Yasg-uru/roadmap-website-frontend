import React from 'react'
import { RoadmapGenerator } from './roadmap-generator'

import HeroSection from './hero'
import ContactSupport from './contact-support'
import FooterSection from './footer'
import FeaturesSection from './features'
import BlogSection from './blog-section'

const Home = () => {
  return (
   <>
   <HeroSection />
      <FeaturesSection />
      <BlogSection />
      <ContactSupport />
      <FooterSection />
   </>
  )
}

export default Home
