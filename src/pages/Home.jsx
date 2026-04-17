import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, LogIn, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const [name, setName] = useState(localStorage.getItem('poker_name') || '')
  const [roomIdInput, setRoomIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSaveName = (newName) => {
    setName(newName)
    localStorage.setItem('poker_name', newName)
  }

  const createRoom = async () => {
    if (!name.trim()) return alert('Please enter your name first.')
    setLoading(true)
    
    const newRoomId = Math.random().toString(36).substring(2, 9)
    
    const { error } = await supabase
      .from('rooms')
      .insert([{ id: newRoomId, is_revealed: false }])

    setLoading(false)
    navigate(`/room/${newRoomId}`)
  }

  const joinRoom = () => {
    if (!name.trim()) return alert('Please enter your name first.')
    if (!roomIdInput.trim()) return alert('Please enter a Room ID.')
    navigate(`/room/${roomIdInput.trim()}`)
  }

  return (
    <div className="min-vh-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-blue-600/20 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[32px] max-w-2xl w-full text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Monitor size={40} className="text-purple-400" />
          <h1 className="text-4xl font-bold tracking-tight">PLANNING POKER</h1>
        </div>
        <p className="text-muted mb-10 text-lg">High-stakes estimation for elite engineering teams.</p>

        <div className="flex flex-col gap-8 text-left">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold uppercase tracking-widest text-muted ml-1">Your Identity</label>
            <input 
              type="text" 
              placeholder="Enter your name..." 
              value={name}
              onChange={(e) => handleSaveName(e.target.value)}
              className="glass p-4 rounded-xl text-lg w-full outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Create Section */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-xl font-bold">New Session</h3>
              <p className="text-sm text-muted mb-2">Create a private table and invite your fleet.</p>
              <button 
                onClick={createRoom} 
                disabled={loading}
                className="btn-poker w-full flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {loading ? 'Opening Table...' : 'Create Table'}
              </button>
            </div>

            {/* Join Section */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
              <h3 className="text-xl font-bold">Join Session</h3>
              <input 
                type="text" 
                placeholder="Table code..." 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="glass p-3 rounded-lg text-sm bg-black/20"
              />
              <button 
                onClick={joinRoom}
                className="btn-poker-outline w-full flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                Join Table
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home
