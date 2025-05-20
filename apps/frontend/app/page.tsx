"use client"

import { Header } from "@/components/Header"
import { Button } from "@repo/ui/button"
import { useRouter } from "next/navigation"
import { HiOutlinePencilSquare } from "react-icons/hi2"
import { FiShare2, FiUsers, FiSave } from "react-icons/fi"
import { TypewriterEffect, TypewriterEffectSmooth } from "@/components/typeWritter-effect"
import { RoomModal } from "@/components/RoomModal"
import { useState } from "react"

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Header />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-4 items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-500/20 rounded-2xl">
            <HiOutlinePencilSquare size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Rosidraw</h1>
        </div>

        <div className="flex flex-col items-center justify-center">
          <TypewriterEffectSmooth
            words={[
              { text: "Draw together. Create together.", className: "text-indigo-200" }
            ]}
            className="max-w-3xl mx-auto"
          />
        </div>
        <h1 className="text-sm text-gray-400 mb-2">A collaborative drawing platform that brings your ideas to life.</h1>

        <div className="flex justify-center gap-4 mt-12">
          <Button
            children="Start Drawing"
            size="lg"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          />
          <Button
            children="Learn More"
            size="lg"
            variant="secondary"
            onClick={() => router.push('#features')}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm border border-slate-700">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <FiUsers size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Real-time Collaboration</h3>
            <p className="text-gray-400">Work together with your team in real-time. See changes instantly as they happen.</p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm border border-slate-700">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <FiShare2 size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Easy Sharing</h3>
            <p className="text-gray-400">Share your drawings with a simple link. No complicated setup required.</p>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm border border-slate-700">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
              <FiSave size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Auto-save</h3>
            <p className="text-gray-400">Never lose your work. Everything is automatically saved as you draw.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-500/10 py-20 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Start Drawing?
          </h2>
          <Button
            children="Get Started Now"
            size="lg"
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
            className="flex justify-center items-center w-48 mx-auto bg-indigo-500 hover:bg-indigo-600 text-white"
          />
        </div>
      </div>

      {/* Room Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
