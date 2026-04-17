import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, RotateCcw, Copy, Check, Users, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Chip from '../components/Chip'
import UserSpot from '../components/UserSpot'

const CHIP_VALUES = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕']
const CHIP_COLORS = ['purple', 'blue', 'pink', 'green', 'gold']

const Room = () => {
  const { id: roomId } = useParams()
  const navigate = useNavigate()
  const [name] = useState(localStorage.getItem('poker_name') || 'Anonymous')
  const [votes, setVotes] = useState([])
  const [isRevealed, setIsRevealed] = useState(false)
  const [myVote, setMyVote] = useState(null)
  const [presence, setPresence] = useState({})
  const [copied, setCopied] = useState(false)

  // Unique session ID for each tab to ensure separate seats
  const sessionId = useRef(Math.random().toString(36).substring(2, 9))
  const channelRef = useRef(null)

  useEffect(() => {
    if (!name) { navigate('/'); return; }

    const fetchInitial = async () => {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single()
      if (roomData) setIsRevealed(roomData.is_revealed)

      const { data: voteData } = await supabase.from('votes').select('*').eq('room_id', roomId)
      if (voteData) {
        setVotes(voteData)
        const mine = voteData.find(v => v.user_name === name)
        if (mine) setMyVote(mine.vote_value)
      }
    }
    fetchInitial()

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: sessionId.current,
        },
      },
    })

    channelRef.current = channel

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
      }, (p) => {
        setIsRevealed(p.new.is_revealed)
        if (!p.new.is_revealed) setMyVote(null)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `room_id=eq.${roomId}`
      }, () => refreshVotes())
      .on('presence', { event: 'sync' }, () => {
        setPresence(channel.presenceState())
      })
      .subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          await channel.track({
            name,
            id: sessionId.current,
            joined_at: new Date().toISOString()
          })
        }
      })

    return () => { channel.unsubscribe() }
  }, [roomId, name, navigate])

  const refreshVotes = async () => {
    const { data } = await supabase.from('votes').select('*').eq('room_id', roomId)
    if (data) setVotes(data)
  }

  const handleVote = async (val) => {
    setMyVote(val)
    await supabase.from('votes').upsert({ room_id: roomId, user_name: name, vote_value: val }, { onConflict: 'room_id,user_name' })
  }

  const toggleReveal = async () => {
    const next = !isRevealed
    await supabase.from('rooms').update({ is_revealed: next }).eq('id', roomId)
    if (!next) {
      await supabase.from('votes').delete().eq('room_id', roomId)
      setVotes([]); setMyVote(null)
    }
  }

  // Refined Positioning: Placing spots on the rim of the 700x350 table
  const getPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    const rx = 370 // Slightly larger than the 350px table width to sit on the rim
    const ry = 190 // Slightly larger than the 175px table height
    return {
      left: `calc(50% + ${Math.cos(angle) * rx}px)`,
      top: `calc(50% + ${Math.sin(angle) * ry}px)`,
      transform: 'translate(-50%, -50%)'
    }
  }

  const activePlayers = Object.keys(presence).map(k => presence[k][0])
  const voteValues = votes.map(v => parseFloat(v.vote_value)).filter(v => !isNaN(v))
  const average = voteValues.length ? (voteValues.reduce((a, b) => a + b, 0) / voteValues.length).toFixed(1) : '-'
  const consensus = new Set(votes.map(v => v.vote_value)).size === 1 && votes.length > 1

  return (
    <div className="min-vh-100 flex flex-col p-6 overflow-hidden">
      <header className="flex justify-between items-center glass p-4 rounded-2xl mb-8 z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Table Session</span>
            <h2 className="text-xl font-bold text-purple-400"># {roomId}</h2>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-muted" />
            <span className="font-bold">{activePlayers.length} Seated</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="btn-poker-outline px-4 py-2 text-sm flex items-center gap-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Link Copied' : 'Invite Fleet'}
          </button>
          <button onClick={toggleReveal} className="btn-poker px-6 py-2 text-sm flex items-center gap-2">
            {isRevealed ? <RotateCcw size={16} /> : <Eye size={16} />}
            {isRevealed ? 'Reset Table' : 'Reveal Table'}
          </button>
          <button onClick={() => navigate('/')} className="btn-poker-outline p-2"><LogOut size={16} /></button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative">
        <div className="poker-table-container">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="poker-table flex items-center justify-center">
            <AnimatePresence>
              {isRevealed && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1 z-10 glass p-6 rounded-3xl">
                  <span className="text-xs uppercase font-bold tracking-tighter opacity-50">Team Average</span>
                  <span className="text-6xl font-black text-gold" style={{ color: 'var(--gold)' }}>{average}</span>
                  {consensus && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">Consensus Reached!</span>}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {activePlayers.map((player, idx) => (
            <UserSpot
              key={player.id || idx}
              name={player.name}
              isMe={player.id === sessionId.current}
              vote={votes.find(v => v.user_name === player.name)?.vote_value}
              isRevealed={isRevealed}
              positionStyle={getPosition(idx, activePlayers.length)}
            />
          ))}
        </div>
      </main>

      <footer className="mt-8 z-20 flex flex-col items-center gap-4">
        <div className="glass p-6 px-10 rounded-[40px] flex items-center gap-4 overflow-x-auto max-w-full">
          <div className="text-xs font-bold text-muted vertical-text mr-4">SELECT<br />CHIP</div>
          {CHIP_VALUES.map((val, i) => (
            <Chip key={val} value={val} color={CHIP_COLORS[i % CHIP_COLORS.length]} className={myVote === val ? 'ring-4 ring-white ring-offset-4 ring-offset-bg-dark' : ''} onClick={() => !isRevealed && handleVote(val)} />
          ))}
        </div>
        <p className="text-xs text-muted font-medium opacity-50">Your identity and seat are locked for this session.</p>
      </footer>
    </div>
  )
}

export default Room
