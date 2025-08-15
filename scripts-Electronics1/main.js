// Imports
import { loadAllFlashcardData } from './dataLoader.js';
import { checkVersion } from './app.js';
//import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';


// IndexedDB setup

// Cache all files
//window.cacheAllFiles = async function () {
 // const res = await fetch('../assets-manifest.json');
 // const files = await res.json();

  //for (const file of files) {
  //  try {
   //   const response = await fetch(file);
    //  const blob = await response.blob();
    //  await db.put('assets', blob, file);
    //} catch (err) {
     // console.warn('Failed to cache:', file, err);
    //}
  //}

 // console.log("✅ All materials cached for offline use.");
//};

// Service worker registration
//if ('serviceWorker' in navigator) {
 // navigator.serviceWorker.register('./sw.js');
//}

// Service worker events
//navigator.serviceWorker.addEventListener('controllerchange', () => {
  //console.log('Service worker now controlling the page');
 // location.reload();
//});

//navigator.serviceWorker.addEventListener('message', event => {
 // if (event.data?.type === 'download-progress') {
  //  const { downloaded, total } = event.data;
  //  const percent = Math.round((downloaded / total) * 100);
   // const bar = document.getElementById('progress-bar');
    //if (bar) {
   //   bar.style.width = percent + '%';
    //  bar.textContent = `Downloading: ${percent}%`;
    //}

   // if (percent === 100) {
   //   showToast('✅ All files downloaded. Ready for offline use!');
   // }
 // }
//});

// Install prompt
//

// Flashcard logic

document.querySelectorAll("img, object").forEach(el => {
  if (!el.src || el.src.includes("undefined")) {
    console.warn("❌ Broken visual element:", el);
  }
});

let renderTimeout;
function safeRenderFlashcards() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    renderFlashcards();
  }, 100);
}


document.addEventListener("DOMContentLoaded", () => {
  loadAllFlashcardData()
    .then(renderFlashcards)
    .catch(err => console.error("Flashcard load error:", err));
});


async function loadTopic(topic) {
  const res = await fetch(`data-Electronics1/${topic}.json`);
  const cards = await res.json();
  renderFlashcards(cards);
}

const topicCards = document.querySelectorAll(".topic-card");
const flashcardViewer = document.querySelector(".flashcard-viewer");
const flashcard = document.querySelector(".flashcard");
const front = document.querySelector(".front");
const back = document.querySelector(".back");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const progressInfo = document.getElementById("progress-info");

let currentCards = [];
let currentIndex = 0;

topicCards.forEach(card => {
  card.onclick = async () => {
    const topic = card.dataset.topic;
    console.log(`🔍 Loading topic: ${topic}`);
    try {
      const res = await fetch(`data-Electronics1/${topic}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      currentCards = await res.json();
      console.log(`✅ Loaded ${currentCards.length} cards`);
      currentIndex = 0;
      showCard();
      flashcardViewer.classList.remove("hidden");
      progressInfo.textContent = `Studying: ${topic} (${currentCards.length} cards)`;
    } catch (err) {
      console.error(`❌ Failed to load topic ${topic}:`, err);
      progressInfo.textContent = `❌ Could not load ${topic}`;
    }
  };
});



flashcard.onclick = () => {
  flashcard.classList.toggle("flipped");
};

prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + currentCards.length) % currentCards.length;
  showCard("left");
};

nextBtn.onclick = () => {
  currentIndex = (currentIndex + 1) % currentCards.length;
  showCard("right");
};

function showCard(direction = "right") {
  const card = currentCards[currentIndex];
  if (!card || !card.question || !card.answer) {
    console.warn("⚠️ Invalid card:", card);
    front.textContent = "No question";
    back.textContent = "No answer";
    front.style.minHeight = "120px";
    back.style.minHeight = "120px";
    return;
  }


  front.textContent = card.question;
  back.textContent = card.answer;
  flashcard.classList.remove("flipped");

  flashcard.classList.remove("slide-left", "slide-right");
  void flashcard.offsetWidth;
  flashcard.classList.add(direction === "left" ? "slide-left" : "slide-right");
}


function renderFlashcards(data) {
  console.log("🔍 renderFlashcards received:", data);
  const container = document.querySelector(".card-grid");
  if (!container) return;

  container.innerHTML = "";
  Object.entries(data).forEach(([topic, cards]) => {
    console.log(`📚 Rendering ${cards.length} cards for ${topic}`);
    const section = document.createElement("section");
    section.className = "topic-section";
    section.innerHTML = `<h2>${topic}</h2>`;
    cards.forEach(card => {
      const div = document.createElement("div");
      div.className = "card-preview";
      div.innerHTML = `
        <div class="question">${card.question}</div>
        <div class="answer">${card.answer}</div>
      `;
      section.appendChild(div);
    });
    container.appendChild(section);
  });
}

