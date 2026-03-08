import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface ProfileRow {
  id: string;
  created_at: number;
}
interface GuideRow {
  id: string;
  profile_id: string;
  title: string;
  created_at: number;
  payload: string;
}
interface Store {
  profiles: ProfileRow[];
  guides: GuideRow[];
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readStore(): Store {
  ensureDir(DATA_DIR);
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const data = JSON.parse(raw) as Store;
    return {
      profiles: Array.isArray(data.profiles) ? data.profiles : [],
      guides: Array.isArray(data.guides) ? data.guides : [],
    };
  } catch {
    return { profiles: [], guides: [] };
  }
}

function writeStore(store: Store) {
  ensureDir(DATA_DIR);
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 0), "utf-8");
}

export function ensureProfile(id: string): void {
  const store = readStore();
  if (store.profiles.some((p) => p.id === id)) return;
  store.profiles.push({ id, created_at: Date.now() });
  writeStore(store);
}

export function insertGuide(
  id: string,
  profileId: string,
  title: string,
  payload: string
): void {
  const store = readStore();
  store.guides.push({
    id,
    profile_id: profileId,
    title,
    created_at: Date.now(),
    payload,
  });
  writeStore(store);
}

export function getGuidesByProfileId(
  profileId: string
): { id: string; title: string; createdAt: number }[] {
  const store = readStore();
  return store.guides
    .filter((g) => g.profile_id === profileId)
    .sort((a, b) => b.created_at - a.created_at)
    .map((g) => ({ id: g.id, title: g.title, createdAt: g.created_at }));
}

export function getGuideById(guideId: string, profileId: string): string | null {
  const store = readStore();
  const g = store.guides.find(
    (x) => x.id === guideId && x.profile_id === profileId
  );
  return g?.payload ?? null;
}

export function profileExists(id: string): boolean {
  const store = readStore();
  return store.profiles.some((p) => p.id === id);
}
