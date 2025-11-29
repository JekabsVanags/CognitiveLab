import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

/**
 * Combined image emotion classifier with Geneva Emotion Wheel
 * Shows full-screen image first, then shrinks to side-by-side view after spacebar
 */
export default function imageEmotionClassifier(timeline, jsPsych) {
  // Experiment introduction
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<b>Lūdzu, dažu sekunžu laikā, novērtējiet attēlu pēc emocijām un to intensitātes</b>
                <p>(Iespējams norādīt vairākas, vienlaicīgi izjustas emocijas un to intensitāti.</p>
                <p>Gadījumā, ja neizjūtat šobrīd emocijas, lūgums, to norādīt. Gadījumā, ja izjūtat emocijas, kas nav norādītas aplī, iespējams norādīt papildus emocijas izvēloties opciju Cita un ierakstot to.)</p>
                <i>Lai turpinātu, lūdzu, spied jebkuru taustiņu.</i>`
  })

  // Loop through images
  for (let i = 1; i <= 3; i++) {
    let emotionData = [];

    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus: "",
      choices: "NO_KEYS", // Disable all keys initially
      trial_duration: null, // No timeout
      on_start: function (trial) {
        let group = jsPsych.data.get().last(1).values()[0].user_id.slice(-1);
        const imagePath = `assets/emotion_image_classifier/group_${group}/img_${i}.png`;

        trial.stimulus = `
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body, html {
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden;
              width: 100%;
              height: 100%;
            }
            #jspsych-content {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            .jspsych-content-wrapper {
              margin: 0 !important;
              padding: 0 !important;
            }
            .fullscreen-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              transition: opacity 0.5s ease;
            }
            .fullscreen-overlay.hidden {
              opacity: 0;
              pointer-events: none;
            }
            .fullscreen-image {
              max-width: 90vw;
              max-height: 85vh;
              object-fit: contain;
              display: block;
            }
            .fullscreen-instruction {
              margin-top: 30px;
              color: white;
              font-size: 20px;
              text-align: center;
              display: none;
            }
            .main-container {
              display: none;
              width: 100%;
              min-height: 100vh;
              padding: 20px;
              box-sizing: border-box;
              overflow-y: auto;
            }
            .main-container.visible {
              display: flex;
              gap: 40px;
              align-items: flex-start;
              justify-content: center;
            }
            .image-side {
              margin: auto;
            }
            .image-side img {
              width: 400px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .wheel-side {
              margin: auto;
            }
            .wheel-container {
              position: relative;
              width: 800px;
              height: 800px;
              margin: 0 auto;
              border-radius: 50%;
            }
            .button {
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
              width: 400px;
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
            .finish-btn{
              padding: 10px 10px;
              border-radius: 6px;
              text-align: center;
              width: 60%;
              cursor: pointer;
              border: 1px solid #aaa;
              background: #eee;
              transition: -61.8s;
              margin: 10px;
            }
            .finish-btn:hover {
              background: #ddd;
            }
          </style>

          <!-- Fullscreen Image Overlay -->
          <div id="fullscreen-overlay" class="fullscreen-overlay">
            <img src="${imagePath}" class="fullscreen-image" alt="Emotion stimulus">
          </div>

          <!-- Main Content (Hidden Initially) -->
          <div id="main-container" class="main-container">
            <div class="image-side">
              <img src="${imagePath}" alt="Emotion stimulus">
            </div>
            
            <div class="wheel-side">
              <div class="wheel-container" id="wheel">
                <div class="center-buttons">
                  <div id="emotion-button-none" class="button">Neviena</div>
                  <div id="emotion-button-other" class="button">Cita</div>
                </div>
              </div>

              <p style="margin-top:-50px; text-align:center;">
                <i>Izvēlies emocijas, un norādi to intensitāti.</i>
              </p>
              
              <button id="finish-button" class="finish-btn">Pabeidzu</button>
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
        `;
      },

      on_load: () => {
        const overlay = document.getElementById("fullscreen-overlay");
        const mainContainer = document.getElementById("main-container");
        let wheelInitialized = false;
        let canFinish = false;

        // Block input for first 5 seconds
        setTimeout(() => {
          canFinish = true;
        }, 5000);

        // Automatically transition after 5 seconds
        setTimeout(() => {
          if (!wheelInitialized) {
            transitionToWheel();
          }
        }, 5000);

        function transitionToWheel() {
          overlay.classList.add("hidden");
          setTimeout(() => {
            overlay.style.display = 'none';
            mainContainer.classList.add("visible");
            document.body.style.overflow = 'auto';
            initializeWheel();
            wheelInitialized = true;
          }, 500);
        }

        // Handle Backspace to finish trial
        const keyHandler = (e) => {
          if (e.key === 'Backspace' && wheelInitialized && canFinish) {
            e.preventDefault();
            jsPsych.finishTrial();
          }
        };

        document.addEventListener('keydown', keyHandler);

        function initializeWheel() {
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

              if (qi == 0 || qi == 1) {
                y -= FIXED_OFFSET_Y;
              } else {
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

          const buttonOther = document.getElementById("emotion-button-other");
          buttonOther.addEventListener("click", () => {
            if (buttonOther.classList.contains("disabled")) return;
            let other = prompt("Lūdzu, ieraksti emociju:");
            if (other) handleEmotionButtonClick(buttonOther, other);
          });

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

          // Finish button
          const finishButton = document.getElementById("finish-button");
          finishButton.addEventListener("click", () => {
            jsPsych.finishTrial();
          });
        }
      },

      on_finish: (data) => {
        let group = jsPsych.data.get().last(1).values()[0].user_id.slice(-1);
        data.image_name = `group_${group}/img_${i}.png`;
        data.task = "imageEmotionClassifier";
        data.response = JSON.stringify(emotionData);

        // Reset body styles
        document.body.style.overflow = '';
      }
    });
  }
}