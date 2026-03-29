"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GuideItem {
  id: string;
  title: string;
  createdAt: number;
}

export default function MyGuidesPage() {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await fetch("/api/profile", { method: "POST", credentials: "same-origin" });
        if (cancelled) return;
        const res = await fetch("/api/profile/guides", { credentials: "same-origin" });
        if (!res.ok) {
          setGuides([]);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setGuides(data.guides ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-zinc-400 uppercase">LookAI</p>
            <p className="text-[10px] text-zinc-300">Персональный гид по стилю</p>
          </div>
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">
            Создать гайд
          </Link>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 mb-2">Мои гайды</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Вы можете хранить до 2 гайдов для этого браузера. Для увеличения лимита напишите разработчику.
        </p>

        {loading ? (
          <p className="text-sm text-zinc-500">Загрузка…</p>
        ) : guides.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Пока нет сохранённых гайдов. Пройдите визард — гайд сохранится автоматически.
          </p>
        ) : (
          <ul className="space-y-3">
            {guides.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/guide/${g.id}`}
                  className="block rounded-xl border border-zinc-100 bg-white p-4 hover:border-zinc-200 transition-colors"
                >
                  <p className="font-medium text-zinc-900">{g.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{formatDate(g.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
