const DATA = [
  {
    name: "Kitchen and Dining",
    items: [
      { label: "Dishes", tag: "bring" },
      { label: "Plates", tag: "bring", sub: true },
      { label: "Bowls", tag: "bring", sub: true },
      { label: "Cups / Mugs", tag: "bring" },
      { label: "Silverware", tag: "bring" },
      { label: "Cooking utensils", tag: "bring" },
      { label: "Pots / Pans", tag: "bring" },
      { label: "Tupperware", tag: "bring" },
      { label: "Paper towel", tag: "both" },
      { label: "Knife", tag: "buy" },
      { label: "Cutting board", tag: "buy" },
      { label: "Cooler", tag: "bring" },
      { label: "Rug", tag: "bring" },
      { label: "Curtain", tag: "" },
      { label: "Table", tag: "bring" },
      { label: "Chair", tag: "" },
      { label: "Sampayan", tag: "" },
      { label: "Bin", tag: "buy" },
    ],
  },
  {
    name: "Bedroom",
    items: [
      { label: "Sheets", tag: "bring" },
      { label: "Pillow cases", tag: "bring" },
      { label: "Pillows", tag: "bring" },
      { label: "Blanket", tag: "bring" },
      { label: "Hangers", tag: "bring" },
      { label: "Bins", tag: "bring" },
      { label: "Basket", tag: "bring" },
      { label: "Rug", tag: "bring" },
    ],
  },
  {
    name: "Bathroom",
    items: [
      { label: "Towels", tag: "bring" },
      { label: "Face towels", tag: "bring" },
      { label: "Rug", tag: "bring" },
      { label: "Curtain / curtain rod", tag: "buy" },
      { label: "Bin", tag: "buy" },
      { label: "Panligo", tag: "bring" },
      { label: "Toilet paper", tag: "bring" },
      { label: "Plunger", tag: "buy" },
      { label: "Brush", tag: "buy" },
      { label: "Hand soap", tag: "buy" },
      { label: "Cotton buds", tag: "buy" },
      { label: "Tutpis / tutbras", tag: "bring" },
    ],
  },
  {
    name: "Cleaning",
    items: [
      { label: "Rug", tag: "bring" },
      { label: "Trash bag", tag: "both" },
      { label: "Med kit", tag: "" },
    ],
  },
];

const TAG_LABEL = { bring: "Bring", buy: "Buy", both: "Bring & Buy" };
const STORAGE_KEY = "apartment-checklist-state";

let state = {};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveState() {
  const btn = document.getElementById("save-btn");
  const status = document.getElementById("save-status");
  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    status.textContent = "Saved ✓";
  } catch (e) {
    status.textContent = "Could not save — try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Save progress";
    setTimeout(() => {
      status.textContent = "";
    }, 2500);
  }
}

function itemId(sectionIdx, itemIdx) {
  return `s${sectionIdx}-i${itemIdx}`;
}

function render() {
  const container = document.getElementById("sections");
  container.innerHTML = "";

  let totalAll = 0,
    checkedAll = 0;

  DATA.forEach((section, sIdx) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "section";

    const total = section.items.length;
    const checked = section.items.filter(
      (_, iIdx) => state[itemId(sIdx, iIdx)],
    ).length;
    totalAll += total;
    checkedAll += checked;

    const header = document.createElement("div");
    header.className = "section-header";

    const headerLeft = document.createElement("div");
    headerLeft.className = "section-header-left";

    const allCb = document.createElement("input");
    allCb.type = "checkbox";
    allCb.checked = checked === total;
    allCb.indeterminate = checked > 0 && checked < total;
    allCb.title = "Check/uncheck all in this category";
    allCb.addEventListener("click", (e) => e.stopPropagation());
    allCb.addEventListener("change", () => {
      const makeChecked = allCb.checked;
      section.items.forEach((_, iIdx) => {
        state[itemId(sIdx, iIdx)] = makeChecked;
      });
      render();
    });

    const titleWrap = document.createElement("h2");
    titleWrap.innerHTML = `<span class="chevron">▾</span>${section.name}`;
    titleWrap.addEventListener("click", () => {
      sectionEl.classList.toggle("collapsed");
    });

    headerLeft.appendChild(allCb);
    headerLeft.appendChild(titleWrap);

    const countEl = document.createElement("span");
    countEl.className = "section-count";
    countEl.textContent = `${checked} / ${total}`;

    header.appendChild(headerLeft);
    header.appendChild(countEl);

    const itemsEl = document.createElement("div");
    itemsEl.className = "items";

    section.items.forEach((item, iIdx) => {
      const id = itemId(sIdx, iIdx);
      const isChecked = !!state[id];

      const row = document.createElement("div");
      row.className =
        "item" + (item.sub ? " sub" : "") + (isChecked ? " checked" : "");

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = isChecked;
      cb.id = id;
      cb.addEventListener("change", () => {
        state[id] = cb.checked;
        render();
      });

      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = item.label;

      row.appendChild(cb);
      row.appendChild(label);

      if (item.tag) {
        const tag = document.createElement("span");
        tag.className = "tag " + item.tag;
        tag.textContent = TAG_LABEL[item.tag];
        row.appendChild(tag);
      }

      itemsEl.appendChild(row);
    });

    sectionEl.appendChild(header);
    sectionEl.appendChild(itemsEl);
    container.appendChild(sectionEl);
  });

  document.getElementById("overall-num").textContent =
    `${checkedAll} / ${totalAll}`;
  const pct = totalAll ? Math.round((checkedAll / totalAll) * 100) : 0;
  document.getElementById("overall-bar").style.width = pct + "%";
}

document.getElementById("reset-btn").addEventListener("click", () => {
  state = {};
  render();
  saveState();
});

document.getElementById("save-btn").addEventListener("click", saveState);

state = loadState();
render();
