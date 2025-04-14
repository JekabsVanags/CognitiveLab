import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import surveyHtmlForm from '@jspsych/plugin-survey-html-form';
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";


export function subjectiveCertainty(timeline, jsPsych) {
  // === IEVADS UN LEĢENDA ===
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>Subjektīvās pārliecības eksperiments</b>
      <p>Tu dosies ceļojumā uz Dienvidameriku uz vienu nedēļu. Tev jāizplāno šis ceļojums un jāinformē draugi.</p>
      <p>Uzdevumus drīkst veikt ar jebkādu digitālo rīku palīdzību (Google, Wikipedia, ChatGPT utt.).</p>
      <i>Spied jebkuru taustiņu, lai turpinātu</i>`,
  });

  // === KONTROLJAUTĀJUMI PAR PIEREDZI ===
  const controlQuestions = [
    "Vai tu pēdējo 3 gadu laikā esi bijis ceļojumā kādā no Dienvidamerikas valstīm?",
    "Vai tu pēdējā gada laikā esi plānojis ceļojumu uz ārzemēm, kas ilgu ilgāk par 6 dienām?"
  ];

  controlQuestions.forEach(q => {
    timeline.push({
      type: surveyHtmlForm,
      html: `<p>${q}</p>
             <label><input name="answer" type="radio" value="Jā" required> Jā</label><br>
             <label><input name="answer" type="radio" value="Nē"> Nē</label><br>`,
    });
  });

  // === UZDEVUMU DEFINĪCIJA ===
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
      },
      on_finish: function (data) {
        data.task_id = task.id;
        data.timed_out = data.rt === null;

        const timeDisplay = document.getElementById("time-left");
        if (timeDisplay) timeDisplay.remove();
      }
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
  });
}
