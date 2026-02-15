'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const focusAreas = [
  {
    id: 'substance',
    label: 'Substance',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    id: 'adult-content',
    label: 'Adult Content',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    id: 'social-media',
    label: 'Social Media',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    id: 'gambling',
    label: 'Gambling',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Other',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
];

export default function CustomizePage() {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [supportPerson, setSupportPerson] = useState(true);
  const [supporterEmail, setSupporterEmail] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedData, setAgreedData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedArea) {
      alert('Please select an area of focus');
      return;
    }
    if (!agreedTerms) {
      alert('Please agree to the Terms & Conditions');
      return;
    }

    setIsLoading(true);

    // TODO: Connect to backend API
    const data = {
      focusArea: selectedArea,
      supportPerson: supportPerson ? supporterEmail : null,
      agreedTerms,
      agreedData,
    };
    console.log('Customization data:', data);
    localStorage.setItem('selectedAddiction', JSON.stringify([selectedArea]));

    setTimeout(() => {
      setIsLoading(false);
      router.push('/login');
    }, 1000);
  };

  return (
    <>
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[340px] bg-gradient-to-b from-[#40738E] to-[#2d5a72] text-white flex-col justify-between p-8 rounded-l-2xl relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />

        <div>
          {/* Brand */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide">Recoverly</span>
          </div>

          {/* Motivational text */}
          <h2 className="text-[28px] font-bold leading-tight mb-4">
            Your journey begins with a single step.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Join 10,000+ others in a safe, anonymous, and supportive environment built for lasting change.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-semibold text-sm">Account Setup</p>
              <p className="text-white/60 text-xs">Personal information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-semibold text-sm">Customization</p>
              <p className="text-white/60 text-xs">Personalize your path</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs mt-8">
          &copy; 2026 Recoverly. HIPAA Compliant &amp; Secure.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-8 md:p-10 flex flex-col overflow-y-auto">
        <div className="max-w-lg mx-auto w-full">
          {/* Back link */}
          <Link href="/signup" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Account
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Personalize Your Path</h1>
          <p className="text-gray-500 text-sm mb-6">Tell us what you&apos;re focusing on for a tailored experience.</p>

          {/* Area of Focus */}
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Area of Focus
          </label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {focusAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedArea(area.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  selectedArea === area.id
                    ? 'border-[#40738E] bg-[#edf3f7] text-[#40738E]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {area.icon}
                {area.label}
              </button>
            ))}
          </div>

          {/* Support Person */}
          <div className="bg-[#F7FBFE] border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Add a Support Person</p>
                  <p className="text-xs text-gray-500">Invite a trusted friend or family member</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSupportPerson(!supportPerson)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  supportPerson ? 'bg-[#40738E]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    supportPerson ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {supportPerson && (
              <div className="mt-3">
                <input
                  type="email"
                  value={supporterEmail}
                  onChange={(e) => setSupporterEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#40738E] focus:border-transparent outline-none transition text-sm"
                  placeholder="Supporter's email address"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  They will receive an invitation to view your progress dashboard. You can revoke access anytime.
                </p>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setAgreedTerms(!agreedTerms)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                  agreedTerms ? 'bg-[#40738E] border-[#40738E]' : 'border-gray-300'
                }`}
              >
                {agreedTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="font-semibold text-gray-900 hover:text-[#40738E]">Terms &amp; Conditions</a>
                {' '}and acknowledge the{' '}
                <a href="#" className="font-semibold text-gray-900 hover:text-[#40738E]">Privacy Policy</a>.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setAgreedData(!agreedData)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                  agreedData ? 'bg-[#40738E] border-[#40738E]' : 'border-gray-300'
                }`}
              >
                {agreedData && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-600">
                I consent to the usage of anonymous data to help improve recovery research and insights.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !agreedTerms}
            className="w-full bg-gradient-to-r from-[#40738E] to-[#8CD092] text-white py-3.5 rounded-xl font-semibold hover:from-[#365f75] hover:to-[#7ac085] focus:outline-none focus:ring-2 focus:ring-[#40738E] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Setting up...
              </span>
            ) : (
              <>
                Start My Recovery Journey
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
