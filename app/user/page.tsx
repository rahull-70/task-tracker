'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Fixed icon names for Lucide
import { 
  User, 
  Shield, 
  Target, 
  Zap, 
  Award, 
  Settings2,
  Save,
  X
} from 'lucide-react';

const UserProfileCard = () => {
  // 1. STATE: Manage the user data
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    codename: "GHOST_OPERATOR",
    rank: "Elite Commander",
    email: "commander@questboard.com",
    joined: "05/2026",
    stats: {
      missions: 142,
      accuracy: "88%",
      streak: 12
    }
  });

  // 2. STATE: Temporary storage for edits
  const [editForm, setEditForm] = useState({ ...user });

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  return (
    <div className='min-h-screen bg-soft flex items-center justify-center p-6 font-luckiest text-foreground'>
      <motion.div 
        layout // Smooth layout transition when resizing
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='w-full max-w-2xl bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden'
      >
        {/* HEADER AREA */}
        <div className='bg-primary h-24 border-b-4 border-black relative'>
          <div className='absolute -bottom-12 left-8'>
            <div className='relative'>
              <div className='w-24 h-24 bg-secondary border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center'>
                <User size={48} className='text-white' />
              </div>
              <div className='absolute -bottom-2 -right-2 bg-[#caffbf] border-2 border-black p-1 rounded-lg'>
                <Shield size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE CONTENT */}
        <div className='pt-16 p-8'>
          <div className='flex flex-col md:flex-row justify-between items-start gap-6'>
            <div className='w-full md:w-auto'>
              {isEditing ? (
                <div className='space-y-2'>
                  <label className='text-xs uppercase opacity-50'>Update Codename</label>
                  <input 
                    className='text-3xl font-oi uppercase w-full bg-soft border-4 border-black p-2 outline-none focus:bg-white'
                    value={editForm.codename}
                    onChange={(e) => setEditForm({...editForm, codename: e.target.value.toUpperCase()})}
                  />
                </div>
              ) : (
                <>
                  <h2 className='text-4xl font-oi uppercase tracking-tighter'>{user.codename}</h2>
                  <p className='text-light-bronze text-xl uppercase opacity-80 flex items-center gap-2'>
                    <Award size={20} className='text-primary' /> {user.rank}
                  </p>
                </>
              )}
              <p className='text-sm mt-2 font-sans font-bold opacity-50 uppercase'>Active Since: {user.joined}</p>
            </div>
            
            {/* TOGGLE BUTTON */}
            <div className='flex gap-2'>
              {isEditing ? (
                <>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className='bg-[#caffbf] border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 uppercase'
                  >
                    <Save size={20} /> Save
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className='bg-red-400 border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 uppercase'
                  >
                    <X size={20} />
                  </motion.button>
                </>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05, x: 2, y: 2, boxShadow: 'none' }}
                  onClick={() => setIsEditing(true)}
                  className='bg-soft border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 uppercase'
                >
                  <Settings2 size={20} /> Edit Gear
                </motion.button>
              )}
            </div>
          </div>

          {/* STAT GRID (Functional Visuals) */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-10'>
            <div className='bg-[#ffd6a5] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <div className='flex items-center gap-2 mb-1 opacity-70'>
                <Target size={16} /> <span className='text-xs uppercase'>Quest</span>
              </div>
              <p className='text-3xl'>{user.stats.missions}</p>
            </div>

            <div className='bg-[#caffbf] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <div className='flex items-center gap-2 mb-1 opacity-70'>
                <Zap size={16} /> <span className='text-xs uppercase'>Success</span>
              </div>
              <p className='text-3xl'>{user.stats.accuracy}</p>
            </div>

            <div className='bg-[#9bf6ff] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <div className='flex items-center gap-2 mb-1 opacity-70'>
                <Award size={16} /> <span className='text-xs uppercase'>Streak</span>
              </div>
              <p className='text-3xl'>{user.stats.streak}D</p>
            </div>
          </div>

          {/* SERVICE RECORD SECTION (Editable) */}
          <div className='mt-10 border-t-4 border-black pt-6'>
            <h3 className='text-xl uppercase mb-4'>Credentials</h3>
            <div className='bg-soft border-4 border-black p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <span className='opacity-60 uppercase'>Intel (Email)</span>
              {isEditing ? (
                <input 
                  className='bg-white border-2 border-black p-1 font-sans font-bold flex-1 md:ml-4'
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              ) : (
                <span className='font-sans font-bold'>{user.email}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfileCard;