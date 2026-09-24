export type Letter = {
  id: string;
  to: string;
  message: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  feltCount: number;
};

// Anchored to module load time so the spread of "minutes/hours/days ago"
// stays realistic without hardcoding stale absolute dates.
const NOW = Date.now();

function minutesAgo(minutes: number): string {
  return new Date(NOW - minutes * 60_000).toISOString();
}

function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60);
}

function daysAgo(days: number): string {
  return hoursAgo(days * 24);
}

export const LETTERS: Letter[] = [
  {
    id: "jasmine-laugh",
    to: "Jasmine",
    message:
      "I still remember the way you laughed at your own jokes before anyone else did. I never told you that was my favorite sound. I hope wherever you are, someone else gets to hear it too.",
    createdAt: daysAgo(3),
    feltCount: 42,
  },
  {
    id: "mama-sorry",
    to: "Mama",
    message: "Maaf, Ma. Aku belum pulang juga.",
    createdAt: minutesAgo(6),
    feltCount: 3,
  },
  {
    id: "rafi-coffee",
    to: "Rafi",
    message:
      "Kopi yang kamu buatin waktu itu masih jadi patokan aku tiap ngopi di tempat lain. Nggak ada yang sama enaknya, atau mungkin aku cuma kangen caranya kamu nyeduh sambil cerita random.",
    createdAt: hoursAgo(2),
    feltCount: 15,
  },
  {
    id: "dinda-goodbye",
    to: "Dinda",
    message: "Aku nggak pernah sempet bilang selamat tinggal dengan benar.",
    createdAt: minutesAgo(24),
    feltCount: 7,
  },
  {
    id: "papa-proud",
    to: "Papa",
    message:
      "Aku tahu Papa nggak pernah bilang bangga secara langsung, tapi aku lihat dari cara Papa nyimpen semua piala kecilku di lemari kaca itu. Itu udah cukup, meskipun aku selalu berharap dengar katanya langsung dari mulut Papa.",
    createdAt: daysAgo(5),
    feltCount: 88,
  },
  {
    id: "alya-firstlove",
    to: "Alya",
    message:
      "Kamu cinta pertamaku, dan aku nggak nyesel meskipun endingnya nggak sesuai harapan. Terima kasih udah pernah bikin aku percaya sama hal-hal yang indah, walau cuma sebentar.",
    createdAt: hoursAgo(8),
    feltCount: 26,
  },
  {
    id: "teacher-thanks",
    to: "Bu Wulan",
    message: "Terima kasih sudah nggak pernah nyerah sama aku dulu.",
    createdAt: daysAgo(1),
    feltCount: 19,
  },
  {
    id: "exboyfriend-anger",
    to: "Bayu",
    message:
      "Aku marah lama sama kamu, tapi sekarang aku cuma capek. Aku pengen kita berdua sama-sama sembuh, walau nggak lagi saling kenal.",
    createdAt: minutesAgo(45),
    feltCount: 11,
  },
  {
    id: "bestfriend-move",
    to: "Nadia",
    message:
      "Semenjak kamu pindah kota, grup chat kita makin sepi. Aku kangen versi kita yang dulu suka begadang cerita nggak jelas sampai subuh. Semoga di sana kamu bahagia, walau aku sedih sendiri di sini.",
    createdAt: daysAgo(2),
    feltCount: 34,
  },
  {
    id: "stranger-train",
    to: "Orang asing di kereta",
    message: "Terima kasih udah senyum ke aku hari itu, aku lagi butuh banget.",
    createdAt: hoursAgo(13),
    feltCount: 52,
  },
  {
    id: "myself-young",
    to: "Diriku yang lebih muda",
    message:
      "Kamu akan baik-baik saja, meskipun sekarang rasanya semua runtuh. Pelan-pelan aja, nggak apa-apa kalau capek dulu sebentar.",
    createdAt: minutesAgo(2),
    feltCount: 1,
  },
  {
    id: "grandpa-storytime",
    to: "Kakek",
    message:
      "Aku masih inget cerita-cerita Kakek sebelum tidur, meskipun sekarang aku udah nggak inget detailnya lagi. Yang aku inget cuma rasanya, hangat dan aman. Makasih udah jadi rumah pertamaku, Kek.",
    createdAt: daysAgo(6),
    feltCount: 63,
  },
  {
    id: "roommate-thanks",
    to: "Kak Dea",
    message: "Makasih udah nemenin aku pas insomnia parah bulan itu.",
    createdAt: hoursAgo(20),
    feltCount: 9,
  },
  {
    id: "future-self",
    to: "Diriku di masa depan",
    message:
      "Semoga waktu kamu baca ini, kamu udah nemuin damai yang selama ini kita cari. Jangan lupa istirahat, dan jangan terlalu keras sama diri sendiri.",
    createdAt: minutesAgo(90),
    feltCount: 5,
  },
];