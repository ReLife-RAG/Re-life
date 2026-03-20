"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  X,
  ExternalLink,
  FileText,
  Headphones,
  PlayCircle,
  Video,
} from "lucide-react";

type ResourceKind = "article" | "audio" | "video";
type FilterKind = "all" | "saved" | ResourceKind;

type ResourceItem = {
  id: string;
  title: string;
  kind: ResourceKind;
  category: "Therapy" | "Mindfulness" | "Guides" | "Pornography Addiction" | "Social Media Addiction" | "Substance Addiction";
  duration?: string;
  description: string;
  image: string;
  articlePath?: string;
  audioPath?: string;
  youtubeUrl?: string;
  creator?: string;
};

const RESOURCES: ResourceItem[] = [
  {
    id: "cbt-workbook",
    title: "The CBT Workbook for Recovery",
    kind: "article",
    category: "Therapy",
    duration: "8 min read",
    description: "A practical workbook with thought reframing, trigger mapping, and daily action prompts.",
    image: "/assets/resources/images/roadtorecovery.jpeg",
    articlePath: "/assets/resources/articles/cbt-workbook.txt",
    creator: "Re-Life Team",
  },
  {
    id: "porn-recovery-audio-1",
    title: "Porn Recovery: Understanding the Craving Loop",
    kind: "audio",
    category: "Pornography Addiction",
    duration: "10:12",
    description: "Explains urge patterns, shame spirals, and practical interruption techniques for pornography recovery.",
    image: "/assets/resources/images/recoveryispossible.jpeg",
    audioPath: "/assets/resources/podcasts/pornadi1.mp3",
    creator: "Re-Life Recovery Coach",
  },
  {
    id: "relapse-prevention",
    title: "Relapse Prevention Strategies",
    kind: "article",
    category: "Guides",
    duration: "7 min read",
    description: "A step-by-step plan to identify early warning signs and respond before urges escalate.",
    image: "/assets/resources/images/roadtorecovery2.jpeg",
    articlePath: "/assets/resources/articles/relapse-prevention.txt",
    creator: "Re-Life Team",
  },
  {
    id: "porn-trigger-cycle-article",
    title: "Breaking the Porn Trigger Cycle",
    kind: "article",
    category: "Pornography Addiction",
    duration: "6 min read",
    description: "A prototype guide on recognizing cue-routine-reward loops and replacing them with healthy rituals.",
    image: "/assets/resources/images/joruneytorecovery.jpeg",
    articlePath: "/assets/resources/articles/porn-trigger-cycle.txt",
    creator: "Re-Life Editorial",
  },
  {
    id: "social-reset-article",
    title: "Social Media Reset Plan (14 Days)",
    kind: "article",
    category: "Social Media Addiction",
    duration: "9 min read",
    description: "A realistic digital reset plan with boundaries, replacement habits, and accountability prompts.",
    image: "/assets/resources/images/givinghands.jpeg",
    articlePath: "/assets/resources/articles/social-media-reset-plan.txt",
    creator: "Re-Life Editorial",
  },
  {
    id: "substance-roadmap-article",
    title: "Substance Recovery Roadmap",
    kind: "article",
    category: "Substance Addiction",
    duration: "10 min read",
    description: "A sample recovery roadmap focused on safety planning, support systems, and relapse prevention.",
    image: "/assets/resources/images/drugs.jpeg",
    articlePath: "/assets/resources/articles/drug-recovery-roadmap.txt",
    creator: "Re-Life Clinical Content",
  },
  {
    id: "social-reprogram-part-1",
    title: "Reprogram Screen Habits: Social Detox Part 1",
    kind: "audio",
    category: "Social Media Addiction",
    duration: "11:35",
    description: "Guided reflection and behavioral rewiring prompts to reduce compulsive scrolling.",
    image: "/assets/resources/images/givinghandstoothers.jpeg",
    audioPath: "/assets/resources/podcasts/reprogram%20pt1.mp3",
    creator: "Re-Life Recovery Coach",
  },
  {
    id: "essential-tools-part-1",
    title: "Essential Recovery Tools: Part 1",
    kind: "audio",
    category: "Substance Addiction",
    duration: "09:42",
    description: "Grounding, urge surfing, and immediate coping tools for high-risk moments.",
    image: "/assets/resources/images/drugs2.jpeg",
    audioPath: "/assets/resources/podcasts/essentialpt1.mp3",
    creator: "Re-Life Recovery Coach",
  },
  {
    id: "essential-tools-part-2",
    title: "Essential Recovery Tools: Part 2",
    kind: "audio",
    category: "Substance Addiction",
    duration: "10:01",
    description: "How to build a relapse shield using people, places, and process checklists.",
    image: "/assets/resources/images/drugs3.jpeg",
    audioPath: "/assets/resources/podcasts/essentialpt2.mp3",
    creator: "Re-Life Recovery Coach",
  },
  {
    id: "essential-tools-part-3",
    title: "Essential Recovery Tools: Part 3",
    kind: "audio",
    category: "Substance Addiction",
    duration: "10:20",
    description: "Rebuilding routines, sleep hygiene, and emotion regulation during withdrawal windows.",
    image: "/assets/resources/images/roadtorecovery.jpeg",
    audioPath: "/assets/resources/podcasts/essentialpt3.mp3",
    creator: "Re-Life Recovery Coach",
  },
  {
    id: "essential-tools-part-4",
    title: "Essential Recovery Tools: Part 4",
    kind: "audio",
    category: "Substance Addiction",
    duration: "09:58",
    description: "Long-term maintenance habits and what to do after a setback without self-blame.",
    image: "/assets/resources/images/recoveryispossible.jpeg",
    audioPath: "/assets/resources/podcasts/essentialpt4.mp3",
    creator: "Re-Life Recovery Coach",
  },
  {
    id: "porn-2-types",
    title: "2 Types of Porn Addiction",
    kind: "video",
    category: "Pornography Addiction",
    duration: "Video",
    description:
      "Discusses different types of pornography addiction and provides clinical insights into how porn affects the brain.",
    image: "/assets/resources/images/joruneytorecovery.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=2mxYGYGULXE",
    creator: "Dr. Trish Leigh",
  },
  {
    id: "porn-am-i-addicted",
    title: "Am I Addicted to Porn? What is Porn Addiction?",
    kind: "video",
    category: "Pornography Addiction",
    duration: "Video",
    description:
      "Educational overview explaining what pornography addiction entails, how it develops, and how to identify the signs.",
    image: "/assets/resources/images/recoveryispossible.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=3WOT4NWEFdU",
    creator: "Doc Snipes",
  },
  {
    id: "porn-lived-experience",
    title: "Sex and Porn Addiction | A Man's Lived Experience",
    kind: "video",
    category: "Pornography Addiction",
    duration: "Video",
    description:
      "A candid interview detailing a lived experience of navigating and recovering from severe pornography addiction.",
    image: "/assets/resources/images/roadtorecovery.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=ws4pxA4GRaU",
    creator: "MedCircle",
  },
  {
    id: "porn-essential-tools",
    title: "Essential Tools for Recovery from Pornography and Sex Addiction",
    kind: "video",
    category: "Pornography Addiction",
    duration: "Video",
    description:
      "A deep-dive with essential tools, coping mechanisms, and practical strategies for recovery.",
    image: "/assets/resources/images/roadtorecovery2.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=1KlsXfx7C0g",
    creator: "Doc Snipes",
  },
  {
    id: "social-scrolling",
    title: "Why scrolling on social media is addictive",
    kind: "video",
    category: "Social Media Addiction",
    duration: "Video",
    description:
      "Breaks down the psychology and neuroscience of infinite scroll and explains algorithm-driven addictive loops.",
    image: "/assets/resources/images/givinghands.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=rooEBjZWpDc",
    creator: "Washington Post",
  },
  {
    id: "social-beat-addiction",
    title: "How to Beat Social Media Addiction",
    kind: "video",
    category: "Social Media Addiction",
    duration: "Video",
    description:
      "Discusses dopamine-driven mechanisms of social media addiction and actionable ways to regain control.",
    image: "/assets/resources/images/givinghandstoothers.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=D34KyceGhPE",
    creator: "Dr. Anna Lempke and Dr. Andrew Huberman",
  },
  {
    id: "social-tedx",
    title: "SOCIAL MEDIA ADDICTION",
    kind: "video",
    category: "Social Media Addiction",
    duration: "Video",
    description:
      "Explores the psychological impact of selfie culture, validation-seeking, and social media behavior.",
    image: "/assets/resources/images/joruneytorecovery.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=JH5bC-SLvb4",
    creator: "Leslie Coutterand (TEDx Talks)",
  },
  {
    id: "substance-why-hard",
    title: "What causes addiction, and why is it so hard to treat?",
    kind: "video",
    category: "Substance Addiction",
    duration: "Video",
    description:
      "An animated lesson on how addictive drugs alter the body and brain, making recovery difficult.",
    image: "/assets/resources/images/drugs.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=hBC7i-vHWsU",
    creator: "Judy Grisel (TED-Ed)",
  },
  {
    id: "substance-brain",
    title: "Drug Addiction and the Brain",
    kind: "video",
    category: "Substance Addiction",
    duration: "Video",
    description:
      "Details the underlying neurobiology of how the brain becomes physically and chemically dependent.",
    image: "/assets/resources/images/drugs2.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=62FYNwd-8Jo",
    creator: "Professor Dave Explains",
  },
  {
    id: "substance-unlocking-cure",
    title: "Unlocking the Cure to Substance Use Disorder",
    kind: "video",
    category: "Substance Addiction",
    duration: "Video",
    description:
      "Discusses mindset and societal approach changes to make progress against substance abuse and overdose.",
    image: "/assets/resources/images/drugs3.jpeg",
    youtubeUrl: "http://www.youtube.com/watch?v=81E4l9TevBE",
    creator: "Brad Finegood (TEDx Talks)",
  },
];

