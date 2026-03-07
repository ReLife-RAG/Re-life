'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Smile, Target, CheckCircle, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: string[];
}

interface RecentActivityItem {
  id: string;
  icon: string;
  title: string;
  time: string;
  xp: number;
}

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activityCards: ActivityItem[] = [
    {
      id: 'recovery',
      icon: '🔥',
      title: 'Recovery Activities',
      description: 'Daily tasks and exercises',
      items: ['Daily tasks', 'Mindfulness activities', 'Habit building challenges', 'breathing bubble'],
    },
    {
      id: 'consultant',
      icon: '👨‍⚕️',
      title: 'Consultant & Community',
      description: 'Get professional support',
      items: ['Chat with a Consultant', 'Ask a Question', 'Group Discussions'],
    },
    {
      id: 'anonymous',
      icon: '🤝',
      title: 'Anonymous community',
      description: 'Connect anonymously',
      items: ['Find a community', 'Ask a Question', 'Chat anonymous', 'Success Stories'],
    },
  ];

  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      icon: '✓',
      title: 'Completed Breathing Bubble',
      time: 'Today, 5:30 AM',
      xp: 20,
    },
    {
      id: '2',
      icon: '📝',
      title: 'Journal Entry Logged',
      time: 'Yesterday, 8:15 PM',
      xp: 15,
    },
    {
      id: '3',
      icon: '💬',
      title: 'Posted in Community',
      time: 'Yesterday, 2:00 PM',
      xp: 10,
    },
  ];

  const slideTranslates = [
    'translate-x-0',
    '-translate-x-full',
    '-translate-x-[200%]',
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activityCards.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activityCards.length) % activityCards.length);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
          Welcome back, Daniel
        </h1>
        <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900">14 Days</p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        {/* Mood Score */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase mb-1">Mood Score</p>
              <p className="text-3xl font-bold text-gray-900">8.5/10</p>
            </div>
            <div className="text-4xl">😊</div>
          </div>
        </div>

        {/* Next Goal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase mb-1">Next Goal</p>
              <p className="text-3xl font-bold text-gray-900">30 Days</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        {/* Check-ins */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase mb-1">Check-ins</p>
              <p className="text-3xl font-bold text-gray-900">12/14</p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>
      </div>

      {/* Activity Cards Carousel */}
      <div className="mb-8">
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className={`flex transition-transform duration-300 ease-out ${slideTranslates[currentSlide]}`}
            >
              {activityCards.map((card) => (
                <div key={card.id} className="w-full flex-shrink-0 px-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activityCards.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition h-full"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-blue-600 text-xs font-bold uppercase mb-2">
                              {c.title}
                            </p>
                            <h3 className="text-xl font-bold text-gray-900">{c.title}</h3>
                          </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {c.items.map((item, idx) => (
                            <li key={idx} className="flex items-center text-gray-700">
                              <span className="text-blue-500 mr-3">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>

                        <button aria-label="Go to section" className="text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-2 transition">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-16 bg-blue-300 hover:bg-blue-400 text-white rounded-full p-3 shadow-md transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-16 bg-blue-300 hover:bg-blue-400 text-white rounded-full p-3 shadow-md transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {activityCards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition ${
                idx === currentSlide ? 'bg-blue-500 w-8' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View All
          </a>
        </div>

        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+{activity.xp} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
