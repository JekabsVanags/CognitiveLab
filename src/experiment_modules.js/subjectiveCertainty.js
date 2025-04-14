import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import surveyHtmlForm from '@jspsych/plugin-survey-html-form';
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";


export function subjectiveCertainty(timeline, jsPsych) {
  //Izejam no pilnekrāna
  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: false,
  });

  // Ievads
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>Subjektīvās pārliecības eksperiments</b>
      <p>Lūgums blakus šim logam atvērt jaunu tīmekļa pārlūka logu</p>
      <i>Spied jebkuru taustiņu, lai turpinātu</i>`,
  });

  // Kontroljautājumi
  timeline.push({
    type: surveyHtmlForm,
    html: `<p>Vai tu pēdējā gada laikā esi plānojis ceļojumu uz ārzemēm, kas ilgu ilgāk par 6 dienām?</p>
           <label><input name="answer" type="radio" value="Jā" required> Jā</label><br>
           <label><input name="answer" type="radio" value="Nē"> Nē</label><br>`,
    on_finish: function (data) {
      if (data.response.answer == "Jā") {
        jsPsych.data.addProperties({ "hasPlannedATrip": true })
      }
      else {
        jsPsych.data.addProperties({ "hasPlannedATrip": false })
      }
    },
  });

  timeline.push({
    type: surveyHtmlForm,
    html: `<p>Vai tu pēdējo 3 gadu laikā esi bijis ceļojumā kādā no Dienvidamerikas valstīm?</p>
           <label><input name="answer" type="radio" value="Jā" required> Jā</label><br>
           <label><input name="answer" type="radio" value="Nē"> Nē</label><br>`,
    on_finish: function (data) {
      if (data.response.answer == "Jā") {
        jsPsych.data.addProperties({ "hasBeenToAmerica": true })
      }
      else {
        jsPsych.data.addProperties({ "hasBeenToAmerica": false })
      }
    },
  });

  // Leģenda
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      console.log(jsPsych.data)
      const hasBeenToAmerica = jsPsych.data.dataProperties.hasBeenToAmerica;
      const hasPlannedATrip = jsPsych.data.dataProperties.hasPlannedATrip;

      return `
        <b>Subjektīvās pārliecības eksperiments</b>
        <p>Tu esi izdomājis šajā vasarā doties ceļojumā uz ${hasBeenToAmerica ? "Dienvidāfriku" : "Dienvidameriku"
        } uz ${hasPlannedATrip ? "divām nedēļām" : "vienu nedēļu"}. Lai šo izdarītu tev ir jāizveido plāns. Tāpat tu vēlētos, lai tev pievienojas kādi tavi draugi, jo kopā ir jautrāk!</p>
        <p>Lai veiktu šos uzdevumus drīkst lietot jebkādus digitālos resursus un meklēšanas tehnoloģijas (Wikipedia, Google, Bing, u.c.), un/vai LLM tehnoloģijas (ChatGPT, Google Gemini, ClaudeAI, u.c.)</p>
        <i>Spied jebkuru taustiņu, lai turpinātu</i>`;
    }
  });

  //Uzdevumi
  const tasks = [
    {
      id: 1,
      prompt: `Izplāno aptuvenu ceļojuma plānu ar vismaz 3 apskates objektiem. 
               Tu drīksti sākt ceļojumu no jebkura punkta.`,
      duration: 5 * 60 * 1000, // 5 min
      confidence_question: `Dotajā skalā novērtē to, cik ļoti tu esi pārliecināts, ka esi veicis labu apskates punktu izvēli?`,
    },
    {
      id: 2,
      prompt: `Ņemot vērā iepriekšējā uzdevumā izveidoto plānu, izveido aptuvenu ceļojuma budžetu. 
               Šim budžetam nav jābūt precīzam, bet lūgums to rēķināt eiro.`,
      duration: 3 * 60 * 1000, // 3 min
      confidence_question: `Dotajā skalā novērtē to, cik ļoti pārliecināts tu esi, ka tevis noteiktais budžets netiks pārsniegts šāda ceļojuma laikā?`,
    },
    {
      id: 3,
      prompt: `Ņemot vērā izveidoto ceļojuma plānu un budžetu, uzraksti epastu vai īsziņu ko sūtīt saviem draugiem par plānoto ceļojumu.`,
      duration: 2 * 60 * 1000, // 2 min
      confidence_question: `Dotajā skalā novērtē to, cik ļoti pārliecināts tu esi, ka šī ziņa izskaidro tavus plānus?`,
    },
  ];

  tasks.forEach(task => {
    // Uzdevums
    timeline.push({
      type: SurveyTextPlugin,
      questions: [{ prompt: task.prompt, rows: 10, columns: 80 }],
      trial_duration: task.duration,
      on_load: function () {
        const duration = jsPsych.getCurrentTrial().trial_duration;
        const container = document.createElement("div");
        container.id = "time-left";
        container.style = "position:fixed; top:10px; right:10px; font-size:18px; font-weight:bold;";
        document.body.appendChild(container);

        let timeLeft = duration / 1000;
        container.textContent = `Atlikušais laiks: ${timeLeft} sek.`;

        const interval = setInterval(() => {
          timeLeft--;
          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }
          container.textContent = `Atlikušais laiks: ${timeLeft} sek.`;
        }, 1000);

        if (task.id >= 2) {
          const responses = document.createElement("div");
          responses.id = "previous-responses";
          const responseData = jsPsych.data.get().trials.filter((d) => d.trial_type === "survey-text");
          responses.innerHTML = "";
          console.log(responseData);
          responseData.forEach((response) => {
            if (response.task_id && tasks[response.task_id - 1]) { // Pievienota pārbaude
              const question = tasks[response.task_id - 1].prompt;
              const answer = response.response.Q0;
              responses.innerHTML += `
                <i>${question}</i>
                <p>${answer}</p>
              `;
            }
          });
          responses.style = "text-align: center; margin-top: 60px;";
          responses.style.visibility = 'hidden';
          document.body.prepend(responses);

          const previousResponseButton = document.createElement("button");
          previousResponseButton.id = "response-button";
          previousResponseButton.innerHTML = "Rādīt iepriekšējo jautājumu atbildes";
          previousResponseButton.classList.add("jspsych-btn");
          previousResponseButton.style = "position:fixed; top:10px; left:10px; font-weight: bold;";
          previousResponseButton.onclick = () => {
            const currentVisibility = document.getElementById("previous-responses").style.visibility;
            if (currentVisibility === "visible") {
              document.getElementById("previous-responses").style.visibility = 'hidden';
              previousResponseButton.innerHTML = "Rādīt iepriekšējo jautājumu atbildes";
            } else {
              document.getElementById("previous-responses").style.visibility = 'visible';
              previousResponseButton.innerHTML = "Slēpt iepriekšējo jautājumu atbildes";
            }
          };
          document.body.appendChild(previousResponseButton);
        }
      },
      on_finish: function (data) {
        data.task_id = task.id;
        data.timed_out = data.rt === null;

        const timeDisplay = document.getElementById("time-left");
        if (timeDisplay) timeDisplay.remove();
        const previous = document.getElementById("previous-responses");
        if (previous) previous.remove();
        const button = document.getElementById("response-button");
        if (button) button.remove();
      },
    });

    // Subjektīvā pārliecība (1–5 skala)
    timeline.push({
      type: SurveyLikertPlugin,
      questions: [{
        prompt: task.confidence_question,
        labels: [
          "1 – Pilnīgi neesmu pārliecināts",
          "2 – Drīzāk neesmu pārliecināts",
          "3 – Nezinu",
          "4 – Drīzāk esmu pārliecināts",
          "5 – Pilnīgi pārliecināts"
        ],
        required: true,
      }],
      on_finish: function (data) {
        data.task_id = task.id;
        data.question_type = "confidence";
      }
    });

    // Vai lietoji LLM?
    timeline.push({
      type: surveyHtmlForm,
      html: `<p>Vai, pildot šo uzdevumu, tu izmantoji kādu LLM rīku (piemēram, ChatGPT)?</p>
             <label><input name="llm_used" type="radio" value="Jā" required> Jā</label><br>
             <label><input name="llm_used" type="radio" value="Nē"> Nē</label><br>`,
      on_finish: function (data) {
        data.task_id = task.id;
        data.question_type = "llm_use";
      }
    });

    const llm_usage_level = {
      type: SurveyLikertPlugin,
      questions: [{
        prompt: "No 1 līdz 5, cik ļoti daudz darba veica LLM modelis?",
        labels: [
          "1 – Es izmantoju LLM tikai, lai pārbaudītu savu rezultātu",
          "2 – Es lielākoties pats veicu darbu, bet LLM izmantoju atsevišķu uzdevumu veikšanai",
          "3 – Es un LLM veicām darbu līdzīgā apjomā",
          "4 – LLM veica lielāko daļu darba, bet es to pārskatīju un koriģēju",
          "5 – LLM veica visu darbu bez manas iejaukšanās"
        ],
        required: true,
      }],
      on_finish: function (data) {
        data.task_id = task.id;
        data.question_type = "llm_usage_level"; // Labots question_type
      }
    };

    timeline.push({
      timeline: [llm_usage_level],
      conditional_function: function () {
        const lastTrial = jsPsych.data.get().last(1).values()[0];
        return lastTrial && lastTrial.response && lastTrial.response.llm_used === "Jā"; // Labota pārbaude
      }
    });
  });
}