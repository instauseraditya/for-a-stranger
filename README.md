# For a Stranger

A wall of anonymous notes, left for whoever finds them. Anyone can pin a short
note; every note stays up forever and shows the date and time it was pinned.
There's also a "look back" filter so people can view the wall as it looked at
a date and time of their choosing.

This is built to run **entirely for free**:
- The site itself is static HTML/CSS/JS, hosted for free on **GitHub Pages**.
- The notes are stored in **Firebase Firestore**, on Google's free "Spark"
  plan (no credit card required, generous daily free quota).

There is no server to run and no ongoing cost, as long as traffic stays
within Firebase's free quota (roughly 50,000 reads and 20,000 writes a day —
plenty for a small note wall).

---

## 1. Create a free Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and sign in with a Google account.
2. Click **Add project**, give it a name (e.g. `for-a-stranger`), and finish
   the wizard. You can leave Google Analytics off.
3. Once the project opens, click the **web icon (`</>`)** on the project
   overview page to register a web app. Give it any nickname.
4. Firebase will show a `firebaseConfig` object with keys like `apiKey`,
   `projectId`, etc. Keep this tab open — you'll need it in step 3 below.

## 2. Turn on Firestore (the database)

1. In the left sidebar, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (we'll set custom rules below), pick
   any region, and click **Enable**.
4. Go to the **Rules** tab and replace the contents with this, then click
   **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /notes/{noteId} {
         allow read: if true;
         allow create: if request.resource.data.text is string
                       && request.resource.data.text.size() > 0
                       && request.resource.data.text.size() <= 280
                       && request.resource.data.createdAt == request.time;
         allow update, delete: if false;
       }
     }
   }
   ```

   This lets anyone read and add notes, but caps note length at 280
   characters and blocks anyone from editing or deleting existing notes —
   so the wall really does stay "forever."

## 3. Add your config to the site

1. Open `firebase-config.js` in this folder.
2. Replace the placeholder values with the real ones from your Firebase
   web app (step 1.4 above). It'll look something like:

   ```js
   window.firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "for-a-stranger.firebaseapp.com",
     projectId: "for-a-stranger",
     storageBucket: "for-a-stranger.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };
   ```

3. Save the file.

> These values identify your project — they are not private keys, so it's
> fine for them to be visible in your public GitHub repo. Access is
> controlled entirely by the Firestore rules from step 2.

## 4. Push to GitHub and turn on Pages

1. Create a new **public** repository on GitHub (e.g. `for-a-stranger`).
2. Push all the files in this folder to that repo:

   ```bash
   cd for-a-stranger
   git init
   git add .
   git commit -m "For a Stranger — sticky note wall"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. On GitHub, go to your repo's **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`, then **Save**.
5. After a minute or two, your site will be live at:

   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

That's it — the whole thing costs nothing to run.

---

## How it works

- `index.html` — page structure: header, "look back" filter bar, the notes
  board, and the note-composer popup.
- `style.css` — the corkboard look: pinned, slightly rotated paper notes on
  a felt background.
- `app.js` — talks to Firestore: loads notes live, saves new ones, and
  handles the date/time filter.
- `firebase-config.js` — your project's public identifiers (edit this one).

**Leaving a note:** clicking "+ Leave a note" opens a sticky-note composer
(280 characters max). On submit, it's saved to Firestore with a server
timestamp and appears on the wall for everyone, with that date and time
stamped at the bottom of the note.

**Looking back:** the "Look back" bar lets a visitor pick a date and time;
the wall then shows only the notes that existed at that moment. "Back to
now" clears the filter.

## Optional tweaks

- **Character limit:** change `MAX_LEN` in `app.js` and the matching number
  in the Firestore rule (`size() <= 280`) together.
- **Note colors:** edit the `NOTE_COLORS` array in `app.js` and the
  matching `.note--*` classes in `style.css`.
- **Custom domain:** GitHub Pages supports free custom domains — see
  GitHub's docs under *Settings → Pages → Custom domain*.

## A note on moderation

Anyone can post anonymously, and there's no built-in profanity or spam
filter. If this gets real traffic, consider adding a lightweight word
filter in `app.js` before the `notesRef.add(...)` call, or occasionally
reviewing the `notes` collection in the Firebase console (you can delete
individual documents there even though the app itself can't).
