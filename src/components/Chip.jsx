import React from 'react'
import { motion } from 'framer-motion'

const Chip = ({ value, color = 'blue', size = 'md', className = '', onClick }) => {
  const colorMap = {
    purple: 'chip-purple',
    blue: 'chip-blue',
    pink: 'chip-pink',
    green: 'chip-green',
    gold: 'chip-gold'
  }

  const selectedColor = colorMap[color] || 'chip-blue'

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className={`chip ${selectedColor} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span>{value}</span>
    </motion.div>
  )
}

export default Chip
