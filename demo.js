/* Živé okno Fixy na webu: stejné rozložení (projekty | poznámky | editor), barvy odvozené z barvy projektu
   (ProjectTheme.swift) a ukázková knihovna z první instalace (SampleData.swift). Psát a formátovat jde jako
   ve Fixe, nic se ale neukládá. Když s oknem nikdo nepracuje, samo přepíná projekty – plynulé přebarvení
   celého okna (a úvodu stránky) je hlavní věc, kterou má web ukázat. */
(() => {
    "use strict";

    const host = document.getElementById("fixa-demo");
    if (!host || !document.queryCommandSupported) return;

    // MARK: - Ukázková knihovna (SampleData.swift)

    const b = (s) => `<b>${s}</b>`;
    const u = (s) => `<u>${s}</u>`;
    const st = (s) => `<s>${s}</s>`;
    const hl = (s, c = "yellow") => `<mark data-c="${c}">${s}</mark>`;
    const title = (s) => `<h1>${s}</h1>`;
    const heading = (s) => `<h2>${s}</h2>`;
    const subheading = (s) => `<h3>${s}</h3>`;
    const p = (...runs) => `<p>${runs.join("")}</p>`;
    const items = (list) => list.map((item) => `<li>${item}</li>`).join("");
    const ul = (...list) => `<ul>${items(list)}</ul>`;
    const ol = (...list) => `<ol>${items(list)}</ol>`;
    const todo = (...list) => `<ul class="fx-check">${list.map(([done, text]) => `<li${done ? ' class="done"' : ""}>${text}</li>`).join("")}</ul>`;
    // Obrázky jsou pro Retinu (2×) – v poznámce mají poloviční šířku, nejvýš šířku textu.
    const image = (file, width, height) =>
        `<figure contenteditable="false"><img src="images/${file}" width="${width / 2}" height="${height / 2}" data-fit="${width / 2}" alt="" loading="lazy" draggable="false"></figure>`;
    const card = (text, url, icon, kind = "") =>
        `<div class="fx-card" contenteditable="false" data-url="${url}"><span class="fx-card-icon ${kind}">${icon}</span>` +
        `<span class="fx-card-text"><span class="fx-card-title">${text}</span><span class="fx-card-host">${new URL(url).hostname.replace(/^www\./, "")}</span></span></div>`;

    // Nová knihovna (i pro „Reset“): stáří poznámek v hodinách od načtení stránky.
    function makeLibrary() {
        const guide = [
            { id: "start", age: 0, pinned: true, html: title("Start Here 👋") +
                p("Fixa keeps your notes sorted by project. This project is a short guide – click through its notes, try things out, and delete it whenever you like (right-click the tile › ", b("Delete Project…"), ").") +
                image("guide-window.png", 1840, 1154) +
                ol(b("Projects") + " – the tiles on the left. Each one has its own color, and the whole window takes it on.",
                   b("Notes") + " – the list in the middle, newest at the top. Pinned notes stay above the rest.",
                   b("Editor") + " – just start typing. " + hl("Everything is saved right away.") + " There’s no Save button.") +
                heading("In This Guide") +
                ul(b("Projects") + " – switch, create and reorder them",
                   b("Edit a Project") + " – name, emoji or logo, color",
                   b("Notes and Pinning") + " – new notes, pinning, deleting",
                   b("Writing and Formatting") + " – styles, highlighter, lists and checklists",
                   b("Links") + " – as text, a card or a large preview",
                   b("Images") + " – add, resize and move them",
                   b("Search") + " – find anything in all projects",
                   b("Keyboard Shortcuts") + " – the ones worth knowing",
                   b("Sync Between Your Macs") + " – the same notes everywhere, nothing lost",
                   b("Buttons and Settings") + " – what everything does") +
                p("Tip: press ", b("↓"), " and ", b("↑"), " to browse notes, ", b("Return"), " to start typing and ", b("Esc"), " to get back to the list.") },
            { id: "projects", age: 0.05, html: title("Projects") +
                p("Every note belongs to a project. Click a tile and you see only that project’s notes – and the whole window takes on its color.") +
                image("guide-projects.png", 1200, 708) +
                heading("Switch") +
                ul("Click a tile.", b("⌘D") + " next project, " + b("⇧⌘D") + " previous one.", b("⌘1 – ⌘9") + " jumps straight to a project by its position.") +
                heading("Create") +
                ul(b("New Project") + " under the tiles, or " + b("⇧⌘N") + ". Give it a name, an emoji and a color – see " + b("Edit a Project") + ".") +
                heading("Reorder") +
                p("Drag a tile up or down. ", hl("A line shows where it will land", "blue"), " – let go there. From the keyboard: ", b("⌥⌘↑"), " and ", b("⌥⌘↓"), ".") +
                heading("More Room") +
                p(b("⌘S"), " hides the project panel when you want more room for writing, and brings it back.") },
            { id: "edit", age: 0.1, html: title("Edit a Project") +
                p("Right-click a tile › ", b("Edit Project…"), ", or press ", b("⇧⌘E"), " for the project you’re in.") +
                image("guide-project-editor.png", 1600, 1400) +
                ul(b("Name") + " – shown on the tile and above the notes.",
                   b("Emoji") + " – pick one, or click " + b("All Emoji…") + " for the full list.",
                   b("Logo") + " – switch to Logo and choose an image, or simply " + hl("drop an image onto the tile", "green") + ". It’s scaled down to 256 px.",
                   b("Color") + " – 12 soft colors, or any color you like with " + b("Custom Color") + ". The whole window follows it.") +
                p("The tile at the top shows how it will look. ", b("Save"), " (Return) keeps the changes, ", b("Cancel"), " (Esc) leaves the project as it was.") +
                heading("Delete a Project") +
                p("Right-click the tile › ", b("Delete Project…"), ". Fixa asks first, and the project’s notes are deleted too – a copy of each stays in the archive, so History (⌘Y) can bring them back.") },
            { id: "notes", age: 0.15, html: title("Notes and Pinning") +
                image("guide-notes.png", 1200, 800) +
                heading("New Note") +
                p("Press ", b("⌘N"), " or click the pencil button above the list. A new note starts with a title – the first line becomes its name in the list.") +
                heading("Pin a Note") +
                p("Notes you need all the time can stay at the top: ", b("⌥⌘P"), ", or right-click a note › ", b("Pin Note"), ". Pinned notes get their own group above the others. Do the same to unpin.") +
                heading("Browse") +
                ul(b("↑ ↓") + " – the next or previous note opens right away", b("⌘↑ ⌘↓") + " – the first or last note", b("↩") + " – start typing, " + b("Esc") + " – back to the list") +
                heading("Delete a Note") +
                p("Select it and press ", b("⌫"), " – Fixa asks first. An ", hl("empty note disappears by itself"), " when you leave it, so trying things out never leaves clutter.") +
                p("At the bottom of each note you see when it was created and last edited.") },
            { id: "writing", age: 0.2, html: title("Writing and Formatting") +
                p("Everything is in the bar above the note – nothing is hidden in menus. When the window is narrow, the bar wraps onto more rows.") +
                image("guide-format-bar.png", 1310, 392) +
                heading("Text") +
                ul(b("Title") + ", " + b("Heading") + ", " + b("Subheading") + " and " + b("Body") + " – ⇧⌘T, ⇧⌘H, ⇧⌘J, ⇧⌘B",
                   b("Bold") + " ⌘B, " + u("underline") + " ⌘U, " + st("strikethrough") + " ⇧⌘X") +
                heading("Highlighter") +
                p("Five colors – ", hl("yellow"), ", ", hl("green", "green"), ", ", hl("pink", "pink"), ", ", hl("blue", "blue"), " and ", hl("orange", "orange"), ". Select text and click a color, or press ⌥⌘1 – ⌥⌘5. ⇧⌘M uses the last color again, the eraser (⌥⌘0) removes it.") +
                heading("Lists") +
                ul("Type " + b("-") + " and a space for a bulleted list (⇧⌘7).",
                   "Type " + b("1.") + " and a space for a numbered list (⇧⌘9) – the numbers keep themselves in order.",
                   "Return on an empty item ends the list. " + b("⌃⌘↑ ⌃⌘↓") + " move an item up or down.") +
                heading("Checklists") +
                p("Type ", b("[]"), " and a space, or press ", b("⇧⌘L"), ":") +
                todo([true, "Click the circle to check an item (or ⇧⌘U)"],
                     [false, "Drag an item by its circle – or the ⋮⋮ handle on its left – to move it"],
                     [false, "Settings › Checklists can move checked items to the bottom"]) },
            { id: "links", age: 0.25, html: title("Links") +
                p("Type a web address and it becomes a link by itself – or select text and press ", b("⌘K"), " to link it.") +
                heading("Text, Card or Preview") +
                p("Hover over a link and click the small arrow next to it. ", b("Show Link As"), " switches between:") +
                ul(b("Text") + " – an ordinary link in the sentence", b("Card") + " – the site’s icon, title and address on a line of its own, like this:") +
                card("Highlighter – Wikipedia", "https://en.wikipedia.org/wiki/Highlighter", "W") +
                ul(b("Preview") + " – a large card with the page’s picture and description") +
                p(b("⌥⌘K"), " goes text → card → preview from the keyboard. The same menu has ", b("Open Link"), " and ", b("Copy Link"), ". (“Fixa” is Czech for a marker pen.)") },
            { id: "images", age: 0.3, html: title("Images") +
                heading("Add an Image") +
                ul("Drag it from Finder or another app straight into the note – it lands where you let go.", "Paste it with " + b("⌘V") + ".",
                   "Click " + b("Image") + " in the bar above the note, or press " + b("⇧⌘I") + ".") +
                p("Big photos are scaled down to save space. Each image sits on its own line, as wide as the text.") +
                heading("Resize and Move") +
                image("guide-images.png", 1310, 964) +
                ul("Click an image to select it – a frame and a handle appear.",
                   "Drag the handle in the corner to make it bigger or smaller – it keeps its shape.",
                   b("⌃⌘=") + " bigger, " + b("⌃⌘-") + " smaller, " + b("⌃⌘0") + " back to the width of the text.",
                   "Drag a selected image to move it somewhere else in the note.") +
                p("Images are stored next to your notes and sync with them. ", b("Settings › Images"), " shows how much space they take and can clean up images no note uses anymore.") },
            { id: "search", age: 0.35, html: title("Search") +
                p("Press ", b("⌘F"), " and start typing – Fixa searches every note in every project.") +
                image("guide-search.png", 1840, 1154) +
                ul("Results are grouped by project, each in its own color. The words you typed are highlighted.",
                   b("↑ ↓") + " pick a result, " + b("↩") + " opens it right at the first match, " + b("Esc") + " closes the search.",
                   "Upper or lower case and accents don’t matter. With an empty search you see the notes you edited last.") +
                p(b("⌥⌘F"), " finds text in the note that’s open.") },
            { id: "keyboard", age: 0.4, html: title("Keyboard Shortcuts") +
                p("You can do everything in Fixa from the keyboard. ", b("⌘/"), " shows the full list at any time – so does the ", b("?"), " button at the bottom left.") +
                image("guide-shortcuts.png", 1680, 900) +
                heading("The Ones Worth Knowing") +
                ul(b("⌘N") + " new note, " + b("⇧⌘N") + " new project",
                   b("↑ ↓") + " browse notes, " + b("↩") + " type, " + b("Esc") + " back to the list",
                   b("⌘D") + " next project, " + b("⌘1 – ⌘9") + " a project by position",
                   b("⌥⌘P") + " pin a note, " + b("⌫") + " delete it",
                   b("⌘F") + " search everything, " + b("⌥⌘F") + " find in this note",
                   b("⌘Y") + " history, " + b("⌘,") + " Settings, " + b("⌥⌘E") + " export") },
            { id: "sync", age: 0.45, html: title("Sync Between Your Macs") +
                p("Turn on sync and your notes live in ", b("iCloud Drive › Fixa"), " – the same on every Mac signed in to your Apple Account.") +
                image("guide-sync.png", 1060, 312) +
                ol("Open Settings – " + b("⌘,") + " or the gear at the bottom left.", "Turn on " + b("Sync with iCloud Drive") + ".",
                   "Do the same on your other Mac. If it already has notes, Fixa first shows exactly what merging will do – " + hl("nothing changes until you confirm", "green") + ".") +
                heading("Nothing Gets Lost") +
                ul("Every change is versioned. Fixa never decides by the clock which version is newer.",
                   "Changed on two Macs at once? You keep both – one is marked “(conflict)”.",
                   "Deleted on one Mac but edited on another? Fixa asks you – look for the " + hl("orange button", "orange") + " at the bottom left (⌥⌘Y).",
                   b("History") + " (⌘Y) shows every change on every Mac – who, what and when – and brings deleted notes back with " + b("Restore") + ".") +
                heading("The Little Cloud") +
                p("At the bottom of the editor, next to the note’s dates: gray means fine or in progress, orange means a problem – for example, iCloud Drive is turned off.") },
            { id: "buttons", age: 0.5, html: title("Buttons and Settings") +
                p("At the bottom left of the window:") +
                image("guide-buttons.png", 840, 356) +
                ul(b("?") + " – all keyboard shortcuts (⌘/)", b("Gear") + " – Settings (⌘,)",
                   hl("Orange number", "orange") + " – sync decisions waiting for you. It only shows up when there are some.") +
                heading("In Settings") +
                ul(b("General") + " – open Fixa when you log in", b("Updates") + " – Fixa updates itself and always asks first",
                   b("Checklists") + " – move checked items to the bottom", b("Sync") + " – iCloud Drive on or off",
                   b("Location") + " – where your notes are; every note is a plain .rtf file that TextEdit opens too",
                   b("Images") + " and " + b("Archive") + " – how much space they use, and cleaning up",
                   b("Export") + " – a copy of all notes as RTF and Markdown (also ⌥⌘E)") +
                p(b("Help › Welcome to Fixa"), " shows the setup steps again.") },
        ];

        const website = [
            { id: "kickoff", age: 2, pinned: true, html: title("Kickoff Meeting") +
                p("Thursday · Anna, Tom, Lucy and me") +
                heading("Decisions") +
                ul("Launch on " + hl("Monday, March 14"), "New homepage first, the blog can follow in April",
                   "Keep the current logo, refresh the " + b("palette") + " and " + b("fonts")) +
                heading("Next Steps") +
                todo([true, "Send the summary to the team"], [false, "Tom: first homepage draft by " + u("Friday")],
                     [false, "Lucy: list of pages to remove"], [false, "Book a review with the client"]) +
                heading("Open Questions") +
                ol("Do we move the shop to its own domain?", "Who writes the new " + b("About") + " page?") },
            { id: "launch", age: 5, html: title("Launch Checklist") +
                subheading("Content") + todo([true, "Final homepage copy"], [true, "Team photos"], [false, "Proofread every page"]) +
                subheading("Design") + todo([true, "Palette and fonts"], [false, "Dark mode check"]) +
                subheading("Tech") + todo([false, "Redirects from the old URLs"], [false, "Analytics and cookie banner"], [false, hl("Test the contact form", "pink")]) },
            { id: "copy", age: 26, html: title("Homepage Copy") +
                p("Green = approved, pink = needs another look.") +
                image("sample-wireframe.png", 1200, 840) +
                heading("Headline") +
                p(st("The best solution for your business")) +
                p(hl("Everything your team needs, in one place.", "green")) +
                heading("Intro") +
                p("We help small teams ", hl("plan, share and ship", "green"), " without endless meetings. ", hl("Start free – no credit card needed.", "pink")) +
                heading("Call to Action") +
                ul(hl("Get started", "green"), st("Sign up now")) },
            { id: "inspiration", age: 50, html: title("Inspiration") +
                p("Sites we like and why.") +
                card("Apple", "https://www.apple.com", "A", "dark") +
                ul("Big, calm photos and very little text") +
                card("Stripe", "https://stripe.com", "S", "stripe") +
                ul("Clear pricing, great " + u("documentation")) },
        ];

        const lisbon = [
            { id: "packing", age: 3, html: title("Packing List") +
                todo([true, "Passport"], [true, "Charger and adapter"], [true, "Comfortable shoes – lots of hills!"],
                     [false, "Sunscreen"], [false, "Light jacket for the evenings"], [false, "Download offline maps"]) },
            { id: "itinerary", age: 28, html: title("Itinerary") +
                p("Flight lands Friday at ", hl("10:40"), " · Hotel in Chiado, check-in from 14:00") +
                image("sample-lisbon.jpg", 1200, 720) +
                heading("Friday – Alfama") +
                ul("Tram 28 up the hill", "Sunset at Miradouro da Senhora do Monte") +
                heading("Saturday – Belém") +
                ul("Jerónimos Monastery – " + hl("tickets booked for 10:00", "green"), "Pastéis de Belém (expect a queue)") +
                heading("Sunday – Sintra") +
                ul("Train from Rossio, about 40 minutes", "Pena Palace – " + hl("buy tickets online", "pink")) +
                card("Lisbon – Wikipedia", "https://en.wikipedia.org/wiki/Lisbon", "W") },
            { id: "food", age: 75, html: title("Places to Eat") +
                ol(b("Time Out Market") + " – a bit of everything, good for the first evening",
                   b("A small tasca in Alfama") + " – grilled sardines and vinho verde",
                   b("Pastéis de nata") + " – try at least three places and pick a favorite") +
                card("Pastel de nata – Wikipedia", "https://en.wikipedia.org/wiki/Pastel_de_nata", "W") },
        ];

        const recipes = [
            { id: "pasta", age: 30, html: title("Pasta al Limone") +
                p("Ready in 20 minutes · serves 2") +
                heading("Ingredients") +
                ul("200 g spaghetti", "1 unwaxed lemon – zest and juice", "40 g butter", "50 g parmesan, finely grated", "Black pepper") +
                heading("Steps") +
                ol("Cook the pasta. " + hl("Keep a cup of the pasta water."), "Melt the butter with the lemon zest.",
                   "Add the pasta, lemon juice and a splash of pasta water.", "Off the heat, stir in the parmesan until creamy.") +
                p(b("Tip:"), " add the cheese ", u("off the heat"), ", or it goes stringy.") },
            { id: "pancakes", age: 100, html: title("Weekend Pancakes") +
                subheading("Shopping") +
                todo([true, "Flour"], [true, "Eggs"], [false, "Milk"], [false, "Blueberries"], [false, "Maple syrup"]) +
                subheading("Method") +
                ol("Mix 150 g flour, 1 tsp baking powder and a pinch of salt.", "Whisk in 1 egg and 200 ml milk – " + hl("a few lumps are fine", "green") + ".",
                   "Cook on a medium pan until bubbles appear, then flip.") },
        ];

        // `page` = motiv úvodu stránky (style.css), `last` = poznámka, která se otevře po přepnutí na projekt.
        return [
            { id: "guide", name: "Fixa Guide", color: "#B3B2EC", emoji: "📘", page: "lavender", last: "start", notes: guide },
            { id: "website", name: "Website Relaunch", color: "#A3C6F5", emoji: "💼", page: "blue", last: "kickoff", notes: website },
            { id: "lisbon", name: "Trip to Lisbon", color: "#9EDDD6", emoji: "✈️", page: "teal", last: "itinerary", notes: lisbon },
            { id: "recipes", name: "Recipes", color: "#FBC490", emoji: "🍝", page: "peach", last: "pasta", notes: recipes },
        ];
    }
    const projects = makeLibrary();
    let current = projects.find((project) => project.id === "website");

    // MARK: - Barvy (ProjectTheme.swift)

    const clamp = (x, low = 0, high = 1) => Math.min(Math.max(x, low), high);
    const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255);
    const hexOf = (components) => "#" + components.map((x) => Math.round(clamp(x) * 255).toString(16).padStart(2, "0")).join("");
    function hsb([r, g, bl]) {
        const max = Math.max(r, g, bl), d = max - Math.min(r, g, bl);
        let h = 0;
        if (d) {
            h = max === r ? ((g - bl) / d) % 6 : max === g ? (bl - r) / d + 2 : (r - g) / d + 4;
            h = (h / 6 + 1) % 1;
        }
        return [h, max ? d / max : 0, max];
    }
    function fromHSB(h, s, v) {
        const i = Math.floor(h * 6), f = h * 6 - i;
        const pp = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        return [[v, t, pp], [q, v, pp], [pp, v, t], [pp, q, v], [t, pp, v], [v, pp, q]][i % 6];
    }
    function theme(hex, dark) {
        const [h, s] = hsb(rgb(hex));
        const tint = Math.min(s, 0.6) / 0.6, gray = s < 0.08;
        const color = (sat, bri) => hexOf(fromHSB(h, clamp(sat), clamp(bri)));
        return dark ? {
            canvas: color(0.35 * tint, 0.2), paper: color(0.22 * tint, 0.14), sel: color(0.45 * tint, 0.34),
            accent: color(gray ? 0 : clamp(s * 1.2 + 0.15, 0.35, 0.65), gray ? 0.75 : 0.9),
        } : {
            canvas: color(0.21 * tint, 0.96), paper: color(0.075 * tint, 0.993), sel: color(0.38 * tint, 0.93),
            accent: color(gray ? 0 : clamp(s * 1.6 + 0.25, 0.5, 0.85), gray ? 0.45 : 0.72),
        };
    }

    // MARK: - Ikony (jako SF Symbols ve Fixe)

    const svg = (body, box = 20, extra = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"') =>
        `<svg viewBox="0 0 ${box} ${box}" ${extra} aria-hidden="true">${body}</svg>`;
    const lines = '<path d="M8 5h9M8 10h9M8 15h9"/>';
    const icons = {
        sidebar: svg('<rect x="2.5" y="4" width="15" height="12" rx="3"/><path d="M8 4v12M4.6 7h1.3M4.6 9.5h1.3"/>'),
        compose: svg('<path d="M9.5 3.5H6A2.5 2.5 0 0 0 3.5 6v8A2.5 2.5 0 0 0 6 16.5h8a2.5 2.5 0 0 0 2.5-2.5v-3.5"/><path d="M15.1 2.9a1.5 1.5 0 0 1 2.1 2.1L10.3 12l-2.8.7.7-2.8z"/>'),
        bullets: svg('<g fill="currentColor" stroke="none"><circle cx="3.8" cy="5" r="1.5"/><circle cx="3.8" cy="10" r="1.5"/><circle cx="3.8" cy="15" r="1.5"/></g>' + lines),
        numbers: svg('<g fill="currentColor" stroke="none" font-size="6.2" font-weight="700" font-family="-apple-system,system-ui,sans-serif"><text x="1.8" y="7.2">1</text><text x="1.8" y="12.2">2</text><text x="1.8" y="17.2">3</text></g>' + lines),
        checklist: svg('<circle cx="4.2" cy="5.5" r="2.6"/><path d="M3 5.6l.9.9 1.6-1.9"/><circle cx="4.2" cy="14.5" r="2.6"/><path d="M9 5.5h8.5M9 14.5h8.5"/>'),
        highlighter: svg('<path d="M4.5 15.5l1-3.6 7.9-7.9a1.6 1.6 0 0 1 2.3 0l.3.3a1.6 1.6 0 0 1 0 2.3l-7.9 7.9z"/><path d="M11.8 5.6l2.6 2.6M3 17.5h6"/>'),
        eraser: svg('<path d="M8.5 16.5h8"/><path d="M11.4 3.9l4.6 4.6a1.5 1.5 0 0 1 0 2.1l-5.4 5.4a1.5 1.5 0 0 1-1.1.5H6.7a1.5 1.5 0 0 1-1.1-.5l-2.1-2.1a1.5 1.5 0 0 1 0-2.1l5.8-5.9a1.5 1.5 0 0 1 2.1 0z"/><path d="M6.8 8.6l4.6 4.6"/>'),
        link: svg('<path d="M8.6 11.4a3.1 3.1 0 0 0 4.4 0l2.7-2.7a3.1 3.1 0 0 0-4.4-4.4l-1.1 1.1"/><path d="M11.4 8.6a3.1 3.1 0 0 0-4.4 0l-2.7 2.7a3.1 3.1 0 0 0 4.4 4.4l1.1-1.1"/>'),
        photo: svg('<rect x="2.5" y="4" width="15" height="12" rx="2.5"/><circle cx="7" cy="8.2" r="1.4"/><path d="M3 14.2l4-3.6 3 2.6 3.1-3.1 4.4 4.2"/>'),
        pin: svg('<path d="M3.5 1h5l-.9 3.4L9.6 6.5H6.5L6 12l-.5-5.5H2.4l2-2.1z"/>', 12, 'fill="currentColor"'),
        note: svg('<rect x="1.8" y="2" width="8.4" height="8.4" rx="1.8"/><path d="M4 5h4M4 7.3h2.8"/>', 12, 'fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"'),
        chevron: svg('<path d="M2.5 4.5l3.5 3.5 3.5-3.5"/>', 12, 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'),
        plus: svg('<path d="M10 3.5v13M3.5 10h13"/>', 20, 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"'),
        gear: svg('<path fill-rule="evenodd" d="M16.26 7.92 L18.43 8.29 L18.43 11.71 L16.26 12.08 L15.90 12.96 L17.17 14.75 L14.75 17.17 L12.96 15.90 L12.08 16.26 L11.71 18.43 L8.29 18.43 L7.92 16.26 L7.04 15.90 L5.25 17.17 L2.83 14.75 L4.10 12.96 L3.74 12.08 L1.57 11.71 L1.57 8.29 L3.74 7.92 L4.10 7.04 L2.83 5.25 L5.25 2.83 L7.04 4.10 L7.92 3.74 L8.29 1.57 L11.71 1.57 L12.08 3.74 L12.96 4.10 L14.75 2.83 L17.17 5.25 L15.90 7.04Z M12.9 10a2.9 2.9 0 1 0-5.8 0a2.9 2.9 0 1 0 5.8 0Z"/>', 20, 'fill="currentColor"'),
    };

    // MARK: - Okno

    const styles = [["title", "Title", "h1"], ["heading", "Heading", "h2"], ["subheading", "Subheading", "h3"], ["body", "Body", "p"]];
    const markers = [["yellow", "#FFDB2E"], ["green", "#6BDE6B"], ["pink", "#FF80C9"], ["blue", "#66BAFF"], ["orange", "#FFA340"]];
    host.innerHTML = `
<div class="fx-window">
    <div class="fx-side">
        <div class="fx-top"><span class="fx-lights"><i></i><i></i><i></i></span><button class="fx-round" data-act="sidebar" title="Hide Projects (⌘S)" aria-label="Hide projects">${icons.sidebar}</button></div>
        <div class="fx-tiles"></div>
        <div class="fx-resize" data-column="side" title="Drag to resize"></div>
        <div class="fx-side-bottom"><button class="fx-round small" data-act="help" title="Keyboard Shortcuts (⌘/)" aria-label="Keyboard shortcuts">?</button><button class="fx-round small" data-act="settings" title="Settings (⌘,)" aria-label="Settings">${icons.gear}</button></div>
    </div>
    <div class="fx-list">
        <div class="fx-top"><span class="fx-lights"><i></i><i></i><i></i></span><button class="fx-round fx-show-side" data-act="sidebar" title="Show Projects (⌘S)" aria-label="Show projects">${icons.sidebar}</button><button class="fx-round" data-act="new" title="New Note (⌘N)" aria-label="New note">${icons.compose}</button></div>
        <div class="fx-list-scroll" tabindex="0" aria-label="Notes"></div>
        <div class="fx-resize" data-column="list" title="Drag to resize"></div>
    </div>
    <div class="fx-editor">
        <div class="fx-scroll"><div class="fx-doc" contenteditable="true" spellcheck="false"></div></div>
        <div class="fx-head"><div class="fx-bar-row"></div><div class="fx-bar-row"></div></div>
        <div class="fx-foot"></div>
    </div>
    <div class="fx-toast" role="status"></div>
</div>`;

    const $ = (selector) => host.querySelector(selector);
    const tilesEl = $(".fx-tiles");
    const listEl = $(".fx-list-scroll");
    const editorEl = $(".fx-editor");
    const scrollEl = $(".fx-scroll");
    const headEl = $(".fx-head");
    const [row1, row2] = host.querySelectorAll(".fx-bar-row");
    const footEl = $(".fx-foot");
    const toastEl = $(".fx-toast");
    let doc = $(".fx-doc");

    let openNote = null;
    const darkMode = matchMedia("(prefers-color-scheme: dark)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    // MARK: - Data a texty

    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const hourCycle = new Intl.DateTimeFormat(navigator.language, { hour: "numeric" }).resolvedOptions().hourCycle;
    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hourCycle });
    const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    const dayFormat = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });
    const dateFormat = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "numeric", year: "numeric" });
    const startOfDay = (time) => new Date(time).setHours(0, 0, 0, 0);
    const daysAgo = (time) => Math.round((startOfDay(Date.now()) - startOfDay(time)) / 864e5);

    // Seznam poznámek: dnes čas, včera „Yesterday“, do týdne den, jinak datum (NoteRow.dateLabel).
    function listDate(time) {
        const days = daysAgo(time);
        if (days === 0) return timeFormat.format(time);
        if (days === 1) return "Yesterday";
        if (days < 7) return weekdayFormat.format(time);
        return dateFormat.format(time);
    }
    // Pod poznámkou: „today 10:44 AM“ (AppLanguage.dateLabel).
    function footDate(time) {
        const days = daysAgo(time), clock = timeFormat.format(time);
        return days === 0 ? `today ${clock}` : days === 1 ? `yesterday ${clock}` : `${dayFormat.format(time)} ${clock}`;
    }

    // Titulek = první neprázdný řádek, náhled = zbytek (seznamy se značkou jako v RTF).
    function summarize(root) {
        const lines = [];
        let loose = "";
        for (const node of root.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) { loose += node.textContent; continue; }
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            if (loose) { lines.push(loose); loose = ""; }
            const tag = node.tagName;
            if (tag === "UL" || tag === "OL") {
                let index = 0;
                for (const li of node.children) {
                    index += 1;
                    const marker = tag === "OL" ? `${index}.` : node.classList.contains("fx-check") ? (li.classList.contains("done") ? "☑" : "☐") : "•";
                    lines.push(`${marker} ${li.textContent}`);
                }
            } else if (tag !== "FIGURE") {
                lines.push(node.classList.contains("fx-card") ? node.querySelector(".fx-card-title").textContent : node.textContent);
            }
        }
        if (loose) lines.push(loose);
        const clean = lines.map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
        return { title: clean[0] || "", preview: clean.slice(1).join(" ") };
    }
    // Data poznámek a titulky/náhledy pro seznam (u ukázkových podle stáří, u změněných z prohlížeče).
    function prepare() {
        const loaded = Date.now();
        for (const project of projects) {
            for (const note of project.notes) {
                if (!note.created) note.created = note.modified = loaded - note.age * 3600e3;
                const box = document.createElement("div");
                box.innerHTML = note.html;
                Object.assign(note, summarize(box));
            }
        }
    }

    // MARK: - Uložení v prohlížeči
    // Změny zůstávají jen v localStorage tohoto prohlížeče (nic se nikam neposílá) a přežijí obnovení
    // stránky. Ukládají se jen změněné a nové poznámky. Při změně ukázkových dat zvyš `storeVersion` –
    // staré úpravy by jinak přepsaly nový obsah.
    const storeKey = "fixa-demo", storeVersion = 1;
    function readStore() {
        try {
            const data = JSON.parse(localStorage.getItem(storeKey));
            return data?.v === storeVersion ? data : null;
        } catch {
            return null;
        }
    }
    function applyStore(data) {
        if (!data) return;
        for (const saved of data.notes || []) {
            const project = projects.find((candidate) => candidate.id === saved.project);
            if (!project) continue;
            let note = project.notes.find((candidate) => candidate.id === saved.id);
            if (!note) {
                if (!saved.isNew) continue;
                note = { id: saved.id, isNew: true };
                project.notes.push(note);
            }
            Object.assign(note, { html: saved.html, created: saved.created, modified: saved.modified, changed: true });
        }
        for (const project of projects) {
            const last = data.last?.[project.id];
            if (last && project.notes.some((note) => note.id === last)) project.last = last;
        }
        if (Array.isArray(data.order)) {
            const rank = (project) => { const index = data.order.indexOf(project.id); return index < 0 ? Infinity : index; };
            projects.sort((a, z) => rank(a) - rank(z));
        }
        if (data.side) host.classList.add("no-side");
        if (data.widths) Object.assign(columnWidths, data.widths);
    }
    let saveTimer = 0, warnedFull = false;
    function saveStore() {
        clearTimeout(saveTimer);
        saveTimer = 0;
        const notes = [];
        for (const project of projects) {
            for (const note of project.notes) {
                if (note.changed) notes.push({ project: project.id, id: note.id, html: note.html, created: note.created, modified: note.modified, isNew: !!note.isNew });
            }
        }
        const data = {
            v: storeVersion, notes, order: projects.map((project) => project.id), widths: columnWidths,
            last: Object.fromEntries(projects.map((project) => [project.id, project.last])), side: host.classList.contains("no-side"),
        };
        try {
            localStorage.setItem(storeKey, JSON.stringify(data));
        } catch {
            // Plný localStorage (velké obrázky) nebo soukromé okno – v okně změny zůstanou, jen se nezapamatují.
            if (!warnedFull) toast("This browser has no more room to remember your changes.", false);
            warnedFull = true;
        }
    }
    const scheduleSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveStore, 400); };
    addEventListener("pagehide", () => { if (saveTimer) saveStore(); });

    // Zpátky na ukázkovou knihovnu, jak byla.
    function resetDemo() {
        clearTimeout(saveTimer);
        saveTimer = 0;
        try { localStorage.removeItem(storeKey); } catch { /* nic */ }
        warnedFull = false;
        openNote = null;
        projects.splice(0, projects.length, ...makeLibrary());
        prepare();
        current = projects.find((project) => project.id === "website");
        host.classList.remove("no-side");
        columnWidths.side = columnWidths.list = null;
        restoreColumns();
        renderTiles();
        applyTheme();
        showNote(current.notes.find((note) => note.id === current.last), { animate: true });
        fadeIn(listEl);
        toast("The demo is back to how it started.", false);
    }

    const sortedNotes = (project) => [...project.notes].sort((a, z) => z.modified - a.modified);
    const plural = (count) => (count === 1 ? "1 note" : `${count} notes`);
    const isEmptyNote = (note) => !note.title && !/<(figure|img)|fx-card/.test(note.html);

    // MARK: - Vykreslení

    function applyTheme() {
        // Tmavý režim podle CSS (stejný zdroj jako zbytek vzhledu okna).
        const dark = getComputedStyle(host).getPropertyValue("--fx-scheme").trim() === "dark";
        const colors = theme(current.color, dark);
        host.style.setProperty("--fx-canvas", colors.canvas);
        host.style.setProperty("--fx-paper", colors.paper);
        host.style.setProperty("--fx-sel", colors.sel);
        host.style.setProperty("--fx-accent", colors.accent);
        // Úvod stránky se přebarví s oknem (jen když je zrovna vidět – viz index.html).
        const hero = host.closest("[data-project]");
        if (hero) {
            hero.dataset.project = current.page;
            window.fixaPageTheme?.();
        }
    }

    function renderTiles() {
        tilesEl.innerHTML = projects.map((project) => `
            <button class="fx-tile${project === current ? " selected" : ""}" data-project="${project.id}" style="--tc: ${project.color}" aria-pressed="${project === current}">
                <span class="fx-badge">${project.emoji}</span><span class="fx-tile-name">${project.name}</span><span class="fx-tile-count">${project.notes.length}</span>
            </button>`).join("") +
            `<button class="fx-new-project" data-act="new-project">${icons.plus}<span>New Project</span></button>`;
    }

    function renderList() {
        const notes = sortedNotes(current);
        const pinned = notes.filter((note) => note.pinned), rest = notes.filter((note) => !note.pinned);
        const row = (note) => `
            <button class="fx-row${note === openNote ? " selected" : ""}" data-note="${note.id}">
                <span class="fx-row-title">${esc(note.title || "New Note")}</span>
                <span class="fx-row-sub"><span>${listDate(note.modified)}</span><span class="fx-row-prev">${esc(note.preview || "No additional text")}</span></span>
            </button>`;
        listEl.innerHTML = `
            <div class="fx-list-head"><span class="fx-badge" style="--tc: ${current.color}">${current.emoji}</span><span><b>${current.name}</b><small>${plural(notes.length)}</small></span></div>
            ${pinned.length ? `<div class="fx-section pinned">${icons.pin}Pinned</div>` : ""}
            <div class="fx-rows">${pinned.map(row).join("")}</div>
            ${pinned.length ? `<div class="fx-section notes">${icons.note}Notes</div>` : ""}
            <div class="fx-rows">${rest.map(row).join("")}</div>`;
        const count = tilesEl.querySelector(`[data-project="${current.id}"] .fx-tile-count`);
        if (count) count.textContent = notes.length;
        revealRow();
    }

    // Otevřená poznámka má být v seznamu vidět (na telefonu je to vodorovný pruh). Ne scrollIntoView –
    // to by posunulo i stránku.
    function revealRow() {
        const row = listEl.querySelector(".fx-row.selected");
        if (!row) return;
        const r = row.getBoundingClientRect(), box = listEl.getBoundingClientRect();
        if (r.left < box.left) listEl.scrollLeft -= box.left - r.left + 12;
        else if (r.right > box.right) listEl.scrollLeft += r.right - box.right + 12;
        if (r.top < box.top) listEl.scrollTop -= box.top - r.top + 8;
        else if (r.bottom > box.bottom) listEl.scrollTop += r.bottom - box.bottom + 8;
    }

    function renderFoot() {
        footEl.textContent = openNote ? `Created ${footDate(openNote.created)} · Edited ${footDate(openNote.modified)}` : "";
    }

    // Mezery mezi bloky v HTML šablonách by se v editoru chovaly jako text.
    function stripWhitespace(root) {
        for (const node of [...root.childNodes]) {
            if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
            else if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === "UL" || node.tagName === "OL")) stripWhitespace(node);
        }
    }

    function fadeIn(element) {
        if (reducedMotion.matches || !element.animate) return;
        element.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
    }

    // Nový editor pro každou poznámku – historie Zpět se tak nemíchá mezi poznámkami.
    function showNote(note, { focus = false, animate = false } = {}) {
        if (openNote && openNote !== note) discardIfEmpty(openNote);
        openNote = note;
        current.last = note.id;
        const fresh = doc.cloneNode(false);
        fresh.innerHTML = note.html;
        stripWhitespace(fresh);
        doc.replaceWith(fresh);
        doc = fresh;
        for (const figure of doc.querySelectorAll(".fx-selected")) figure.classList.remove("fx-selected");
        scrollEl.scrollTop = 0;
        renderList();
        renderFoot();
        updateBar();
        if (animate) fadeIn(doc);
        if (focus) placeCaretAtEnd();
        scheduleSave();
    }

    // Prázdná nová poznámka po odchodu zmizí (pravidlo 16) – jen ta, kterou tu někdo založil.
    function discardIfEmpty(note) {
        const project = projects.find((candidate) => candidate.notes.includes(note));
        if (!note.isNew || !project || !isEmptyNote(note)) return;
        project.notes.splice(project.notes.indexOf(note), 1);
        if (project.last === note.id) project.last = null;
        scheduleSave();
        const count = tilesEl.querySelector(`[data-project="${project.id}"] .fx-tile-count`);
        if (count) count.textContent = project.notes.length;
    }

    function selectProject(project, { auto = false } = {}) {
        if (project === current) return;
        if (openNote) discardIfEmpty(openNote);
        openNote = null;
        current = project;
        if (auto && doc.contains(document.activeElement || null)) doc.blur();
        applyTheme();
        for (const tile of tilesEl.querySelectorAll(".fx-tile")) {
            const selected = tile.dataset.project === project.id;
            tile.classList.toggle("selected", selected);
            tile.setAttribute("aria-pressed", selected);
        }
        const notes = sortedNotes(project);
        const pinned = notes.filter((note) => note.pinned);
        const note = project.notes.find((candidate) => candidate.id === project.last) || [...pinned, ...notes.filter((n) => !n.pinned)][0];
        if (note) showNote(note, { animate: true });
        else { renderList(); doc.innerHTML = ""; renderFoot(); }
        fadeIn(listEl);
    }

    function newNote() {
        const now = Date.now();
        const note = { id: `new-${now}`, html: "<h1><br></h1>", title: "", preview: "", created: now, modified: now, isNew: true };
        current.notes.push(note);
        showNote(note, { focus: true });
    }

    // Uložení do paměti po každé změně (nic se nikam neposílá).
    function commit() {
        if (!openNote) return;
        cleanStyles();
        // Výběr obrázku (a úchyt, přesun) je jen stav editoru, do poznámky nepatří.
        const copy = doc.cloneNode(true);
        for (const figure of copy.querySelectorAll("figure[class]")) figure.removeAttribute("class");
        openNote.html = copy.innerHTML;
        openNote.modified = Date.now();
        openNote.changed = true;
        Object.assign(openNote, summarize(doc));
        renderList();
        renderFoot();
        updateBar();
        scheduleSave();
    }

    // MARK: - Výběr v textu

    let savedRange = null;
    const selection = () => window.getSelection();
    const inDoc = (node) => !!node && doc.contains(node);

    function blockOf(node) {
        while (node && node !== doc) {
            if (node.nodeType === Node.ELEMENT_NODE && (node.parentNode === doc || node.tagName === "LI")) return node;
            node = node.parentNode;
        }
        return null;
    }
    const currentBlock = () => blockOf(selection().anchorNode);
    const styleOf = (block) => ({ H1: "title", H2: "heading", H3: "subheading" })[block?.tagName] || "body";
    function listKind(block) {
        if (block?.tagName !== "LI") return null;
        const list = block.parentNode;
        return list.tagName === "OL" ? "numbered" : list.classList.contains("fx-check") ? "checklist" : "bullet";
    }

    function placeCaretAtEnd() {
        doc.focus({ preventScroll: true });
        const range = document.createRange();
        range.selectNodeContents(doc.lastElementChild || doc);
        range.collapse(false);
        selection().removeAllRanges();
        selection().addRange(range);
    }

    // Tlačítka lišty nevezmou textu fokus; kdyby v textu nic vybrané nebylo, vrátí se poslední místo.
    function focusDoc() {
        if (inDoc(selection().anchorNode) && document.activeElement === doc) return;
        doc.focus({ preventScroll: true });
        if (savedRange && inDoc(savedRange.startContainer)) {
            selection().removeAllRanges();
            selection().addRange(savedRange);
        } else {
            placeCaretAtEnd();
        }
    }

    function exec(command, value = null) {
        focusDoc();
        document.execCommand(command, false, value);
    }

    // MARK: - Formátování

    // Styly odstavců a seznamy si okno skládá samo (execCommand v Chromu dává seznam dovnitř <p>
    // a přidává inline styly). Bloky = odstavce a položky seznamů; vybrané se převedou a ze všech
    // se znovu poskládá text – sousední položky stejného druhu tvoří jeden seznam.
    const listTag = { bullet: "UL", checklist: "UL", numbered: "OL" };
    function units() {
        // Volný text přímo v editoru (po smazání všeho) patří do odstavce.
        let loose = null;
        for (const node of [...doc.childNodes]) {
            if (node.nodeType === Node.ELEMENT_NODE && !/^(B|STRONG|U|S|STRIKE|MARK|A|SPAN|BR)$/.test(node.tagName)) { loose = null; continue; }
            if (!loose) { loose = document.createElement("p"); node.before(loose); }
            loose.append(node);
        }
        const all = [];
        for (const block of [...doc.children]) {
            if (block.tagName === "UL" || block.tagName === "OL") {
                const kind = block.tagName === "OL" ? "numbered" : block.classList.contains("fx-check") ? "checklist" : "bullet";
                for (const li of [...block.children]) all.push({ el: li, list: kind });
            } else {
                all.push({ el: block, list: null });
            }
        }
        return all;
    }

    function restructure(plan) {
        const range = selection().rangeCount ? selection().getRangeAt(0) : null;
        if (!range || !inDoc(range.commonAncestorContainer) && range.commonAncestorContainer !== doc) return;
        const saved = [range.startContainer, range.startOffset, range.endContainer, range.endOffset];
        const all = units();
        const chosen = all.filter((unit) => range.intersectsNode(unit.el) && !unit.el.matches("figure, .fx-card"));
        if (!chosen.length) return;
        const change = plan(chosen);
        const replaced = new Map();
        for (const unit of chosen) {
            const next = change(unit);
            if (!next) continue;
            const element = document.createElement(next.list ? "li" : next.tag);
            element.append(...unit.el.childNodes);
            if (!element.firstChild) element.append(document.createElement("br"));
            replaced.set(unit.el, element);
            unit.el = element;
            unit.list = next.list || null;
        }
        const blocks = [];
        let list = null;
        for (const unit of all) {
            if (!unit.list) { list = null; blocks.push(unit.el); continue; }
            if (list?.kind !== unit.list) {
                list = { kind: unit.list, el: document.createElement(listTag[unit.list]) };
                if (unit.list === "checklist") list.el.className = "fx-check";
                blocks.push(list.el);
            }
            if (unit.list !== "checklist") unit.el.classList.remove("done");
            if (!unit.el.classList.length) unit.el.removeAttribute("class");
            list.el.append(unit.el);
        }
        doc.replaceChildren(...blocks);
        const [sc, so, ec, eo] = saved.map((node) => replaced.get(node) || node);
        if (sc.isConnected && ec.isConnected) selection().setBaseAndExtent(sc, so, ec, eo);
        commit();
    }

    function setStyle(style) {
        focusDoc();
        const tag = styles.find(([key]) => key === style)[2].toUpperCase();
        restructure(() => (unit) => (unit.list || unit.el.tagName !== tag ? { tag } : null));
    }

    function toggleList(kind) {
        focusDoc();
        restructure((chosen) => {
            // Všechno už je tenhle seznam = seznam zrušit; jinak se z vybraných řádků stanou jeho položky
            // (písmo běžného textu, z nadpisu obyčejný text).
            const off = chosen.every((unit) => unit.list === kind);
            return (unit) => (off ? { tag: "P" } : unit.list === kind ? null : { list: kind });
        });
    }

    // Chrome při slučování odstavců přidává inline styly (velikost písma, tučnost) – Fixa nic takového nemá.
    function cleanStyles() {
        const styled = doc.querySelectorAll("[style], font");
        if (!styled.length) return;
        const sel = selection();
        const saved = sel.rangeCount ? [sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset] : null;
        for (const element of styled) {
            element.removeAttribute("style");
            if ((element.tagName === "SPAN" || element.tagName === "FONT") && !element.attributes.length) element.replaceWith(...element.childNodes);
        }
        if (saved && saved[0].isConnected && saved[2].isConnected) sel.setBaseAndExtent(...saved);
    }

    function toggleChecked() {
        const range = selection().rangeCount ? selection().getRangeAt(0) : null;
        if (!range || !inDoc(range.commonAncestorContainer)) return;
        const items = [...doc.querySelectorAll(".fx-check > li")].filter((li) => range.intersectsNode(li));
        if (!items.length) return;
        const done = !items.every((li) => li.classList.contains("done"));
        for (const li of items) li.classList.toggle("done", done);
        commit();
    }

    // Fixa: každý vybraný kousek textu dostane <mark> v dané barvě (guma ho odebere). Hranice existujících
    // zvýraznění se rozdělí, takže jde přebarvit nebo smazat i jen část.
    function highlight(color) {
        focusDoc();
        const range = selection().rangeCount ? selection().getRangeAt(0) : null;
        if (!range || range.collapsed || !inDoc(range.commonAncestorContainer)) return;
        // Okrajové kousky textu se rozdělí, aby výběr začínal i končil na hranici textového uzlu.
        let { startContainer: sc, startOffset: so, endContainer: ec, endOffset: eo } = range;
        const sameNode = sc === ec;
        if (ec.nodeType === Node.TEXT_NODE && eo < ec.length) ec.splitText(eo);
        if (sc.nodeType === Node.TEXT_NODE && so > 0) {
            const rest = sc.splitText(so);
            if (sameNode) { ec = rest; eo = rest.length; }
            sc = rest;
            so = 0;
        }
        const scope = document.createRange();
        scope.setStart(sc, so);
        scope.setEnd(ec, eo);
        const ancestor = scope.commonAncestorContainer;
        const walker = document.createTreeWalker(ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentNode : ancestor, NodeFilter.SHOW_TEXT);
        const texts = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.length || !scope.intersectsNode(node) || (node === ec && eo === 0)) continue;
            if (node.parentElement.closest("[contenteditable=false]")) continue;
            texts.push(node);
        }
        for (const text of texts) {
            const mark = text.parentElement.closest("mark");
            if (mark && doc.contains(mark)) {
                isolate(text, mark);
                if (color) mark.dataset.c = color;
                else mark.replaceWith(...mark.childNodes);
            } else if (color) {
                const wrapper = document.createElement("mark");
                wrapper.dataset.c = color;
                text.replaceWith(wrapper);
                wrapper.append(text);
            }
        }
        tidyMarks();
        if (texts.length) {
            const after = document.createRange();
            after.setStartBefore(texts[0]);
            after.setEndAfter(texts[texts.length - 1]);
            selection().removeAllRanges();
            selection().addRange(after);
        }
        commit();
    }

    // Vytáhne text z <mark>: část před ním a za ním dostane vlastní kopii značky.
    function isolate(text, mark) {
        const before = document.createRange();
        before.setStart(mark, 0);
        before.setEndBefore(text);
        const head = before.extractContents();
        if (head.textContent) {
            const copy = mark.cloneNode(false);
            copy.append(head);
            mark.before(copy);
        }
        const after = document.createRange();
        after.setStartAfter(text);
        after.setEnd(mark, mark.childNodes.length);
        const tail = after.extractContents();
        if (tail.textContent) {
            const copy = mark.cloneNode(false);
            copy.append(tail);
            mark.after(copy);
        }
    }

    function tidyMarks() {
        for (const mark of doc.querySelectorAll("mark")) {
            if (!mark.textContent) { mark.remove(); continue; }
            let next = mark.nextSibling;
            while (next && next.nodeName === "MARK" && next.dataset.c === mark.dataset.c) {
                mark.append(...next.childNodes);
                next.remove();
                next = mark.nextSibling;
            }
        }
    }

    let lastMarker = "yellow";
    function markerAction(color) {
        if (color) lastMarker = color;
        highlight(color);
    }

    // MARK: - Lišta formátování

    const button = (attrs, content) => `<button type="button" class="fx-btn ${attrs.cls || ""}" ${attrs.data || ""} title="${attrs.title || ""}" aria-label="${attrs.label || attrs.title || ""}">${content}</button>`;
    const groups = {};
    function group(key, html) {
        const element = document.createElement("div");
        element.className = `fx-grp fx-grp-${key}`;
        element.innerHTML = html;
        groups[key] = element;
    }
    group("segments", styles.map(([key, name]) => button({ cls: "fx-style", data: `data-cmd="style" data-style="${key}"`, title: `${name} (⇧⌘${name[0]})` }, name)).join(""));
    group("menu", `<button type="button" class="fx-btn fx-menu-btn on" data-cmd="menu" title="Paragraph style" aria-haspopup="true"><span class="fx-menu-names">${styles.map(([key, name]) => `<span class="fx-style" data-style="${key}">${name}</span>`).join("")}</span>${icons.chevron}</button>
        <div class="fx-pop fx-menu-pop" role="menu" hidden>${styles.map(([key, name]) => `<button type="button" class="fx-option fx-style" data-cmd="style" data-style="${key}"><span class="check"></span>${name}</button>`).join("")}</div>`);
    group("text", [
        button({ cls: "letter", data: 'data-cmd="bold"', title: "Bold (⌘B)" }, "B"),
        button({ cls: "letter u", data: 'data-cmd="underline"', title: "Underline (⌘U)" }, "U"),
        button({ cls: "letter s", data: 'data-cmd="strikeThrough"', title: "Strikethrough (⇧⌘X)" }, "S"),
        '<span class="fx-divider"></span>',
        button({ data: 'data-cmd="list" data-kind="bullet"', title: "Bulleted List (⇧⌘7)" }, icons.bullets),
        button({ data: 'data-cmd="list" data-kind="numbered"', title: "Numbered List (⇧⌘9)" }, icons.numbers),
        button({ data: 'data-cmd="list" data-kind="checklist"', title: "Checklist (⇧⌘L)" }, icons.checklist),
    ].join(""));
    group("markers", `<span class="fx-marker-icon">${icons.highlighter}</span>` +
        markers.map(([key, hex], index) => button({ cls: "fx-dot", data: `data-cmd="marker" data-color="${key}" style="--dot: ${hex}"`, title: `${key[0].toUpperCase()}${key.slice(1)} Highlighter (⌥⌘${index + 1})` }, "<i></i>")).join("") +
        button({ cls: "fx-eraser", data: 'data-cmd="marker" data-color=""', title: "Remove Highlight (⌥⌘0)" }, icons.eraser));
    group("link", button({ cls: "fx-wide", data: 'data-cmd="link"', title: "Link (⌘K)" }, `${icons.link}Link`) +
        `<div class="fx-pop fx-link-pop" hidden><b>Link</b><input type="url" placeholder="https://" aria-label="Address"><div class="fx-link-actions"><button type="button" data-cmd="link-cancel">Cancel</button><button type="button" class="primary" data-cmd="link-apply">Apply</button></div></div>`);
    group("image", button({ cls: "fx-wide", data: 'data-cmd="image"', title: "Image (⇧⌘I)" }, `${icons.photo}Image`) +
        '<input type="file" accept="image/*" hidden>');

    const menuPop = groups.menu.querySelector(".fx-menu-pop");
    const linkPop = groups.link.querySelector(".fx-link-pop");
    // Okénka visí na hlavičce (na telefonu se lišta posouvá vodorovně a ořízla by je).
    headEl.append(menuPop, linkPop);
    function showPop(pop, anchor) {
        pop.hidden = false;
        const head = headEl.getBoundingClientRect(), box = anchor.getBoundingClientRect();
        pop.style.top = `${box.bottom - head.top + 6}px`;
        pop.style.left = `${Math.max(8, Math.min(box.left - head.left, head.width - pop.offsetWidth - 8))}px`;
    }
    const linkInput = linkPop.querySelector("input");
    const fileInput = groups.image.querySelector("input");

    // Šířky skupin se měří jednou (písmo se nemění); rozložení podle FormatBarLayout.make: do první řady
    // styly, písmo + seznamy a fixy, co se vejde (styly jako tlačítka jen když se vejde všechno), zbytek
    // a vždy Odkaz a Obrázek do další řady – pořadí se nikdy nemění.
    let widths = null;
    function measure() {
        const box = document.createElement("div");
        box.className = "fx-bar-row";
        box.style.cssText = "position:absolute;visibility:hidden;flex-wrap:nowrap";
        headEl.append(box);
        box.append(...Object.values(groups));
        widths = Object.fromEntries(Object.entries(groups).map(([key, element]) => [key, element.getBoundingClientRect().width]));
        box.remove();
    }
    const isPhone = () => host.clientWidth <= 640;
    function layoutBar() {
        if (!widths) measure();
        const available = headEl.clientWidth - (isPhone() ? 24 : 44), gap = 8;
        const fits = (keys) => keys.reduce((sum, key) => sum + widths[key], 0) + gap * (keys.length - 1) <= available;
        let first = ["segments", "text", "markers"], rest = [];
        if (isPhone()) {
            // Telefon: celá lišta v jedné řadě, která se posouvá do strany – na text zbude víc místa.
            first = ["menu", "text", "markers", "link", "image"];
            rest = null;
        } else if (!fits(first)) {
            first = ["menu"];
            for (const key of ["text", "markers"]) {
                if (!rest.length && fits([...first, key])) first.push(key);
                else rest.push(key);
            }
        }
        row1.replaceChildren(...first.map((key) => groups[key]));
        row2.replaceChildren(...(rest ? [...rest, "link", "image"] : []).map((key) => groups[key]));
        // Text začíná na úrovni titulku první poznámky v seznamu; níž jen když by narazil do lišty.
        const lastRow = rest ? row2 : row1;
        const barBottom = lastRow.offsetTop + lastRow.offsetHeight;
        const listTitleTop = 52 + 6 + 42 + 14 + 9 + 3;
        const capTop = isPhone() ? barBottom + 24 : Math.max(listTitleTop, barBottom + 24);
        host.style.setProperty("--fx-doc-top", `${Math.round(capTop - 6)}px`);
        host.style.setProperty("--fx-head-height", `${Math.round((barBottom + capTop) / 2)}px`);
        updateBar();
    }

    function updateBar() {
        const inText = inDoc(selection().anchorNode);
        // Mimo psaní ukazuje lišta místo, kde kurzor naposledy byl (nebo začátek poznámky).
        const resting = savedRange && inDoc(savedRange.startContainer) ? blockOf(savedRange.startContainer) : doc.firstElementChild;
        const block = inText ? currentBlock() : resting;
        const style = styleOf(block), kind = listKind(block);
        const state = (command) => { try { return inText && document.queryCommandState(command); } catch { return false; } };
        const mark = inText ? selection().anchorNode.parentElement?.closest("mark") : null;
        for (const element of host.querySelectorAll(".fx-head [data-cmd]")) {
            const command = element.dataset.cmd;
            let on = false;
            if (command === "style") on = element.dataset.style === style;
            else if (command === "bold" || command === "underline" || command === "strikeThrough") on = state(command);
            else if (command === "list") on = element.dataset.kind === kind;
            else if (command === "marker") on = !!mark && element.dataset.color === mark.dataset.c;
            else continue;
            element.classList.toggle("on", on);
        }
        for (const name of groups.menu.querySelectorAll(".fx-menu-names > span")) name.classList.toggle("current", name.dataset.style === style);
        for (const option of menuPop.querySelectorAll(".fx-option")) option.querySelector(".check").textContent = option.dataset.style === style ? "✓" : "";
    }

    function closePops() {
        menuPop.hidden = true;
        linkPop.hidden = true;
    }

    function openLink() {
        focusDoc();
        savedRange = selection().getRangeAt(0).cloneRange();
        const existing = selection().anchorNode?.parentElement?.closest("a");
        linkInput.value = existing && inDoc(existing) ? existing.getAttribute("href") : "";
        showPop(linkPop, groups.link);
        linkInput.focus();
    }
    function applyLink() {
        let url = linkInput.value.trim();
        linkPop.hidden = true;
        if (!url) return focusDoc();
        if (!/^[a-z]+:/i.test(url)) url = `https://${url}`;
        focusDoc();
        if (selection().isCollapsed) exec("insertHTML", `<a href="${esc(url)}">${esc(url)}</a>`);
        else exec("createLink", url);
        commit();
    }

    // MARK: - Obrázky (ImageAttachment, FixaTextView)
    // Každý obrázek je na vlastním řádku. Klik ho vybere (rámeček v barvě projektu a úchyt vpravo dole),
    // tažení za úchyt mění velikost v poměru stran, vybraný jde přetáhnout jinam; ⌃⌘= / ⌃⌘- / ⌃⌘0.
    // Nastavená šířka je atribut width (data-fit = výchozí šířka); užší okno obrázek zmenší na šířku textu.

    const maxImageHeight = 720, minImageWidth = 48, imageStep = 1.15;

    // Vložený obrázek se zmenší (do localStorage se toho moc nevejde); PNG a GIF zůstanou, ostatní JPEG.
    async function importImage(file) {
        const read = (blob) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        const bitmap = await createImageBitmap(file);
        let { width, height } = bitmap;
        let src;
        if (file.type === "image/gif" && file.size < 1.5e6) {
            src = await read(file);
        } else {
            const scale = Math.min(1, 1600 / Math.max(width, height));
            width = Math.round(width * scale);
            height = Math.round(height * scale);
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
            src = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.85);
        }
        bitmap.close?.();
        const fit = Math.round(width * Math.min(1, maxImageHeight / height));
        return `<figure contenteditable="false"><img src="${src}" width="${fit}" height="${Math.round(fit * height / width)}" data-fit="${fit}" alt="" draggable="false"></figure>`;
    }

    async function insertImages(files, at = null) {
        for (const file of files) {
            let html;
            try {
                html = await importImage(file);
            } catch {
                continue;
            }
            const box = document.createElement("div");
            box.innerHTML = html;
            const figure = box.firstElementChild;
            focusDoc();
            const range = at && inDoc(at.startContainer) ? at : selection().rangeCount ? selection().getRangeAt(0) : null;
            insertFigure(figure, range);
            at = null;
            // Kurzor za obrázek (na začátek dalšího řádku).
            let next = figure.nextElementSibling;
            if (!next || next.matches("figure, .fx-card")) {
                next = document.createElement("p");
                next.append(document.createElement("br"));
                figure.after(next);
            }
            const caret = document.createRange();
            caret.setStart(next.tagName === "UL" || next.tagName === "OL" ? next.firstElementChild : next, 0);
            selection().removeAllRanges();
            selection().addRange(caret);
            commit();
        }
    }

    // Obrázek na místo kurzoru: odstavec (i položka seznamu) se na tom místě rozdělí.
    function insertFigure(figure, range) {
        const unit = range ? blockOf(range.startContainer) : null;
        if (!unit || unit.matches("figure, .fx-card")) {
            const anchor = unit || doc.lastElementChild;
            if (anchor) anchor.after(figure);
            else doc.append(figure);
            return;
        }
        const head = document.createRange();
        head.setStart(unit, 0);
        head.setEnd(range.startContainer, range.startOffset);
        const tail = document.createRange();
        tail.setStart(range.startContainer, range.startOffset);
        tail.setEnd(unit, unit.childNodes.length);
        if (!head.toString().trim() && !head.cloneContents().querySelector?.("img")) {
            placeFigure(figure, unit, false);
        } else if (!tail.toString().trim()) {
            placeFigure(figure, unit, true);
        } else {
            const rest = unit.cloneNode(false);
            rest.removeAttribute("class");
            rest.append(tail.extractContents());
            unit.after(rest);
            placeFigure(figure, unit, true);
        }
    }

    // Před / za blok; u položky seznamu se seznam v tom místě rozdělí na dva.
    function placeFigure(figure, unit, after) {
        if (unit.tagName !== "LI") {
            unit[after ? "after" : "before"](figure);
            return;
        }
        const list = unit.parentNode;
        const split = after ? unit.nextElementSibling : unit;
        if (!split) return list.after(figure);
        if (split === list.firstElementChild) return list.before(figure);
        const rest = list.cloneNode(false);
        let item = split;
        while (item) {
            const next = item.nextElementSibling;
            rest.append(item);
            item = next;
        }
        list.after(figure, rest);
    }

    // Po přesunu obrázku můžou zůstat dva stejné seznamy těsně za sebou – patří k sobě.
    function mergeLists() {
        for (const list of [...doc.querySelectorAll(":scope > ul, :scope > ol")]) {
            const next = list.nextElementSibling;
            if (list.isConnected && next && next.tagName === list.tagName && next.className === list.className) {
                list.append(...next.children);
                next.remove();
            }
        }
    }

    const figureAt = (node) => (node?.nodeType === Node.ELEMENT_NODE && node.tagName === "FIGURE" && node.parentNode === doc ? node : null);
    // Vybraný obrázek = výběr je právě jeden obrázek (jako jeden znak s obrázkem ve Fixe).
    function selectedFigure() {
        if (document.activeElement !== doc || !selection().rangeCount) return null;
        const range = selection().getRangeAt(0);
        if (range.startContainer !== range.endContainer || range.endOffset - range.startOffset !== 1) return null;
        return figureAt(range.startContainer.childNodes[range.startOffset]);
    }
    function showImageSelection() {
        const selected = selectedFigure();
        for (const figure of doc.querySelectorAll("figure")) figure.classList.toggle("fx-selected", figure === selected);
    }
    function selectFigure(figure) {
        doc.focus({ preventScroll: true });
        const range = document.createRange();
        range.selectNode(figure);
        selection().removeAllRanges();
        selection().addRange(range);
        showImageSelection();
    }

    function textWidth() {
        const style = getComputedStyle(doc);
        return doc.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    }
    function setImageWidth(image, width) {
        const ratio = (image.naturalHeight / image.naturalWidth) || (image.getAttribute("height") / image.getAttribute("width"));
        const value = Math.round(Math.min(Math.max(width, minImageWidth), textWidth()));
        image.setAttribute("width", value);
        image.setAttribute("height", Math.round(value * ratio));
    }
    // ⌃⌘= / ⌃⌘- (factor), ⌃⌘0 = zpátky na výchozí šířku (nil).
    function resizeSelectedImage(factor) {
        const figure = selectedFigure();
        if (!figure) return;
        const image = figure.querySelector("img");
        if (factor) {
            setImageWidth(image, image.getBoundingClientRect().width * factor);
        } else {
            // Zpátky na výchozí velikost – užší okno ji zmenší na šířku textu, širší zase vrátí.
            const fit = Number(image.dataset.fit) || image.naturalWidth;
            const ratio = (image.naturalHeight / image.naturalWidth) || (image.getAttribute("height") / image.getAttribute("width"));
            image.setAttribute("width", fit);
            image.setAttribute("height", Math.round(fit * ratio));
        }
        commit();
        selectFigure(figure);
    }

    // Tažení za úchyt: velikost se mění průběžně a uloží se po puštění.
    function trackResize(figure, start) {
        const image = figure.querySelector("img");
        const startWidth = image.getBoundingClientRect().width;
        const move = (event) => setImageWidth(image, startWidth + event.clientX - start.clientX);
        const up = () => {
            removeEventListener("pointermove", move);
            commit();
            selectFigure(figure);
        };
        addEventListener("pointermove", move);
        addEventListener("pointerup", up, { once: true });
    }

    // Přetažení vybraného obrázku jinam: čára ukazuje, kam se vloží (mezi řádky, i mezi položky seznamu).
    const dropLine = document.createElement("div");
    dropLine.className = "fx-drop-line";
    function dropTarget(y, figure) {
        const units = [];
        for (const block of doc.children) {
            if (block === figure) continue;
            if (block.tagName === "UL" || block.tagName === "OL") units.push(...block.children);
            else units.push(block);
        }
        for (const unit of units) {
            const box = unit.getBoundingClientRect();
            if (y < box.top + box.height / 2) return { unit, after: false, y: box.top - 2 };
        }
        const last = units[units.length - 1];
        return last ? { unit: last, after: true, y: last.getBoundingClientRect().bottom + 2 } : null;
    }
    function trackMove(figure, start) {
        let target = null, moving = false;
        const move = (event) => {
            if (!moving && Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) < 4) return;
            if (!moving) {
                moving = true;
                figure.classList.add("fx-moving");
                scrollEl.append(dropLine);
            }
            target = dropTarget(event.clientY, figure);
            if (!target) return;
            const box = scrollEl.getBoundingClientRect(), text = doc.getBoundingClientRect();
            const padding = parseFloat(getComputedStyle(doc).paddingLeft);
            dropLine.style.top = `${target.y - box.top + scrollEl.scrollTop - 3.5}px`;
            dropLine.style.left = `${text.left - box.left + padding - 3.5}px`;
            dropLine.style.width = `${textWidth() + 3.5}px`;
        };
        const up = () => {
            removeEventListener("pointermove", move);
            figure.classList.remove("fx-moving");
            dropLine.remove();
            if (moving && target) {
                placeFigure(figure, target.unit, target.after);
                mergeLists();
                commit();
            }
            selectFigure(figure);
        };
        addEventListener("pointermove", move);
        addEventListener("pointerup", up, { once: true });
    }

    scrollEl.addEventListener("pointerdown", (event) => {
        const figure = event.target.closest?.("figure");
        if (!figure || !inDoc(figure) || event.button !== 0) return;
        event.preventDefault();
        if (selectedFigure() !== figure) return selectFigure(figure);
        const box = figure.querySelector("img").getBoundingClientRect();
        if (Math.hypot(event.clientX - box.right, event.clientY - box.bottom) < 14) trackResize(figure, event);
        else trackMove(figure, event);
    });
    scrollEl.addEventListener("pointermove", (event) => {
        const figure = event.target.closest?.("figure.fx-selected");
        if (!figure) return;
        const box = figure.querySelector("img").getBoundingClientRect();
        figure.classList.toggle("fx-on-handle", Math.hypot(event.clientX - box.right, event.clientY - box.bottom) < 14);
    });

    headEl.addEventListener("mousedown", (event) => {
        // Kurzor zůstává v textu (jako ve Fixe); jen pole pro odkaz potřebuje fokus.
        if (!event.target.closest("input")) event.preventDefault();
    });
    headEl.addEventListener("click", (event) => {
        const target = event.target.closest("[data-cmd]");
        if (!target) return;
        const command = target.dataset.cmd;
        if (command !== "menu") menuPop.hidden = true;
        switch (command) {
            case "menu": linkPop.hidden = true; if (menuPop.hidden) showPop(menuPop, groups.menu); else menuPop.hidden = true; break;
            case "style": setStyle(target.dataset.style); break;
            case "bold": case "underline": case "strikeThrough": exec(command); break;
            case "list": toggleList(target.dataset.kind); break;
            case "marker": markerAction(target.dataset.color || null); break;
            case "link": linkPop.hidden ? openLink() : closePops(); break;
            case "link-apply": applyLink(); break;
            case "link-cancel": linkPop.hidden = true; focusDoc(); break;
            case "image": fileInput.click(); break;
        }
        updateBar();
    });
    linkInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); applyLink(); }
        if (event.key === "Escape") { event.preventDefault(); linkPop.hidden = true; focusDoc(); }
    });
    fileInput.addEventListener("change", () => {
        insertImages([...fileInput.files]);
        fileInput.value = "";
    });
    document.addEventListener("mousedown", (event) => {
        if (!event.target.closest?.(".fx-pop, [data-cmd=menu], [data-cmd=link]")) closePops();
    });

    // MARK: - Psaní

    document.execCommand("defaultParagraphSeparator", false, "p");
    document.execCommand("styleWithCSS", false, false);

    document.addEventListener("selectionchange", () => {
        showImageSelection();
        if (!inDoc(selection().anchorNode) && selection().anchorNode !== doc) return;
        savedRange = selection().getRangeAt(0).cloneRange();
        updateBar();
    });
    scrollEl.addEventListener("focusout", () => showImageSelection());

    scrollEl.addEventListener("input", (event) => {
        // Nová položka checklistu po Enteru je vždy nehotová.
        if (event.inputType === "insertParagraph") {
            const block = currentBlock();
            if (listKind(block) === "checklist") block.classList.remove("done");
        }
        commit();
    });

    const shortcut = (event) => (event.metaKey || event.ctrlKey);
    scrollEl.addEventListener("keydown", (event) => {
        const { code } = event;
        if (event.key === "Escape") {
            event.preventDefault();
            doc.blur();
            listEl.focus({ preventScroll: true });
            return;
        }
        // Seznam z „- “, „* “, „1. “ a „[] “ na začátku řádku.
        if (event.key === " " && !shortcut(event) && !event.altKey && selection().isCollapsed) {
            const block = currentBlock();
            if (block && block.tagName !== "LI") {
                const before = document.createRange();
                before.setStart(block, 0);
                before.setEnd(selection().anchorNode, selection().anchorOffset);
                const kind = { "-": "bullet", "*": "bullet", "1.": "numbered", "[]": "checklist" }[before.toString()];
                if (kind) {
                    event.preventDefault();
                    selection().removeAllRanges();
                    selection().addRange(before);
                    document.execCommand("delete");
                    toggleList(kind);
                }
            }
            return;
        }
        if (!shortcut(event)) return;
        let handled = true;
        if (event.ctrlKey && event.metaKey && code === "Equal") resizeSelectedImage(imageStep);
        else if (event.ctrlKey && event.metaKey && code === "Minus") resizeSelectedImage(1 / imageStep);
        else if (event.ctrlKey && event.metaKey && code === "Digit0") resizeSelectedImage(null);
        else if (event.shiftKey && code === "KeyX") exec("strikeThrough");
        else if (event.shiftKey && code === "Digit7") toggleList("bullet");
        else if (event.shiftKey && code === "Digit9") toggleList("numbered");
        else if (event.shiftKey && code === "KeyL") toggleList("checklist");
        else if (event.shiftKey && code === "KeyU") toggleChecked();
        else if (event.shiftKey && code === "KeyM") markerAction(lastMarker);
        else if (event.shiftKey && code === "KeyI") fileInput.click();
        else if (event.shiftKey && code === "KeyH") setStyle("heading");
        else if (event.shiftKey && code === "KeyJ") setStyle("subheading");
        else if (event.shiftKey && code === "KeyB") setStyle("body");
        else if (event.altKey && /^Digit[1-5]$/.test(code)) markerAction(markers[Number(code.slice(5)) - 1][0]);
        else if (event.altKey && code === "Digit0") markerAction(null);
        else if (!event.shiftKey && !event.altKey && code === "KeyK") openLink();
        else if (!event.shiftKey && !event.altKey && code === "KeyI") { /* kurzíva ve Fixe není */ }
        else handled = false;
        if (handled) {
            event.preventDefault();
            updateBar();
        }
    });

    // Klik na kolečko checklistu položku odškrtne – kurzor ani fokus se nehnou.
    scrollEl.addEventListener("mousedown", (event) => {
        if (event.target.closest?.("figure")) return event.preventDefault();
        const li = event.target.closest?.(".fx-check > li");
        if (!li || !inDoc(li)) return;
        if (event.clientX >= li.getBoundingClientRect().left) return;
        event.preventDefault();
        li.classList.toggle("done");
        commit();
    });

    scrollEl.addEventListener("click", (event) => {
        const linkCard = event.target.closest?.(".fx-card");
        if (linkCard && inDoc(linkCard)) window.open(linkCard.dataset.url, "_blank", "noopener");
    });

    // Vložený text jen jako text (cizí styly by do poznámky nepatřily), obrázky jako obrázky.
    scrollEl.addEventListener("paste", (event) => {
        const files = [...(event.clipboardData?.files || [])].filter((file) => file.type.startsWith("image/"));
        event.preventDefault();
        if (files.length) insertImages(files);
        else exec("insertText", event.clipboardData.getData("text/plain"));
    });
    const imageFiles = (event) => [...(event.dataTransfer?.files || [])].filter((file) => file.type.startsWith("image/"));
    scrollEl.addEventListener("dragover", (event) => {
        if ([...(event.dataTransfer?.types || [])].includes("Files")) event.preventDefault();
    });
    scrollEl.addEventListener("drop", (event) => {
        const files = imageFiles(event);
        if (!files.length) return;
        event.preventDefault();
        const point = document.caretRangeFromPoint?.(event.clientX, event.clientY) ||
            (() => { const position = document.caretPositionFromPoint?.(event.clientX, event.clientY); if (!position) return null; const range = document.createRange(); range.setStart(position.offsetNode, position.offset); return range; })();
        insertImages(files, point);
    });

    // MARK: - Projekty a seznam

    let toastTimer = 0;
    function toast(text, withDownload = true) {
        const download = document.querySelector(".actions .button")?.href || "#install";
        toastEl.innerHTML = withDownload ? `${text} <a href="${download}">Download Fixa</a>` : text;
        toastEl.classList.add("shown");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("shown"), 3600);
    }

    host.addEventListener("click", (event) => {
        if (suppressTileClick) return;
        const tile = event.target.closest(".fx-tile");
        if (tile) return selectProject(projects.find((project) => project.id === tile.dataset.project));
        const row = event.target.closest(".fx-row");
        if (row) {
            const note = current.notes.find((candidate) => candidate.id === row.dataset.note);
            if (note && note !== openNote) showNote(note);
            listEl.focus({ preventScroll: true });
            return;
        }
        const action = event.target.closest("[data-act]")?.dataset.act;
        if (action === "sidebar") toggleSidebar();
        else if (action === "new") newNote();
        else if (action === "new-project") toast("New projects are made in the app.");
        else if (action === "help") toast("All keyboard shortcuts are in the app (⌘/).");
        else if (action === "settings") toast("Settings are in the app (⌘,).");
    });

    // MARK: - Pořadí projektů (ProjectGrid)
    // Dlaždici jde chytit a přetáhnout (myší po posunu o 4 px, prstem po podržení): na svém místě zůstane
    // ztlumená, u myši jde její kopie a čára v akcentu ukazuje mezeru, kam se vloží (podle středů dlaždic);
    // kde by se nic nezměnilo, čára není. Z klávesnice ⌥⌘↑ / ⌥⌘↓. Na telefonu jsou dlaždice v řadě.

    const tileGap = 8;
    let tilePress = null, tileDrag = null, suppressTileClick = false;

    function moveProject(project, to) {
        const from = projects.indexOf(project);
        if (from < 0 || to < 0 || to >= projects.length || to === from) return;
        const before = new Map([...tilesEl.querySelectorAll(".fx-tile")].map((tile) => [tile.dataset.project, tile.getBoundingClientRect()]));
        projects.splice(from, 1);
        projects.splice(to, 0, project);
        renderTiles();
        if (!reducedMotion.matches) {
            for (const tile of tilesEl.querySelectorAll(".fx-tile")) {
                const old = before.get(tile.dataset.project), now = tile.getBoundingClientRect();
                if (!old || (old.left === now.left && old.top === now.top)) continue;
                tile.animate([{ transform: `translate(${old.left - now.left}px, ${old.top - now.top}px)` }, { transform: "none" }],
                    { duration: 300, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
            }
        }
        scheduleSave();
    }

    const tileList = () => [...tilesEl.querySelectorAll(".fx-tile:not(.fx-tile-ghost)")];
    function tileAxis(tile, row) {
        return row ? { start: tile.offsetLeft, size: tile.offsetWidth } : { start: tile.offsetTop, size: tile.offsetHeight };
    }
    function pointerAlong(event, row) {
        const box = tilesEl.getBoundingClientRect();
        return row ? event.clientX - box.left + tilesEl.scrollLeft : event.clientY - box.top + tilesEl.scrollTop;
    }

    tilesEl.addEventListener("pointerdown", (event) => {
        const tile = event.target.closest(".fx-tile");
        if (!tile || event.button !== 0) return;
        const row = getComputedStyle(tilesEl).flexDirection === "row";
        tilePress = {
            tile, row, start: event, last: event, touch: event.pointerType === "touch",
            grab: pointerAlong(event, row) - tileAxis(tile, row).start,
        };
        // Prstem až po podržení – jinak by se nedalo posouvat pruh dlaždic.
        if (tilePress.touch) tilePress.timer = setTimeout(() => { if (tilePress) beginTileDrag(); }, 350);
    });
    addEventListener("pointermove", (event) => {
        if (!tilePress) return;
        tilePress.last = event;
        if (!tileDrag) {
            const moved = Math.hypot(event.clientX - tilePress.start.clientX, event.clientY - tilePress.start.clientY);
            if (tilePress.touch) {
                if (moved > 8) cancelTilePress();
                return;
            }
            if (moved < 4) return;
            beginTileDrag();
        }
        updateTileDrag();
    });
    addEventListener("pointerup", () => finishTileDrag(true));
    addEventListener("pointercancel", () => finishTileDrag(false));
    tilesEl.addEventListener("touchmove", (event) => { if (tileDrag) event.preventDefault(); }, { passive: false });
    tilesEl.addEventListener("contextmenu", (event) => { if (tilePress?.touch) event.preventDefault(); });

    function cancelTilePress() {
        clearTimeout(tilePress?.timer);
        tilePress = null;
    }

    function beginTileDrag() {
        const { tile, row } = tilePress;
        const ghost = tile.cloneNode(true);
        ghost.classList.add("fx-tile-ghost");
        ghost.removeAttribute("data-project");
        ghost.setAttribute("aria-hidden", "true");
        ghost.style.width = `${tile.offsetWidth}px`;
        ghost.style.height = `${tile.offsetHeight}px`;
        const line = document.createElement("div");
        line.className = `fx-tile-drop${row ? " row" : ""}`;
        line.hidden = true;
        tilesEl.append(ghost, line);
        tile.classList.add("fx-lifted");
        tileDrag = { ghost, line, slot: null };
        suppressTileClick = true;
        updateTileDrag();
    }

    function updateTileDrag() {
        const { tile, row, grab, last } = tilePress;
        const { ghost, line } = tileDrag;
        const tiles = tileList(), frames = tiles.map((element) => tileAxis(element, row));
        const own = tileAxis(tile, row), first = frames[0], end = frames[frames.length - 1];
        const position = pointerAlong(last, row);
        // Kopie dlaždice jde s myší, ale nevyjede za první a poslední dlaždici víc než o půlku.
        const lead = Math.min(Math.max(position - grab, first.start - own.size / 2), end.start + end.size - own.size / 2);
        ghost.style.transform = row ? `translate(${lead}px, ${tile.offsetTop}px)` : `translate(${tile.offsetLeft}px, ${lead}px)`;
        const from = tiles.indexOf(tile);
        let slot = frames.filter((frame) => frame.start + frame.size / 2 < position).length;
        if (slot === from || slot === from + 1) slot = null;
        tileDrag.slot = slot;
        line.hidden = slot === null;
        if (slot === null) return;
        const at = slot < frames.length ? frames[slot].start - tileGap / 2 : end.start + end.size + tileGap / 2;
        if (row) {
            line.style.height = `${tile.offsetHeight}px`;
            line.style.transform = `translate(${at - 3.5}px, ${tile.offsetTop}px)`;
        } else {
            line.style.width = `${tile.offsetWidth}px`;
            line.style.transform = `translate(${tile.offsetLeft}px, ${at - 3.5}px)`;
        }
    }

    function finishTileDrag(drop) {
        if (!tilePress) return;
        const { tile } = tilePress;
        const project = projects.find((candidate) => candidate.id === tile.dataset.project);
        const slot = tileDrag?.slot ?? null;
        if (tileDrag) {
            tileDrag.ghost.remove();
            tileDrag.line.remove();
            tile.classList.remove("fx-lifted");
            // Klik, který po puštění přijde, projekt nevybírá.
            setTimeout(() => { suppressTileClick = false; });
        }
        tileDrag = null;
        cancelTilePress();
        if (drop && slot !== null && project) {
            const from = projects.indexOf(project);
            moveProject(project, slot > from ? slot - 1 : slot);
        }
    }

    // MARK: - Šířky sloupců (WindowLayout, ColumnWidthKeeper)
    // Hranici mezi projekty a poznámkami i mezi poznámkami a editorem jde táhnout: projekty 210–360 px,
    // poznámky 220–420 px, editor aspoň 280 px; okno svou šířku nemění. Šířky se pamatují (localStorage).

    const sideRange = [210, 360], listRange = [220, 420], editorMin = 280;
    const columnWidths = { side: null, list: null };
    const sideColumn = $(".fx-side"), listColumn = $(".fx-list");
    const columnVar = { side: "--fx-side-w", list: "--fx-list-w" };

    // Nastavené šířky do CSS (null = výchozí podle šířky okna).
    function restoreColumns() {
        for (const key of ["side", "list"]) {
            if (columnWidths[key] === null) host.style.removeProperty(columnVar[key]);
            else host.style.setProperty(columnVar[key], `${columnWidths[key]}px`);
        }
    }
    function setColumn(key, value) {
        columnWidths[key] = Math.round(value);
        host.style.setProperty(columnVar[key], `${columnWidths[key]}px`);
    }
    // Užší stránka: editor si drží aspoň 280 px – nejdřív ustoupí seznam poznámek, pak projekty.
    function fitColumns() {
        if (host.clientWidth <= 640) return;
        let missing = editorMin - editorEl.getBoundingClientRect().width;
        if (missing <= 0.5) return;
        if (columnWidths.list !== null) {
            const value = Math.max(listRange[0], columnWidths.list - missing);
            missing -= columnWidths.list - value;
            setColumn("list", value);
        }
        if (missing > 0.5 && columnWidths.side !== null && host.clientWidth > 900 && !host.classList.contains("no-side")) {
            setColumn("side", Math.max(sideRange[0], columnWidths.side - missing));
        }
    }

    // Táhne se jen jeden sloupec, druhý se nehne; editor zůstane aspoň 280 px široký.
    for (const handle of host.querySelectorAll(".fx-resize")) {
        handle.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            const key = handle.dataset.column;
            const column = key === "side" ? sideColumn : listColumn;
            const other = key === "side" ? listColumn.getBoundingClientRect().width
                : host.classList.contains("no-side") ? 0 : sideColumn.getBoundingClientRect().width;
            const [low, high] = key === "side" ? sideRange : listRange;
            const max = Math.max(low, Math.min(high, host.clientWidth - other - editorMin));
            const startWidth = column.getBoundingClientRect().width, startX = event.clientX;
            host.classList.add("fx-resizing");
            const move = (moveEvent) => setColumn(key, Math.min(Math.max(startWidth + moveEvent.clientX - startX, low), max));
            const up = () => {
                removeEventListener("pointermove", move);
                removeEventListener("pointerup", up);
                removeEventListener("pointercancel", up);
                host.classList.remove("fx-resizing");
                scheduleSave();
            };
            addEventListener("pointermove", move);
            addEventListener("pointerup", up);
            addEventListener("pointercancel", up);
        });
    }

    function toggleSidebar() {
        host.classList.toggle("no-side");
        scheduleSave();
    }

    // MARK: - Klávesy okna (ContentView.handleKey, FixaCommands)
    // Platí, když se naposledy klikalo do okna (nebo je v něm fokus): ⌘S panel projektů, ⌘D / ⇧⌘D další
    // a předchozí projekt; mimo psaní ↑ ↓ procházejí poznámky, ⌘↑ ⌘↓ první a poslední, ↩ = psát.
    let engaged = false;
    document.addEventListener("pointerdown", (event) => { engaged = host.contains(event.target); }, true);
    document.addEventListener("focusin", (event) => { engaged = host.contains(event.target); });
    document.addEventListener("keydown", (event) => {
        if (!engaged || event.defaultPrevented) return;
        const typing = event.target.closest?.("input") || document.activeElement === doc;
        const command = event.metaKey || event.ctrlKey;
        let handled = true;
        if (command && !event.altKey && !event.shiftKey && event.code === "KeyS") toggleSidebar();
        else if (command && event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
            moveProject(current, projects.indexOf(current) + (event.key === "ArrowUp" ? -1 : 1));
        }
        else if (command && !event.altKey && event.code === "KeyD") {
            const step = event.shiftKey ? projects.length - 1 : 1;
            selectProject(projects[(projects.indexOf(current) + step) % projects.length]);
        } else if (!typing && !event.altKey && !event.shiftKey && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            const notes = [...listEl.querySelectorAll(".fx-row")].map((row) => current.notes.find((note) => note.id === row.dataset.note));
            const index = notes.indexOf(openNote), down = event.key === "ArrowDown";
            const target = command ? notes[down ? notes.length - 1 : 0] : notes[Math.min(Math.max(index + (down ? 1 : -1), 0), notes.length - 1)];
            if (target && target !== openNote) showNote(target);
            listEl.focus({ preventScroll: true });
        } else if (!typing && !command && event.key === "Enter" && openNote && !event.target.closest?.("button, a")) {
            placeCaretAtEnd();
        } else {
            handled = false;
        }
        if (handled) event.preventDefault();
    });

    // MARK: - Samo přepíná projekty, když s oknem nikdo nepracuje

    const firstSwitch = 5000, cycle = 6000, afterUse = 12000, afterTyping = 30000;
    let lastUse = 0, lastSwitch = Date.now() - cycle + firstSwitch, visible = false;
    const used = () => { lastUse = Date.now(); };
    for (const type of ["pointerdown", "keydown", "focusin", "pointermove"]) host.addEventListener(type, used, { passive: true });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.35 }).observe(host);
    setInterval(() => {
        const now = Date.now();
        const typing = document.activeElement === doc;
        const quiet = now - lastUse > (typing ? afterTyping : afterUse);
        const popOpen = !menuPop.hidden || !linkPop.hidden;
        const dragging = tilePress || host.classList.contains("fx-resizing");
        if (!visible || document.hidden || !quiet || popOpen || dragging || now - lastSwitch < cycle) return;
        lastSwitch = now;
        selectProject(projects[(projects.indexOf(current) + 1) % projects.length], { auto: true });
    }, 500);

    // MARK: - Start

    applyStore(readStore());
    prepare();
    document.getElementById("fixa-demo-reset")?.addEventListener("click", resetDemo);
    darkMode.addEventListener?.("change", applyTheme);
    renderTiles();
    // První barvy bez přechodu (jinak by okno při načtení přecházelo z výchozích barev).
    host.classList.add("fx-static");
    applyTheme();
    requestAnimationFrame(() => requestAnimationFrame(() => host.classList.remove("fx-static")));
    showNote(current.notes.find((note) => note.id === current.last));
    layoutBar();
    new ResizeObserver(() => layoutBar()).observe(editorEl);
    restoreColumns();
    new ResizeObserver(() => fitColumns()).observe(host);
    document.fonts?.ready.then(() => { widths = null; layoutBar(); });
})();
