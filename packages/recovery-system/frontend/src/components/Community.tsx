"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Heart, 
  MessageCircle, 
  Flag, 
  MoreVertical, 
  XCircle, 
  ShieldCheck 
} from 'lucide-react';

const Community = () => {
  // Community States
  const [communityFilter, setCommunityFilter] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);

  // Dummy Data
  const [communityPosts, setCommunityPosts] = useState([
    { 
      id: 1, 
      anonId: 'User#8821', 
      content: "I've officially hit 6 months today. If you're struggling on Day 1, please know it gets easier. The dashboard streaks were my only motivation for the first week.", 
      category: 'Success Story', 
      likes: 342, 
      comments: 24, 
      time: '2h ago',
      liked: true 
    },
    { 
      id: 2, 
      anonId: 'User#1105', 
      content: "How do you all handle cravings during social events? I have a wedding coming up and I'm quite nervous about the open bar.", 
      category: 'Alcohol Recovery', 
      likes: 85, 
      comments: 56, 
      time: '5h ago',
      liked: false 
    },
    { 
      id: 3, 
      anonId: 'User#4432', 
      content: "Highly recommend the 'Breathing Rhythm' game in the Games section. It really helped me lower my heart rate during a panic attack today.", 
      category: 'General Support', 
      likes: 128, 
      comments: 12, 
      time: '1d ago',
      liked: false 
    }
  ]);

  return (
    <div className="w-full bg-white sm:rounded-[40px] p-6 lg:p-10 font-sans text-slate-800 relative">
      
      {/* HEADER */}
      <section>
        <p className="text-slate-400 text-sm font-medium mb-1">Portal {'>'} Community</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Anonymous Community</h1>
      </section>

      {/* MAIN COMMUNITY CONTENT */}
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Anonymous Feed</h2>
            <p className="text-slate-400 font-medium">Connect with others navigating similar paths.</p>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#86D293] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#86D293]/20 hover:scale-[1.02] transition-all"
          >
            <Plus size={18} /> Share Your Story
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COMMUNITY FILTERS / SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm sticky top-10">
              <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Support Categories</h3>
              <div className="space-y-2">
                {['All', 'Alcohol Recovery', 'Success Story', 'Family Support', 'CBT Wins', 'General Support'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCommunityFilter(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      communityFilter === cat ? 'bg-[#F3F7F3] text-[#4A7C7C]' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50">
                <div className="bg-[#4A7C7C] rounded-2xl p-4 text-white">
                  <p className="text-[10px] font-bold uppercase opacity-60 mb-2">Privacy Note</p>
                  <p className="text-[11px] leading-relaxed">
                    Your real identity is never shown. We use unique User IDs to maintain your anonymity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* POST FEED */}
          <div className="lg:col-span-9 space-y-6">
            {communityPosts
              .filter(post => communityFilter === 'All' || post.category === communityFilter)
              .map(post => (
                <div key={post.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                        <Users size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{post.anonId}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            post.category === 'Success Story' ? 'bg-[#EAF7ED] text-[#86D293]' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {post.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">• {post.time}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-8">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                    <button className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
                      <Heart size={18} fill={post.liked ? "currentColor" : "none"} />
                      {post.likes} Hearts
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#4A7C7C] transition-colors">
                      <MessageCircle size={18} />
                      {post.comments} Comments
                    </button>
                    <button className="ml-auto text-slate-300 hover:text-orange-400 transition-colors">
                      <Flag size={18} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Share Anonymously</h3>
              <button 
                onClick={() => setShowPostModal(false)} 
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                <XCircle size={24} className="text-slate-300" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Category</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-[#86D293] text-sm text-slate-600 font-medium">
                  <option>Alcohol Recovery</option>
                  <option>Substance Recovery</option>
                  <option>Family Support</option>
                  <option>Success Story</option>
                  <option>CBT Wins</option>
                  <option>General Support</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Message</label>
                <textarea 
                  placeholder="What's on your mind? Your post is completely anonymous."
                  className="w-full h-40 p-6 bg-slate-50 rounded-[32px] border-none outline-none ring-1 ring-slate-100 focus:ring-[#86D293] text-sm resize-none text-slate-700"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 p-4 bg-[#F3F7F3] rounded-2xl">
                <ShieldCheck size={18} className="text-[#86D293]" />
                <p className="text-[10px] text-slate-500 font-medium">
                  Your real name and profile picture will never be visible to other members.
                </p>
              </div>
              <button className="w-full py-4 bg-[#86D293] text-white rounded-[24px] font-bold shadow-lg shadow-[#86D293]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Post to Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