const topFilters: { key: FilterKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "saved", label: "Saved" },
  { key: "article", label: "Articles" },
  { key: "video", label: "Videos" },
  { key: "audio", label: "Audio" },
];

const toYoutubeId = (url: string) => {
  const match = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
};

const toYoutubeThumbnail = (url: string) => {
  const id = toYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const toYoutubeEmbed = (url: string) => {
  const id = toYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "";
};

const API_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

export default function ResourcesPage() {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [saved, setSaved] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ResourceItem | null>(null);
  const [articleText, setArticleText] = useState<string>("");
  const [articleError, setArticleError] = useState<string>("");
  const [selectedPodcast, setSelectedPodcast] = useState<ResourceItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ResourceItem | null>(null);

  const filteredResources = useMemo(() => {
    return RESOURCES.filter((item) => {
      if (filter === "saved") {
        if (!saved.includes(item.id)) {
          return false;
        }
      } else {
        if (item.kind === "video") {
          return false;
        }
        if (filter !== "all" && item.kind !== filter) {
          return false;
        }
      }
      if (activeTopic && item.category !== activeTopic) {
        return false;
      }
      return true;
    });
  }, [filter, activeTopic, saved]);

  const videoResources = useMemo(
    () =>
      RESOURCES.filter((item) => {
        if (item.kind !== "video" || !item.youtubeUrl) {
          return false;
        }
        if (activeTopic && item.category !== activeTopic) {
          return false;
        }
        return true;
      }),
    [activeTopic]
  );

  const savedItems = useMemo(
    () => saved.map((id) => RESOURCES.find((resource) => resource.id === id)).filter(Boolean) as ResourceItem[],
    [saved]
  );

  const topics = useMemo(() => {
    const counts = RESOURCES.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  useEffect(() => {
    if (!selectedArticle?.articlePath) {
      return;
    }

    let active = true;
    setArticleText("");
    setArticleError("");

    fetch(selectedArticle.articlePath)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Article file not found");
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setArticleText(text);
        }
      })
      .catch(() => {
        if (active) {
          setArticleError("Article content file not found. Add a .txt file to public/assets/resources/articles.");
        }
      });

    return () => {
      active = false;
    };
  }, [selectedArticle]);

  useEffect(() => {
    if (filter === "video") {
      setSelectedArticle(null);
      setSelectedPodcast(null);
    }
  }, [filter]);

  useEffect(() => {
    let mounted = true;

    const loadSavedResources = async () => {
      try {
        const response = await fetch(`${API_URL}/api/resources/saved`, {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (mounted && Array.isArray(data.savedResources)) {
          setSaved(data.savedResources);
        }
      } catch (_error) {
        // Ignore load failures for guests or temporary network issues.
      }
    };

    loadSavedResources();

    return () => {
      mounted = false;
    };
  }, []);

  const openResource = (item: ResourceItem) => {
    if (item.kind === "article") {
      setSelectedPodcast(null);
      setSelectedVideo(null);
      setSelectedArticle(item);
      return;
    }

    if (item.kind === "audio") {
      setSelectedArticle(null);
      setSelectedVideo(null);
      setSelectedPodcast(item);
      return;
    }

    setSelectedArticle(null);
    setSelectedPodcast(null);
    setSelectedVideo(item);
    setFilter("video");
  };

  const toggleSaved = async (item: ResourceItem) => {
    try {
      const response = await fetch(`${API_URL}/api/resources/saved/${encodeURIComponent(item.id)}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.savedResources)) {
          setSaved(data.savedResources);
        }
        if (data.isSaved) {
          openResource(item);
        }
        return;
      }
    } catch (_error) {
      // Fall through to local fallback.
    }

    setSaved((prev) => {
      const isSaved = prev.includes(item.id);
      const next = isSaved ? prev.filter((entry) => entry !== item.id) : [...prev, item.id];
      if (!isSaved) {
        openResource(item);
      }
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-semibold text-[#90A3BF]">Portal &gt; Library</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#102A43]">Resource Hub</h1>
        </div>

        <div className="inline-flex w-full rounded-full bg-[#EEF2F6] p-1 sm:w-auto">
          {topFilters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === item.key ? "bg-[#7BC89A] text-white shadow-sm" : "text-[#7188A8] hover:bg-white/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            {filter !== "video" && (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredResources.map((item) => (
                    <article
                      key={item.id}
                      className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#E8EEF4] bg-white shadow-[0_8px_24px_rgba(15,55,95,0.06)]"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-[#F3F7FC]">
                        {/* Image now takes about half of each article/podcast card for better visual balance. */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        {!item.image && (
                          <div className="flex h-full w-full items-center justify-center text-[#9AAAC0]">
                            {item.kind === "article" && <FileText className="h-8 w-8" />}
                            {item.kind === "audio" && <Headphones className="h-8 w-8" />}
                            {item.kind === "video" && <Video className="h-8 w-8" />}
                          </div>
                        )}
                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#5E7290]">
                          {item.kind}
                        </div>
                      </div>

                      <div className="flex h-full flex-col p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#5E7290]">{item.creator}</p>
                          <p className="text-sm font-semibold text-[#A1AEC3]">{item.duration || "-"}</p>
                        </div>

                        <h2 className="mt-3 text-[1.95rem] font-bold leading-snug text-[#102A43]">{item.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#7D8EA8]">{item.description}</p>

                        <div className="mt-auto flex items-center justify-between pt-5">
                          <span className="rounded-full bg-[#EAF7EF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#6FB98C]">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              aria-label={`Save ${item.title}`}
                              onClick={() => toggleSaved(item)}
                              className={`rounded-xl p-2 transition ${
                                saved.includes(item.id)
                                  ? "bg-[#DCE9F7] text-[#2A5CAA]"
                                  : "bg-[#EEF3F8] text-[#94A5BE]"
                              }`}
                            >
                              <Bookmark className="h-5 w-5" />
                            </button>

                            {item.kind === "article" && (
                              <button
                                onClick={() => openResource(item)}
                                className="rounded-xl bg-[#4E8A7A] p-2 text-white transition hover:bg-[#3E7466]"
                                aria-label={`Read ${item.title}`}
                              >
                                <ExternalLink className="h-5 w-5" />
                              </button>
                            )}

                            {item.kind === "audio" && (
                              <button
                                onClick={() => openResource(item)}
                                className="rounded-xl bg-[#4E8A7A] p-2 text-white transition hover:bg-[#3E7466]"
                                aria-label={`Play ${item.title}`}
                              >
                                <PlayCircle className="h-5 w-5" />
                              </button>
                            )}

                            {item.kind === "video" && (
                              <button
                                onClick={() => openResource(item)}
                                className="rounded-xl bg-[#4E8A7A] p-2 text-white transition hover:bg-[#3E7466]"
                                aria-label={`Watch ${item.title}`}
                              >
                                <Video className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

              </>
            )}

            {filter === "video" && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[#102A43]">Video Section</h2>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {videoResources.map((video) => {
                    const thumbnail = toYoutubeThumbnail(video.youtubeUrl || "");
                    return (
                      <article
                        key={`${video.id}-video-card`}
                        className="overflow-hidden rounded-3xl border border-[#E4EBF3] bg-white shadow-[0_8px_20px_rgba(15,55,95,0.06)]"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            openResource(video);
                          }}
                          className="group relative block h-48 w-full overflow-hidden bg-[#111827]"
                          aria-label={`Play ${video.title}`}
                        >
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={video.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-white">
                              Video preview unavailable
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/25" />
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-[#123A63] shadow-lg">
                            <PlayCircle className="h-7 w-7" />
                          </div>
                        </button>

                        <div className="p-4">
                          <h3 className="text-xl font-bold leading-snug text-[#102A43]">{video.title}</h3>
                          <p className="mt-1 text-sm font-semibold text-[#7C8EA8]">{video.creator}</p>
                          <p className="mt-2 text-sm leading-relaxed text-[#6B7D97]">{video.description}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl bg-[#3F7D6D] p-6 text-white shadow-[0_10px_30px_rgba(45,95,82,0.3)]">
              <h2 className="text-2xl font-bold">Saved Content</h2>
              <p className="mt-2 text-sm text-[#CDE6DD]">Access your bookmarked therapy guides and media offline.</p>
              <div className="mt-4 space-y-3">
                {savedItems.length === 0 && <p className="text-sm text-[#D6ECE4]">No bookmarks yet.</p>}
                {savedItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openResource(item)}
                    className="w-full rounded-2xl bg-[#568F81] px-4 py-3 text-left text-sm font-semibold transition hover:bg-[#67A293]"
                  >
                    {item.title.length > 34 ? `${item.title.slice(0, 34)}...` : item.title}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E4EBF3] bg-white p-6">
              <h2 className="text-2xl font-bold text-[#102A43]">Popular Topics</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTopic(null)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    !activeTopic
                      ? "border-[#7BC89A] bg-[#EAF7EF] text-[#3A7A57]"
                      : "border-[#DCE4EF] bg-[#F8FAFD] text-[#8696AF] hover:bg-[#EEF3F8]"
                  }`}
                >
                  #All
                </button>
                {topics.map(([name]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveTopic((prev) => (prev === name ? null : name))}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeTopic === name
                        ? "border-[#7BC89A] bg-[#EAF7EF] text-[#3A7A57]"
                        : "border-[#DCE4EF] bg-[#F8FAFD] text-[#8696AF] hover:bg-[#EEF3F8]"
                    }`}
                  >
                    #{name}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1625]/70 p-4">
          <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E4EBF3] p-5">
              <div>
                <h3 className="text-2xl font-bold text-[#102A43]">{selectedArticle.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl bg-[#EEF3F8] p-2 text-[#5E7290] transition hover:bg-[#DFE8F2]"
                aria-label="Close article"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto p-6">
              {articleError && <p className="text-sm font-semibold text-[#C2410C]">{articleError}</p>}
              {!articleError && !articleText && <p className="text-sm text-[#7D8EA8]">Loading article...</p>}
              {articleText && (
                <article className="rounded-2xl bg-[#F7FAFD] p-5 text-[15px] leading-7 text-[#27364A] whitespace-pre-wrap">
                  {articleText}
                </article>
              )}
            </div>
          </section>
        </div>
      )}

      {selectedPodcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1625]/70 p-4">
          <section className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#102A43]">{selectedPodcast.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPodcast(null)}
                className="rounded-xl bg-[#EEF3F8] p-2 text-[#5E7290] transition hover:bg-[#DFE8F2]"
                aria-label="Close podcast"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <audio className="mt-5 w-full" controls preload="metadata">
              <source src={selectedPodcast.audioPath} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </section>
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1625]/75 p-4">
          <section className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E4EBF3] p-5">
              <div>
                <h3 className="text-2xl font-bold text-[#102A43]">{selectedVideo.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#7C8EA8]">{selectedVideo.creator}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-xl bg-[#EEF3F8] p-2 text-[#5E7290] transition hover:bg-[#DFE8F2]"
                aria-label="Close video"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {toYoutubeEmbed(selectedVideo.youtubeUrl || "") ? (
                <iframe
                  src={toYoutubeEmbed(selectedVideo.youtubeUrl || "")}
                  title={selectedVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white">Unable to load video player.</div>
              )}
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-[#6B7D97]">{selectedVideo.description}</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
