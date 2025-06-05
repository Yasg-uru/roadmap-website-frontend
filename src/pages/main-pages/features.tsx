"use client"

import { motion } from "framer-motion"
import { Network, FileText, Plus, BookOpen, TrendingUp } from "lucide-react"

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const features = [
    {
      title: "Get Roadmap For Developer, Marketers, Students, Business",
      icon: Network,
      illustration: "roadmap-network",
      size: "large",
    },
    {
      title: "Get Cheatsheets To Summarise Your Learning",
      icon: FileText,
      illustration: "cheatsheet",
      size: "medium",
    },
    {
      title: "Couldn't Find any roadmap on your topic, Create custom Roadmaps",
      icon: Plus,
      illustration: "custom-roadmap",
      size: "medium",
    },
    {
      title: "Get Free Resources to learn the concepts listed in the roadmap",
      icon: BookOpen,
      illustration: "resources",
      size: "medium",
    },
    {
      title: "Get Roadmap of all trending technologies",
      icon: TrendingUp,
      illustration: "trending",
      size: "large",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Features</h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`
                bg-[#1E293B] rounded-2xl p-8 border border-[#0F172A] 
                hover:border-[#3B82F6] transition-all duration-500 group cursor-pointer
                ${feature.size === "large" ? "md:col-span-2 lg:col-span-1" : ""}
                ${index === 0 ? "lg:row-span-2" : ""}
                ${index === 4 ? "lg:row-span-2" : ""}
              `}
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col h-[400px]">
                <motion.div className="mb-6" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }}>
                  <div className="w-16 h-16 bg-[#0F172A] rounded-xl flex items-center justify-center group-hover:bg-[#3B82F6] transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-[#2563EB] group-hover:text-white transition-colors duration-300" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-4 leading-tight group-hover:text-[#60A5FA] transition-colors duration-300">
                  {feature.title}
                </h3>

                <div className="flex-1 flex items-center justify-center mt-6">
                  <motion.div
                    className="w-full h-32 bg-[#0F172A] rounded-xl flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Animated illustration placeholder */}
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Floating particles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#60A5FA] rounded-full"
                        animate={{
                          x: [0, 20, -20, 0],
                          y: [0, -20, 20, 0],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.5,
                        }}
                        style={{
                          left: `${30 + i * 20}%`,
                          top: `${30 + i * 15}%`,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
