// src/utils/storage.js – localStorage persistence layer
const KEYS = {
  NAMIRNICE: 'kp_namirnice',
  POPISI: 'kp_popisi',
  LAST_AUTHOR: 'kp_last_author',
};

const AUTO_DELETE_DAYS = 30;

const INITIAL_ITEMS = [
  { id: 'init_001', name: 'Piletina belo meso', category: 'Meso i riba', unit: 'kg' },
  { id: 'init_002', name: 'Juneće meso', category: 'Meso i riba', unit: 'kg' },
  { id: 'init_003', name: 'Svinjsko meso', category: 'Meso i riba', unit: 'kg' },
  { id: 'init_004', name: 'Riblji file', category: 'Meso i riba', unit: 'kg' },
  { id: 'init_005', name: 'Losos', category: 'Meso i riba', unit: 'kg' },
  { id: 'init_006', name: 'Mleko', category: 'Mlečni proizvodi', unit: 'lit' },
  { id: 'init_007', name: 'Jogurt', category: 'Mlečni proizvodi', unit: 'lit' },
  { id: 'init_008', name: 'Sir beli', category: 'Mlečni proizvodi', unit: 'kg' },
  { id: 'init_009', name: 'Maslac', category: 'Mlečni proizvodi', unit: 'kg' },
  { id: 'init_010', name: 'Jaja', category: 'Mlečni proizvodi', unit: 'kom' },
  { id: 'init_011', name: 'Pavlaka', category: 'Mlečni proizvodi', unit: 'kg' },
  { id: 'init_012', name: 'Jabuke', category: 'Voće i povrće', unit: 'kg' },
  { id: 'init_013', name: 'Paradajz', category: 'Voće i povrće', unit: 'kg' },
  { id: 'init_014', name: 'Paprika', category: 'Voće i povrće', unit: 'kg' },
  { id: 'init_015', name: 'Krompir', category: 'Voće i povrće', unit: 'kg' },
  { id: 'init_016', name: 'Luk', category: 'Voće i povrće', unit: 'kg' },
  { id: 'init_017', name: 'Šargarepa', category: 'Voće i povrće', unit: 'kg' },
  { id: 'init_018', name: 'Brašno pšenično', category: 'Žitarice i brašno', unit: 'kg' },
  { id: 'init_019', name: 'Pirinač', category: 'Žitarice i brašno', unit: 'kg' },
  { id: 'init_020', name: 'Testenina', category: 'Žitarice i brašno', unit: 'kg' },
  { id: 'init_021', name: 'Pasulj', category: 'Žitarice i brašno', unit: 'kg' },
  { id: 'init_022', name: 'Ovsene pahuljice', category: 'Žitarice i brašno', unit: 'kg' },
  { id: 'init_023', name: 'Tunjevina', category: 'Konzervirana hrana', unit: 'konz' },
  { id: 'init_024', name: 'Pelat paradajz', category: 'Konzervirana hrana', unit: 'konz' },
  { id: 'init_025', name: 'Kukuruz šećerac', category: 'Konzervirana hrana', unit: 'konz' },
  { id: 'init_026', name: 'Grašak', category: 'Konzervirana hrana', unit: 'konz' },
  { id: 'init_027', name: 'So', category: 'Začini i dodaci', unit: 'kg' },
  { id: 'init_028', name: 'Biber', category: 'Začini i dodaci', unit: 'g' },
  { id: 'init_029', name: 'Ulje suncokretovo', category: 'Začini i dodaci', unit: 'lit' },
  { id: 'init_030', name: 'Sirće', category: 'Začini i dodaci', unit: 'lit' },
  { id: 'init_031', name: 'Šećer beli', category: 'Slatkiši', unit: 'kg' },
  { id: 'init_032', name: 'Med', category: 'Slatkiši', unit: 'teg' },
  { id: 'init_033', name: 'Čokolada', category: 'Slatkiši', unit: 'kom' },
  { id: 'init_034', name: 'Kafa mlevena', category: 'Napici', unit: 'g' },
  { id: 'init_035', name: 'Čaj', category: 'Napici', unit: 'pak' },
  { id: 'init_036', name: 'Mineralna voda', category: 'Napici', unit: 'lit' },
  { id: 'init_037', name: 'Sok od jabuke', category: 'Napici', unit: 'lit' },
];

const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

// ── Namirnice ──────────────────────────────────────────────────────────────

const readItems = () => {
  if (typeof window === 'undefined') return INITIAL_ITEMS;
  try {
    const raw = localStorage.getItem(KEYS.NAMIRNICE);
    if (!raw) {
      localStorage.setItem(KEYS.NAMIRNICE, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
};

const writeItems = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.NAMIRNICE, JSON.stringify(items));
};

export const getAllItems = () => {
  const items = readItems();
  return [...items].sort((a, b) => {
    const cat = a.category.localeCompare(b.category, 'sr');
    return cat !== 0 ? cat : a.name.localeCompare(b.name, 'sr');
  });
};

export const addItem = (name, category, unit) => {
  const items = readItems();
  const trimmed = name.trim();
  if (items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error(`Artikal "${trimmed}" već postoji`);
  }
  const newItem = { id: generateId(), name: trimmed, category, unit };
  writeItems([...items, newItem]);
  return newItem;
};

export const updateItem = (id, name, category, unit) => {
  const items = readItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Artikal nije pronađen');
  const updated = { ...items[idx], name: name.trim(), category, unit };
  const next = [...items];
  next[idx] = updated;
  writeItems(next);
  return updated;
};

export const deleteItem = (id) => {
  writeItems(readItems().filter((i) => i.id !== id));
};

// ── Popisi ─────────────────────────────────────────────────────────────────

const readPopisi = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.POPISI);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writePopisi = (popisi) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.POPISI, JSON.stringify(popisi));
};

const cleanExpired = (popisi) => {
  const cutoff = Date.now() - AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000;
  return popisi.filter((p) => new Date(p.datum).getTime() > cutoff);
};

export const getAllPopisi = () => {
  const raw = readPopisi();
  const fresh = cleanExpired(raw);
  if (fresh.length !== raw.length) writePopisi(fresh);
  return [...fresh].sort((a, b) => new Date(b.datum) - new Date(a.datum));
};

export const savePopis = (sastavio, items) => {
  const popisi = readPopisi();
  const now = new Date();
  const newPopis = {
    id: generateId(),
    datum: now.toISOString(),
    srpski_datum: now.toLocaleString('sr-RS', {
      timeZone: 'Europe/Belgrade',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    sastavio: sastavio.trim(),
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
    })),
  };
  writePopisi([newPopis, ...popisi]);
  return newPopis;
};

export const deletePopis = (id) => {
  writePopisi(readPopisi().filter((p) => p.id !== id));
};

export const getDaysRemaining = (datum) => {
  const expires =
    new Date(datum).getTime() + AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000;
  return Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000));
};

// ── Author ─────────────────────────────────────────────────────────────────

export const getLastAuthor = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(KEYS.LAST_AUTHOR) || '';
};

export const saveLastAuthor = (author) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.LAST_AUTHOR, author.trim());
};
