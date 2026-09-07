/* ---------------------------------------------------
   Firebase setup
   (config comes from firebase-config.js, loaded before this file)
--------------------------------------------------- */
firebase.initializeApp(window.firebaseConfig);
const db = firebase.firestore();
const notesRef = db.collection("notes");

/* ---------------------------------------------------
   State
--------------------------------------------------- */
let allNotes = [];           // everything we've received from Firestore, newest first
let activeCutoff = null;     // Date object; when set, only show notes created at/before it

const NOTE_COLORS = ["butter", "blush", "sky", "lilac", "mint"];
const MAX_LEN = 280;

/* ---------------------------------------------------
   DOM refs
--------------------------------------------------- */
const boardEl = document.getElementById("notes-board");
const statusEl = document.getElementById("board-status");

const openComposerBtn = document.getElementById("open-composer");
const overlayEl = document.getElementById("composer-overlay");
const textareaEl = document.getElementById("note-text");
const charCountEl = document.getElementById("char-count");
const submitBtn = document.getElementById("submit-note");
const cancelBtn = document.getElementById("cancel-note");
const errorEl = document.getElementById("composer-error");

const dateInput = document.getElementById("filter-date");
const timeInput = document.getElementById("filter-time");
const applyFilterBtn = document.getElementById("apply-filter");
const clearFilterBtn = document.getElementById("clear-filter");

/* ---------------------------------------------------
   Helpers
--------------------------------------------------- */

// Stable pick (color / rotation) derived from the note's id, so it doesn't
// jump around every time the list re-renders.
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function colorFor(id) {
  return NOTE_COLORS[hashString(id) % NOTE_COLORS.length];
}

function rotationFor(id) {
  const options = [-4, -3, -2, -1, 1, 2, 3, 4];
  return options[hashString(id + "r") % options.length];
}

function formatTimestamp(date) {
  if (!date) return "pinning…";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------
   Rendering
--------------------------------------------------- */
function render() {
  const visible = activeCutoff
    ? allNotes.filter((n) => n.createdAt && n.createdAt <= activeCutoff)
    : allNotes;

  boardEl.innerHTML = "";

  if (visible.length === 0) {
    statusEl.textContent = activeCutoff
      ? "No notes had been pinned yet at that moment."
      : "The wall is empty so far. Be the first to leave a note.";
    return;
  }

  statusEl.textContent = activeCutoff
    ? `Showing the wall as it looked at ${formatTimestamp(activeCutoff)} — ${visible.length} note${visible.length === 1 ? "" : "s"}.`
    : `${visible.length} note${visible.length === 1 ? "" : "s"} pinned to the wall.`;

  const frag = document.createDocumentFragment();
  visible.forEach((note) => {
    const el = document.createElement("article");
    el.className = `note note--${colorFor(note.id)}`;
    el.style.transform = `rotate(${rotationFor(note.id)}deg)`;

    const textEl = document.createElement("p");
    textEl.className = "note-text";
    textEl.textContent = note.text;

    const timeEl = document.createElement("time");
    timeEl.className = "note-time";
    timeEl.textContent = formatTimestamp(note.createdAt);

    el.appendChild(textEl);
    el.appendChild(timeEl);
    frag.appendChild(el);
  });
  boardEl.appendChild(frag);
}

/* ---------------------------------------------------
   Live data
--------------------------------------------------- */
notesRef.orderBy("createdAt", "desc").onSnapshot(
  (snapshot) => {
    allNotes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text || "",
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      };
    });
    render();
  },
  (err) => {
    console.error(err);
    statusEl.textContent =
      "Couldn't load the wall. Check firebase-config.js and your Firestore rules.";
  }
);

/* ---------------------------------------------------
   Composer (leave a note)
--------------------------------------------------- */
function openComposer() {
  overlayEl.hidden = false;
  overlayEl.classList.remove("is-hidden");
  errorEl.hidden = true;
  textareaEl.value = "";
  updateCharCount();
  textareaEl.focus();
}

function closeComposer() {
  overlayEl.hidden = true;
  overlayEl.classList.add("is-hidden");
}

function updateCharCount() {
  const left = MAX_LEN - textareaEl.value.length;
  charCountEl.textContent = `${left} left`;
}

async function submitNote() {
  const text = textareaEl.value.trim();

  if (!text) {
    errorEl.textContent = "Write something before pinning it.";
    errorEl.hidden = false;
    return;
  }
  if (text.length > MAX_LEN) {
    errorEl.textContent = `Keep it under ${MAX_LEN} characters.`;
    errorEl.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Pinning…";

  try {
    await notesRef.add({
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    closeComposer();
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Couldn't pin that note. Try again in a moment.";
    errorEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Pin it to the wall";
  }
}

openComposerBtn.addEventListener("click", openComposer);
cancelBtn.addEventListener("click", closeComposer);
overlayEl.addEventListener("click", (e) => {
  if (e.target === overlayEl) closeComposer();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlayEl.hidden) closeComposer();
});
textareaEl.addEventListener("input", updateCharCount);
submitBtn.addEventListener("click", submitNote);

/* ---------------------------------------------------
   Filter by date & time ("look back")
--------------------------------------------------- */
applyFilterBtn.addEventListener("click", () => {
  if (!dateInput.value) {
    statusEl.textContent = "Pick a date first.";
    return;
  }
  const time = timeInput.value || "23:59";
  activeCutoff = new Date(`${dateInput.value}T${time}:00`);
  clearFilterBtn.hidden = false;
  render();
});

clearFilterBtn.addEventListener("click", () => {
  activeCutoff = null;
  dateInput.value = "";
  timeInput.value = "";
  clearFilterBtn.hidden = true;
  render();
});
