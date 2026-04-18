import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Chip from './Chip'

const UserSpot = ({ name, vote, isRevealed, isMe }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Thrown Chip (Center of the spot) */}
      <div className="h-16 w-16 flex items-center justify-center relative mb-2">
        <AnimatePresence>
          {vote && (
            <motion.div
              initial={{ scale: 3, y: -100, rotate: 360, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="absolute z-10"
            >
              <Chip 
                value={isRevealed ? vote : '?'} 
                color={isRevealed ? 'gold' : 'purple'} 
                className={isRevealed ? 'animate-flip' : ''}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Thinking Pulse */}
        {!vote && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 rounded-full border-2 border-dashed border-white/20"
          />
        )}
      </div>

      {/* Seat / Avatar */}
      <div className="flex flex-col items-center gap-1 group">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm glass
            ${isMe ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-bg-dark' : 'border border-white/10'}
          `}
          style={{ 
            background: isMe ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'var(--glass-bg)',
          }}
        >
          {initials}
        </motion.div>
        
        <div className={`
          px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest
          ${isMe ? 'text-purple-400' : 'text-white/60'}
        `}>
          {name} {isMe && '(YOU)'}
        </div>
      </div>
    </div>
  )
}

export default UserSpot
