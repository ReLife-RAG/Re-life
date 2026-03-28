'use client';

import React, { useState, useEffect, useRef, useCallback, KeyboardEvent, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { chatService, ChatConversation, ChatHistoryItem, ChatMessage } from '@/lib/chat-client';
import { getStreak } from '@/lib/auth-client';
import {
  Send,
  Plus,
  Trash2,
  Menu,
  MessageSquare,
  Shield,
  Heart,
  Flame,
  Zap,
  BookOpen,
  AlertCircle,
  ChevronDown,
  Copy,
  Check,
  Loader,
} from 'lucide-react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

const STORAGE_KEY = 'relife-chat-conversations-v1';
const TEMP_ID_PREFIX = 'local-';

const C = {
  teal: '#4A7C7C',
  tealDark: '#3a6060',
  tealLight: '#CFE1E1',
  tealFaint: '#EBF4F4',
  green: '#86D293',
  greenDark: '#5fa86e',
  ink: '#0f2420',
  inkMid: '#2d4a47',
  inkMuted: '#6b8a87',
  surface: '#FFFFFF',
  offWhite: '#F4F9F8',
  border: '#DDE9E8',
  danger: '#dc2626',
  dangerFaint: '#fef2f2',
  userBubble: '#4A7C7C',
  aiBubble: '#FFFFFF',
};

type ChatRole = 'user' | 'assistant';

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const QUICK_PROMPTS = [
  {
    Icon: Flame,
    label: 'Urge support',
    prompt: "I'm experiencing a strong urge right now. Can you help me get through it?",
  },
  {
    Icon: Heart,
    label: 'Check in',
    prompt: "I want to do a quick emotional check-in. How are common ways to assess how I'm feeling?",
  },
  {
    Icon: Shield,
    label: 'Coping tools',
    prompt: 'What are some evidence-based coping strategies I can use right now?',
  },
  {
    Icon: BookOpen,
    label: 'Reflect',
    prompt: "Help me reflect on my recovery journey so far and what's been working.",
  },
  {
    Icon: Zap,
    label: 'Motivation',
    prompt: 'I need some encouragement to keep going with my recovery. Can you help?',
  },
  {
    Icon: AlertCircle,
    label: 'I relapsed',
    prompt: 'I had a setback today. I need support without judgment to get back on track.',
  },
];

const genId = () => Math.random().toString(36).slice(2, 10);

const fmtTime = (value?: string) => {
  const d = value ? new Date(value) : new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const fmtDate = (value: string) => {
  const d = new Date(value);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const autoTitle = (firstMessage: string) =>
  firstMessage.length > 42 ? `${firstMessage.slice(0, 42)}...` : firstMessage;

const normalizeMessage = (m: ChatMessage): ChatMessage => ({
  role: m.role,
  content: m.content,
  timestamp: m.timestamp || new Date().toISOString(),
});

const sortConversations = (items: Conversation[]) =>
  [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

function splitServerHistoryIntoConversations(history: ChatMessage[]): Conversation[] {
  const messages = history.map(normalizeMessage);
  if (!messages.length) return [];

  const sessions: ChatMessage[][] = [];
  let current: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i += 1) {
    const msg = messages[i];
    const prev = messages[i - 1];

    const prevTs = prev?.timestamp ? new Date(prev.timestamp).getTime() : 0;
    const currTs = msg.timestamp ? new Date(msg.timestamp).getTime() : 0;
    const gap = prev ? currTs - prevTs : 0;

    const shouldStartNew =
      current.length > 0 &&
      msg.role === 'user' &&
      Number.isFinite(gap) &&
      gap > 1000 * 60 * 45;

    if (shouldStartNew) {
      sessions.push(current);
      current = [msg];
    } else {
      current.push(msg);
    }
  }

  if (current.length) sessions.push(current);

  return sortConversations(
    sessions.map((session, idx) => {
      const firstUser = session.find((m) => m.role === 'user');
      const firstTs = session[0]?.timestamp || new Date().toISOString();
      const lastTs = session[session.length - 1]?.timestamp || firstTs;
      return {
        id: `srv-${idx}-${firstTs}`,
        title: autoTitle(firstUser?.content || 'Conversation'),
        messages: session,
        createdAt: firstTs,
        updatedAt: lastTs,
      };
    })
  );
}

function readConversationsFromStorage(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return sortConversations(
      parsed
        .filter((c) => c && c.id && Array.isArray(c.messages))
        .map((c) => ({
          ...c,
          messages: c.messages.map(normalizeMessage),
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        }))
    );
  } catch {
    return [];
  }
}

const fromServerConversation = (c: ChatConversation): Conversation => ({
  id: c.id,
  title: c.title || 'Conversation',
  messages: (c.messages || []).map(normalizeMessage),
  createdAt: c.createdAt || new Date().toISOString(),
  updatedAt: c.updatedAt || new Date().toISOString(),
});

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} style={{ margin: '8px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {listItems.map((item, i) => (
          <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'inherit' }}>
            {inlineFormat(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const txt = line.replace(/^#{1,3}\s/, '');
      nodes.push(
        <p key={i} style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: '12px 0 4px', fontFamily: "'Fraunces', serif" }}>
          {txt}
        </p>
      );
    } else if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, ''));
    } else if (line.trim() === '') {
      flushList();
      nodes.push(<br key={i} />);
    } else {
      flushList();
      nodes.push(
        <p key={i} style={{ margin: '4px 0', fontSize: 14, lineHeight: 1.7 }}>
          {inlineFormat(line)}
        </p>
      );
    }
  }
  flushList();
  return nodes;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i} style={{ fontStyle: 'italic' }}>{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`')) {
      return (
        <code key={i} style={{ fontFamily: 'monospace', fontSize: 12, background: C.offWhite, padding: '1px 6px', borderRadius: 4, border: `1px solid ${C.border}`, color: C.tealDark }}>
          {p.slice(1, -1)}
        </code>
      );
    }
    return p;
  });
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '14px 18px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: C.teal,
            opacity: 0.5,
            animation: 'typingBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function ChatLogo({ size }: { size: number }) {
  return (
    <Image
      src="/images/chatlogo.png"
      alt="Re-Life Assistant"
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

function MessageBubble({ msg, onCopy }: { msg: ChatMessage; onCopy: (text: string) => void }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const copy = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 10, marginBottom: 4, animation: 'msgIn .3s ease both' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isUser && (
        <div
          style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${C.teal}30` }}
        >
          <ChatLogo size={24} />
        </div>
      )}

      <div style={{ maxWidth: 'min(82%, 720px)', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div
          style={{
            padding: isUser ? '11px 16px' : '14px 18px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? `linear-gradient(135deg, ${C.userBubble}, ${C.tealDark})` : C.aiBubble,
            border: isUser ? 'none' : `1px solid ${C.border}`,
            boxShadow: isUser ? `0 4px 16px ${C.teal}25` : '0 2px 8px rgba(15,36,32,.06)',
            color: isUser ? '#fff' : C.ink,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {isUser ? (
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
          ) : (
            <div style={{ color: C.inkMid }}>{renderMarkdown(msg.content)}</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, opacity: hovered ? 1 : 0, transition: 'opacity .2s' }}>
          <span style={{ fontSize: 11, color: C.inkMuted }}>{fmtTime(msg.timestamp)}</span>
          {!isUser && (
            <button
              onClick={copy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, color: C.inkMuted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", padding: '2px 6px', borderRadius: 6 }}
            >
              {copied ? <Check size={11} strokeWidth={2.5} color={C.greenDark} /> : <Copy size={11} strokeWidth={2} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPrompt, userName }: { onPrompt: (p: string) => void; userName: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 8px 32px ${C.teal}30` }}>
        <ChatLogo size={52} />
      </div>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 400, color: C.ink, marginBottom: 8, letterSpacing: '-.2px' }}>
        Hello, {userName}
      </h2>
      <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.6, maxWidth: 360, marginBottom: 36 }}>
        I am your recovery support assistant. I am here to listen, guide, and support you any time.
      </p>

      <div style={{ width: '100%', maxWidth: 560 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.inkMuted, marginBottom: 14 }}>Quick starts</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {QUICK_PROMPTS.map(({ Icon, label, prompt }) => (
            <button
              key={label}
              onClick={() => onPrompt(prompt)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMid, textAlign: 'left', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} strokeWidth={2} color={C.teal} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'flex-start', gap: 10, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', maxWidth: 500, textAlign: 'left' }}>
        <Shield size={15} strokeWidth={2} color={C.inkMuted} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.inkMuted, lineHeight: 1.5 }}>
          This AI provides support and information only. For emergencies or crisis situations, please contact a professional or call a crisis line immediately.
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [streakContext, setStreakContext] = useState<{ currentStreak: number; longestStreak: number; milestonesAchieved: string[] } | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [scrolledUp, setScrolledUp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = useMemo(() => conversations.find((c) => c.id === activeId) || null, [conversations, activeId]);
  const messages = activeConv?.messages || [];

  const updateConversation = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => sortConversations(prev.map((c) => (c.id === id ? updater(c) : c))));
  }, []);

  const createNewConversation = useCallback(() => {
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: `${TEMP_ID_PREFIX}${genId()}`,
      title: 'New chat',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          setActiveId(next[0]?.id || null);
        }
        return next;
      });
    },
    [activeId]
  );

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobileView(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setStreakContext(null);
      return;
    }

    (async () => {
      try {
        const streak = await getStreak();
        const milestonesAchieved = (streak.milestones || [])
          .filter((m) => m.achieved)
          .map((m) => m.name);

        setStreakContext({
          currentStreak: streak.currentStreak || 0,
          longestStreak: streak.longestStreak || 0,
          milestonesAchieved,
        });
      } catch {
        setStreakContext(null);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setHistoryLoading(false);
      return;
    }

    (async () => {
      try {
        const { messages: history, conversations: serverConversationsRaw } = await chatService.getChatHistory(user.id);
        const serverConversations = Array.isArray(serverConversationsRaw)
          ? sortConversations(serverConversationsRaw.map(fromServerConversation))
          : splitServerHistoryIntoConversations(history || []);

        if (serverConversations.length) {
          setConversations(serverConversations);
          setActiveId(serverConversations[0].id);
        } else {
          const localConversations = readConversationsFromStorage();
          if (localConversations.length) {
            setConversations(localConversations);
            setActiveId(localConversations[0].id);
          } else {
            createNewConversation();
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        const localConversations = readConversationsFromStorage();
        if (localConversations.length) {
          setConversations(localConversations);
          setActiveId(localConversations[0].id);
        } else {
          createNewConversation();
        }
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, [createNewConversation, user?.id]);

  useEffect(() => {
    if (!conversations.length || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (!scrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, scrolledUp]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setScrolledUp(scrollHeight - scrollTop - clientHeight > 120);
  };

  const sendMessage = useCallback(
    async (quickText?: string) => {
      const content = (quickText ?? input).trim();
      if (!content || loading) return;

      let convId = activeId;
      if (!convId) {
        const now = new Date().toISOString();
        const conv: Conversation = {
          id: `${TEMP_ID_PREFIX}${genId()}`,
          title: autoTitle(content),
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv.id);
        convId = conv.id;
      }

      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setInput('');
      setLoading(true);
      setScrolledUp(false);

      updateConversation(convId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? autoTitle(content) : c.title,
        messages: [...c.messages, userMessage],
        updatedAt: userMessage.timestamp || new Date().toISOString(),
      }));

      const historyPayload: ChatHistoryItem[] = [
        ...(activeConv?.messages || []).map((m) => ({ role: m.role as ChatRole, content: m.content })),
        { role: 'user', content },
      ];

      try {
        const normalizedConversationId = convId.startsWith(TEMP_ID_PREFIX) ? undefined : convId;
        if (!user?.id) {
          throw new Error('User session is required for chat');
        }

        const personalizedContext = {
          profile: {
            name: user?.name,
            addictionType: user?.addictionTypes?.[0],
            addictionTypes: user?.addictionTypes || [],
            sobrietyStartDate: user?.recoveryStart,
          },
          progress: {
            currentStreak: streakContext?.currentStreak || 0,
            longestStreak: streakContext?.longestStreak || 0,
            milestonesAchieved: streakContext?.milestonesAchieved || [],
          },
        };

        const response = await chatService.sendMessage(
          content,
          user.id,
          personalizedContext,
          historyPayload,
          normalizedConversationId
        );
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp || new Date().toISOString(),
        };

        updateConversation(convId, (c) => ({
          ...c,
          messages: [...c.messages, assistantMessage],
          updatedAt: assistantMessage.timestamp || new Date().toISOString(),
        }));

        if (response.conversationId && convId.startsWith(TEMP_ID_PREFIX)) {
          setConversations((prev) =>
            sortConversations(
              prev.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      id: response.conversationId as string,
                    }
                  : c
              )
            )
          );
          setActiveId(response.conversationId);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        const fallback: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please try again.',
          timestamp: new Date().toISOString(),
        };
        updateConversation(convId, (c) => ({
          ...c,
          messages: [...c.messages, fallback],
          updatedAt: fallback.timestamp || new Date().toISOString(),
        }));
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, activeId, activeConv?.messages, updateConversation, user?.id, user?.name, user?.addictionTypes, user?.recoveryStart, streakContext]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const groupedConversations = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const groups: { label: string; items: Conversation[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Older', items: [] },
    ];

    conversations.forEach((c) => {
      const d = new Date(c.updatedAt);
      if (d.toDateString() === now.toDateString()) groups[0].items.push(c);
      else if (d.toDateString() === yesterday.toDateString()) groups[1].items.push(c);
      else groups[2].items.push(c);
    });

    return groups.filter((g) => g.items.length > 0);
  }, [conversations]);

  return (
    <>
      <style>{FONTS}</style>
      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: ${C.tealLight}; border-radius: 999px; }
        .chat-layout { display: flex; height: calc(100dvh - 150px); }
        .mobile-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 36, 32, 0.36);
          z-index: 20;
        }
        @media (max-width: 900px) {
          .chat-layout { height: calc(100dvh - 130px); }
        }
      `}</style>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: isMobileView ? '12px 8px' : '24px 16px', height: '100dvh' }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: C.inkMuted, marginBottom: 4 }}>
            Portal &rsaquo; <strong style={{ color: C.inkMid, fontWeight: 600 }}>AI Assistant</strong>
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 34, color: C.ink }}>AI Relief Chat</h1>
        </div>

        <div
          className="chat-layout"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            background: C.offWhite,
            borderRadius: 20,
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            boxShadow: '0 4px 32px rgba(74,124,124,.08)',
            position: 'relative',
          }}
        >
          {isMobileView && sidebarOpen && (
            <button
              className="mobile-backdrop"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close chat sidebar"
              style={{ border: 'none', cursor: 'pointer' }}
            />
          )}

          <div
            style={{
              width: sidebarOpen ? 280 : 0,
              minWidth: sidebarOpen ? 280 : 0,
              transition: 'width .25s ease, min-width .25s ease',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: C.surface,
              borderRight: `1px solid ${C.border}`,
              position: isMobileView ? 'absolute' : 'relative',
              top: isMobileView ? 0 : 'auto',
              left: isMobileView ? 0 : 'auto',
              bottom: isMobileView ? 0 : 'auto',
              zIndex: isMobileView ? 30 : 'auto',
              boxShadow: isMobileView && sidebarOpen ? '0 8px 30px rgba(15,36,32,.18)' : 'none',
            }}
          >
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '20px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChatLogo size={24} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 400, color: C.ink, lineHeight: 1 }}>Re-Life AI</p>
                    <p style={{ fontSize: 10, color: C.inkMuted, marginTop: 2 }}>Recovery Assistant</p>
                  </div>
                </div>
                <button
                  onClick={createNewConversation}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${C.teal}`, background: C.tealFaint, color: C.teal, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Plus size={15} strokeWidth={2.5} /> New chat
                </button>
              </div>

              <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
                {historyLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${C.teal}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : groupedConversations.length === 0 ? (
                  <p style={{ fontSize: 13, color: C.inkMuted, textAlign: 'center', padding: '24px 12px', fontStyle: 'italic' }}>No conversations yet</p>
                ) : (
                  groupedConversations.map((group) => (
                    <div key={group.label} style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.inkMuted, padding: '4px 8px 6px', marginBottom: 2 }}>
                        {group.label}
                      </p>
                      {group.items.map((conv) => (
                        <div
                          key={conv.id}
                          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 12, cursor: 'pointer', transition: 'background .15s', background: conv.id === activeId ? C.tealFaint : 'transparent', marginBottom: 2 }}
                          onClick={() => {
                            setActiveId(conv.id);
                            if (isMobileView) setSidebarOpen(false);
                          }}
                        >
                          <MessageSquare size={14} strokeWidth={2} color={conv.id === activeId ? C.teal : C.inkMuted} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: conv.id === activeId ? 600 : 400, color: conv.id === activeId ? C.teal : C.inkMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.title}
                            </p>
                            <p style={{ fontSize: 10, color: C.inkMuted, marginTop: 1 }}>
                              {conv.messages.length} msg{conv.messages.length !== 1 ? 's' : ''} · {fmtDate(conv.updatedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: C.dangerFaint, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                            title="Delete local conversation"
                          >
                            <Trash2 size={12} strokeWidth={2} color={C.danger} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: C.offWhite, border: `1px solid ${C.border}` }}>
                  <Shield size={13} strokeWidth={2} color={C.inkMuted} />
                  <p style={{ fontSize: 11, color: C.inkMuted, lineHeight: 1.4 }}>Conversations are private and secure.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <button
                onClick={() => setSidebarOpen((open) => !open)}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <Menu size={16} strokeWidth={2} color={C.inkMid} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChatLogo size={25} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 400, color: C.ink, lineHeight: 1 }}>Re-Life Assistant</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green }} />
                    <p style={{ fontSize: 11, color: C.inkMuted }}>{loading ? 'Typing...' : 'Online · Available 24/7'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={createNewConversation}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMid, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}
              >
                <Plus size={13} strokeWidth={2.5} /> New chat
              </button>
            </div>

            <div ref={scrollRef} onScroll={handleScroll} className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 12px', display: 'flex', flexDirection: 'column' }}>
              {messages.length === 0 ? (
                <EmptyState onPrompt={(p) => sendMessage(p)} userName={firstName} />
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={`${msg.role}-${i}-${msg.timestamp || i}`} style={{ marginBottom: 12 }}>
                      <MessageBubble msg={msg} onCopy={handleCopy} />
                    </div>
                  ))}

                  {loading && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12, animation: 'msgIn .3s ease both' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ChatLogo size={24} />
                      </div>
                      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px 18px 18px 4px', boxShadow: '0 2px 8px rgba(15,36,32,.06)', minWidth: 64 }}>
                        <TypingDots />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {scrolledUp && (
              <div style={{ position: 'absolute', bottom: 100, right: 24, zIndex: 10 }}>
                <button
                  onClick={() => {
                    setScrolledUp(false);
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15,36,32,.1)' }}
                >
                  <ChevronDown size={16} strokeWidth={2} color={C.inkMid} />
                </button>
              </div>
            )}

            <div style={{ padding: '12px 20px 16px', background: C.surface, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              {messages.length > 0 && messages.length < 4 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
                  {QUICK_PROMPTS.slice(0, 4).map(({ label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(prompt)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.surface, color: C.inkMuted, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', background: C.offWhite, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    placeholder="Message Re-Life Assistant... (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    disabled={loading}
                    style={{ flex: 1, padding: '12px 14px', resize: 'none', border: 'none', background: 'transparent', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.ink, lineHeight: 1.6, maxHeight: 140, outline: 'none', boxSizing: 'border-box', width: '100%', opacity: loading ? 0.6 : 1 }}
                  />
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  style={{ width: 44, height: 44, borderRadius: 14, border: 'none', flexShrink: 0, background: input.trim() && !loading ? `linear-gradient(135deg, ${C.teal}, ${C.green})` : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed' }}
                >
                  {loading ? (
                    <Loader size={16} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Send size={17} strokeWidth={2.5} color={input.trim() ? '#fff' : C.inkMuted} style={{ transform: 'translateX(1px)' }} />
                  )}
                </button>
              </div>

              <p style={{ fontSize: 11, color: C.inkMuted, textAlign: 'center', marginTop: 8 }}>
                Re-Life AI can make mistakes. For emergencies, contact a professional.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
