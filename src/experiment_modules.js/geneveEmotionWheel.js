import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

/**
 * Adds an emotion wheel with pressable buttons and a popup modal for intensity.
 *
 * @param {Array} timeline - The jsPsych timeline array.
 * @param {object} jsPsych - The jsPsych instance.
 */
export default function geneveEmotionWheel(timeline, jsPsych) {
  let emotionData = [];

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <style>
        .wheel-container {
          position: relative;
          width: 800px;
          height: 800px;
          margin: 0 auto;
          border-radius: 50%;
        }
        .button{
          width: 150px;
          height: 40px;
          text-align: center;
          line-height: 40px;
          border-radius: 8px;
          background: #eee;
          transition: 0.2s;
          transform: translate(-50%, -50%);
          cursor: pointer;
        }
        .button.disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .button.selected {
          background: #bbb;
        }
        .emotion-button {
          position: absolute;
        }
        .button:hover:not(.disabled) {
          background: #ddd;
          z-index: 10;
        }
        .center-buttons {
          position: absolute;
          top: 45%;
          left: 50%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .other-entry {
          transform: translate(-50%, -50%);
        }

        /* ===== MODAL ===== */
        .rating-modal {
          display: none;
          position: fixed;
          z-index: 9999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
        }
        .rating-modal-content {
          background: white;
          width: 300px;
          margin: 120px auto;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        .rating-btn {
          margin: 5px;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid #aaa;
          background: #eee;
          transition: 0.2s;
        }
        .rating-btn:hover {
          background: #ddd;
        }
      </style>

      <div class="wheel-container" id="wheel">
        <div class="center-buttons">
          <div id="emotion-button-none" class="button">Neviena</div>
          <div id="emotion-button-other" class="button">Cita</div>
        </div>
      </div>

      <!-- Popup Rating Modal -->
      <div id="rating-modal" class="rating-modal">
        <div class="rating-modal-content">
          <p id="modal-label">Novērtē:</p>
          <div>
            <button data-rating="1" class="rating-btn">1</button>
            <button data-rating="2" class="rating-btn">2</button>
            <button data-rating="3" class="rating-btn">3</button>
            <button data-rating="4" class="rating-btn">4</button>
            <button data-rating="5" class="rating-btn">5</button>
          </div>
        </div>
      </div>

      <p style="margin-top:20px; text-align:center;">
        <i>Izvēlies emocijas, un  norādi to intensitāti. Spied "Atsarpe" kad esi pabeidzis!</i>
      </p>
    `,
    on_load: () => {
      // Organize emotions into 4 quadrants (5 emotions each)
      const emotionQuadrants = [
        ["Apmierinājums", "Mīlestība", "Apbrīna", "Atvieglojums", "Līdzjūtība"],
        ["Skumjas", "Vaina", "Nožēla", "Kauns", "Vilšanās"],
        ["Bailes", "Riebums", "Nicinājums", "Naids", "Dusmas"],
        ["Interese", "Uzjautrinājums", "Lepnums", "Prieks", "Bauda"]
      ];

      const wheel = document.getElementById("wheel");
      let radius = 280;
      const centerX = 400;
      const centerY = 400;

      let currentSelectedEmotion = null;
      let currentSelectedButton = null;

      const FIXED_OFFSET_Y = 70;

      // ----- Generate Buttons -----
      emotionQuadrants.forEach((quadrant, qi) => {
        quadrant.forEach((emotion, ei) => {
          const quadrantStart = qi * (Math.PI / 2);
          const span = Math.PI / 2;
          const padding = 0.2;

          const usable = span * (1 - 2 * padding);
          const angleWithin = padding * span + (ei / (quadrant.length - 1)) * usable;
          const angle = quadrantStart + angleWithin;

          let x = radius * Math.cos(angle) + centerX;
          let y = radius * 1.2 * Math.sin(angle) + centerY;

          if (qi == 0 || qi == 1) { // Augšējie kvadranti (Q1 & Q2)
            // Visas pogas tiek pārbīdītas par -80 pikseļiem
            y -= FIXED_OFFSET_Y;
          } else { // Apakšējie kvadranti (Q3 & Q4)
            // Visas pogas tiek pārbīdītas par +80 pikseļiem
            y += FIXED_OFFSET_Y;
          }

          const btn = document.createElement("div");
          btn.className = "emotion-button button";
          btn.style.left = `${x}px`;
          btn.style.top = `${y}px`;
          btn.setAttribute("data-emotion", emotion);
          btn.textContent = emotion;
          wheel.appendChild(btn);
        });
      });

      const buttons = document.querySelectorAll(".emotion-button");

      // ===== Modal =====
      const modal = document.getElementById("rating-modal");
      const modalLabel = document.getElementById("modal-label");
      const modalButtons = document.querySelectorAll(".rating-btn");

      function openModal(emotion) {
        modalLabel.innerHTML = `Novērtē emociju: <b>${emotion}</b>`;
        modal.style.display = "block";
      }

      function closeModal() {
        modal.style.display = "none";
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      // ===== Main Button Logic =====
      function handleEmotionButtonClick(button, emotion) {
        if (button.classList.contains("disabled")) return;

        if (currentSelectedButton) {
          currentSelectedButton.classList.remove("selected");
        }

        currentSelectedEmotion = emotion;
        currentSelectedButton = button;
        button.classList.add("selected");

        openModal(emotion);
      }

      function handleIntensityRating(intensity) {
        if (currentSelectedEmotion && currentSelectedButton) {
          emotionData.push({
            emotion: currentSelectedEmotion,
            intensity: intensity
          });

          if (currentSelectedButton.id !== "emotion-button-other") {
            currentSelectedButton.classList.remove("selected");
            currentSelectedButton.classList.add("disabled");
            const original = currentSelectedButton.textContent;
            currentSelectedButton.innerHTML = `${original} (${intensity})`;
          } else {
            currentSelectedButton.insertAdjacentHTML(
              "afterend",
              `<div class='other-entry'>${currentSelectedEmotion} (${intensity})</div>`
            );
            currentSelectedButton.classList.remove("selected");
          }

          currentSelectedEmotion = null;
          currentSelectedButton = null;
        }
      }

      // Attach emotion button handlers
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          const emotion = btn.getAttribute("data-emotion");
          handleEmotionButtonClick(btn, emotion);
        });
      });

      // Modal rating buttons
      modalButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const intensity = btn.dataset.rating;
          handleIntensityRating(intensity);
          closeModal();
        });
      });

      // ----- OTHER emotion -----
      const buttonOther = document.getElementById("emotion-button-other");
      buttonOther.addEventListener("click", () => {
        if (buttonOther.classList.contains("disabled")) return;
        let other = prompt("Lūdzu, ieraksti emociju:");
        if (other) handleEmotionButtonClick(buttonOther, other);
      });

      // ----- NONE button -----
      const buttonNone = document.getElementById("emotion-button-none");
      buttonNone.addEventListener("click", () => {
        emotionData = [];

        if (currentSelectedButton) {
          currentSelectedButton.classList.remove("selected");
        }
        currentSelectedEmotion = null;
        currentSelectedButton = null;

        buttons.forEach(btn => {
          btn.classList.remove("disabled", "selected");
          const emotion = btn.getAttribute("data-emotion");
          btn.innerHTML = emotion;
        });
        buttonOther.classList.remove("selected");

        document.querySelectorAll(".other-entry").forEach(e => e.remove());
        closeModal();
      });
    },

    on_finish: (data) => {
      data.task = "geneveEmotionWheel";
      data.response = JSON.stringify(emotionData);
    }
  });
}
