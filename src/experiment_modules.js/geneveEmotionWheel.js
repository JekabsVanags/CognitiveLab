import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

/**
 * Adds an emotion wheel with pressable buttons and radio buttons for intensity.
 *
 * @param {Array} timeline - The jsPsych timeline array.
 * @param {object} jsPsych - The jsPsych instance.
 */
export default function geneveEmotionWheel(timeline, jsPsych) {
  let emotionData = []

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <style>
        .wheel-container {
          position: relative;
          width: 600px;
          height: 600px;
          margin: 0 auto;
          border-radius: 50%;
        }
        .button{
          width: 100px;
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
        .button .rating {
          font-size: 12px;
          color: #666;
          font-weight: bold;
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
        .radio-container {
          display: none;
          margin-top: 20px;
          text-align: center;
        }
        .radio-container label {
          margin: 0 10px;
          cursor: pointer;
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
      </style>

      <div class="wheel-container" id="wheel">
        <div class="center-buttons">
          <div id="emotion-button-none" class="button">Neviena</div>
          <div id="emotion-button-other" class="button">Cita</div>
        </div>
      </div>

      <div id="radio-box" class="radio-container">
        <p id="radio-label">Rate intensity for: <b>None</b></p>

        <div id="radio-group">
          <label><input type="radio" name="intensity" value="1"> 1</label>
          <label><input type="radio" name="intensity" value="2"> 2</label>
          <label><input type="radio" name="intensity" value="3"> 3</label>
          <label><input type="radio" name="intensity" value="4"> 4</label>
          <label><input type="radio" name="intensity" value="5"> 5</label>
        </div>
      </div>

      <p style="margin-top:20px; text-align:center;">
        <i>Izvēlies emocijas, un  norādi to intensitāti. Spied "Atsarpe" kad esi pabeidzis!</i>
      </p>
    `,
    on_load: () => {
      const emotions = ["Apmierinātība", "Mīlestība", "Apbrīns", "Atvieglojums", "Līdzjūtība", "Bēdas", "Vaina", "Nožēla", "Kauns", "Vilšanās", "Bailes", "Pretīgums", "Nicinājums", "Nepatika", "Dusmas", "Interese", "Jautrība", "Lepnums", "Prieks", "Bauda"];
      const wheel = document.getElementById("wheel");
      let radius = window.innerWidth / 3 > 286 ? 286 : window.innerWidth / 3;
      console.log(radius)

      let currentSelectedEmotion = null;
      let currentSelectedButton = null;

      // Generate emotion buttons around a circle
      emotions.forEach((emotion, i) => {
        const angle = (i / emotions.length) * 2 * Math.PI;
        const x = radius * Math.cos(angle) + 300;
        const y = radius * Math.sin(angle) + 300;

        const btn = document.createElement("div");
        btn.className = "emotion-button button";
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.setAttribute("data-emotion", emotion);
        btn.textContent = emotion;
        wheel.appendChild(btn);
      });

      const buttons = document.querySelectorAll(".emotion-button");
      const radioBox = document.getElementById("radio-box");
      const radioLabel = document.getElementById("radio-label");
      const radioButtons = document.querySelectorAll('input[name="intensity"]');

      // Function to handle emotion button clicks
      function handleEmotionButtonClick(button, emotion) {
        // Don't do anything if button is already disabled
        if (button.classList.contains('disabled')) {
          return;
        }

        // Clear previous selection styling
        if (currentSelectedButton) {
          currentSelectedButton.classList.remove('selected');
        }

        // Set current selection
        currentSelectedEmotion = emotion;
        currentSelectedButton = button;

        // Style the selected button
        button.classList.add('selected');

        // Show radio buttons
        radioBox.style.display = "block";
        radioLabel.innerHTML = "Rate intensity for: <b>" + emotion + "</b>";
      }

      // Function to handle intensity rating
      function handleIntensityRating(intensity) {
        if (currentSelectedEmotion && currentSelectedButton) {
          // Add to emotion data
          emotionData.push({
            emotion: currentSelectedEmotion,
            intensity: intensity
          });

          if (currentSelectedButton.id !== 'emotion-button-other') {
            // Disable the button and show rating
            currentSelectedButton.classList.remove('selected');
            currentSelectedButton.classList.add('disabled');

            // Add rating display to button
            const originalText = currentSelectedButton.textContent;
            currentSelectedButton.innerHTML = `${originalText} (${intensity})`;
          } else {
            // For "Cita" button, just remove selection styling
            currentSelectedButton.insertAdjacentHTML("afterend", `<div class='other-entry'>${currentSelectedEmotion} (${intensity})</div>`)
            currentSelectedButton.classList.remove('selected');
          }

          // Clear radio selection and hide radio box
          radioButtons.forEach(radio => radio.checked = false);
          radioBox.style.display = "none";

          // Clear current selection
          currentSelectedEmotion = null;
          currentSelectedButton = null;
        }
      }

      // Add click handlers to emotion buttons
      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          const emotion = btn.getAttribute("data-emotion");
          handleEmotionButtonClick(btn, emotion);
        });
      });

      // Add change handlers to radio buttons
      radioButtons.forEach(radio => {
        radio.addEventListener("change", () => {
          handleIntensityRating(radio.value);
        });
      });

      // Handle "Other" button
      const buttonOther = document.getElementById("emotion-button-other");
      buttonOther.addEventListener("click", () => {
        if (buttonOther.classList.contains('disabled')) {
          return;
        }

        let otherEmotion = prompt("Lūdzu, ieraksti emociju:");
        if (otherEmotion) {
          handleEmotionButtonClick(buttonOther, otherEmotion);
        }
      });

      // Handle "None" button - reset all selections
      const buttonNone = document.getElementById("emotion-button-none");
      buttonNone.addEventListener("click", () => {
        // Clear all data
        emotionData = [];

        // Clear current selection
        if (currentSelectedButton) {
          currentSelectedButton.classList.remove('selected');
        }
        currentSelectedEmotion = null;
        currentSelectedButton = null;

        // Re-enable all buttons except keep "Cita" always enabled
        buttons.forEach(btn => {
          btn.classList.remove('disabled', 'selected');
          // Restore original text (remove rating display)
          const emotion = btn.getAttribute("data-emotion");
          btn.innerHTML = emotion;
        });
        buttonOther.classList.remove('selected'); // Don't disable "Cita"

        document.querySelectorAll(".other-entry").forEach(entry => entry.remove());

        // Clear radio selection
        radioButtons.forEach(radio => radio.checked = false);

        // Hide radio box and clear selection
        radioBox.style.display = "none";
        radioButtons.forEach(radio => radio.checked = false);
      });
    },
    on_finish: (data) => {
      data.task = "geneveEmotionWheel";
      data.response = JSON.stringify(emotionData);
    }
  });
}