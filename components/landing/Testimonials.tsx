'use client';

import { motion } from 'framer-motion';
import { TrophyIcon, UsersIcon } from 'lucide-react';

import Badge from './Badge';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'GHOST_OPS',
      rank: 'Captain',
      text: '"QuestBoard turned my messy to-do list into a proper mission log. The streak system keeps me accountable every single day."',
      bg: 'bg-[#faedcd]',
    },
    {
      name: 'NOVA_STRIKE',
      rank: 'Sergeant',
      text: '"The XP system is genuinely motivating. I went from Level 1 to Level 6 in two months just by being consistent."',
      bg: 'bg-[#ccd5ae]',
    },
    {
      name: 'IRON_WOLF',
      rank: 'Colonel',
      text: '"Clean, fast, and fun to use. The strategies center shows me exactly where I am productive and where I am slacking off."',
      bg: 'bg-[#e9edc9]',
    },
  ];

  return (
    <section className='py-16 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black'>
      <div className='max-w-5xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-10 sm:mb-12'
        >
          <Badge bg='bg-[#faedcd]'>
            <UsersIcon size={10} />
            Testimonials
          </Badge>

          <h2 className='text-3xl sm:text-4xl md:text-5xl font-oi uppercase mt-4 break-words leading-tight'>
            Commanders speak
          </h2>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`${testimonial.bg} border-4 border-black rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between`}
            >
              <p className='font-sans text-sm opacity-65 leading-relaxed mb-5 break-words'>
                {testimonial.text}
              </p>

              <div className='flex items-center gap-3 mt-auto pt-2'>
                <div className='w-9 h-9 bg-[#d4a373] border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0'>
                  <TrophyIcon size={16} />
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='text-sm uppercase leading-tight truncate font-luckiest'>
                    {testimonial.name}
                  </p>

                  <p className='text-[10px] opacity-40 uppercase truncate font-luckiest mt-0.5'>
                    {testimonial.rank}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}