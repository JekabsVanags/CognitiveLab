import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import surveyHtmlForm from '@jspsych/plugin-survey-html-form';
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";

/**
 * Adds a task switching test block to the jsPsych experiment timeline.
 *
 * @param {Array} timeline - The experiment timeline array to which the visual search test will be added.
 * @param {Object} jsPsych - The jsPsych instance used to build the experiment.
 */

export function subjectiveCertainty(timeline, jsPsych) {
  //===Add an experiment step that exits the fullscreen===//
  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: false,
  });

  //===Add an experiment with first instructions===//
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>Subjektīvās pārliecības eksperiments</b>
      <p>Lūdzu, atveriet jaunu tīmekļa pārlūkprogrammas logu blakus šim logam.</p>
      <i>Nospiediet jebkuru taustiņu, lai turpinātu.</i>
      `
  });

  //===Add an experiment with control questions to check users experience with trip planning===//
  timeline.push({
    type: surveyHtmlForm,
    html: `
      <p>Vai Tu pēdējā gada laikā esi plānojis ceļojumu uz ārzemēm, kas ilga ilgāk par 6 dienām?</p>
      <label><input name="answer" type="radio" value="Jā" required> Jā</label><br>
      <label><input name="answer" type="radio" value="Nē"> Nē</label><br><br>
      `,
    on_finish: function (data) {
      //Save the controlquestions in the data
      if (data.response.answer == "Jā") {
        jsPsych.data.addProperties({ "hasPlannedATrip": true })
      }
      else {
        jsPsych.data.addProperties({ "hasPlannedATrip": false })
      }
    },
  });

  //===Add an experiment with control questions to check users experience with south America===//
  timeline.push({
    type: surveyHtmlForm,
    html: `<p>Vai tu pēdējo 3 gadu laikā esi bijis ceļojumā kādā no Dienvidamerikas valstīm?</p>
           <label><input name="answer" type="radio" value="Jā" required> Jā</label><br>
           <label><input name="answer" type="radio" value="Nē"> Nē</label><br> <br>`,
    on_finish: function (data) {
      //Save the controlquestions in the data
      if (data.response.answer == "Jā") {
        jsPsych.data.addProperties({ "hasBeenToAmerica": true })
      }
      else {
        jsPsych.data.addProperties({ "hasBeenToAmerica": false })
      }
    },
  });

  //===Add an experiment step that shows the "legend" of the task===//
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      //Change the task depending on the controlquestions
      const hasBeenToAmerica = jsPsych.data.dataProperties.hasBeenToAmerica;
      const hasPlannedATrip = jsPsych.data.dataProperties.hasPlannedATrip;

      return `
        <b>Subjektīvās pārliecības eksperiments</b>
        <p>Tu esi izlēmis šajā vasarā doties ceļojumā uz 
        ${hasBeenToAmerica ? "Dienvidāfriku" : "Dienvidameriku"} uz 
        ${hasPlannedATrip ? "divām nedēļām" : "vienu nedēļu"}. Lai to īstenotu, Tev ir jāizveido ceļojuma plāns. Tāpat Tu vēlētos, lai Tev pievienojas daži draugi, jo kopā ir jautrāk!</p>
        <p>Uzdevumu veikšanai drīkst izmantot jebkādus digitālos resursus un meklēšanas tehnoloģijas (Wikipedia, Google, Bing u.c.), kā arī LLM tehnoloģijas (ChatGPT, Google Gemini, ClaudeAI u.c.).</p>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
        `
    }
  });

  //===Task parameters===//
  const tasks = [
    {
      id: 1,
      prompt: `Izplāno aptuvenu ceļojuma maršrutu, iekļaujot vismaz trīs apskates objektus.
               Tu drīksti sākt ceļojumu no jebkuras vietas.`,
      duration: 5 * 60 * 1000, // 5 min
      confidence_question: `Dotajā skalā novērtē, cik pārliecināts esi par izvēlētajiem apskates objektiem.`,
    },
    {
      id: 2,
      prompt: `Ņemot vērā iepriekšējā uzdevumā izveidoto plānu, sastādi aptuvenu ceļojuma budžetu.
               Tas var būt orientējošs, bet, lūdzu, rēķini to eiro.`,
      duration: 3 * 60 * 1000, // 3 min
      confidence_question: `Dotajā skalā novērtē, cik pārliecināts esi, ka izveidotais budžets netiks pārsniegts šī ceļojuma laikā.`,
    },
    {
      id: 3,
      prompt: `Balstoties uz izveidoto ceļojuma plānu un budžetu, uzraksti e-pastu vai īsziņu, ko nosūtīt saviem draugiem par plānoto braucienu.`,
      duration: 2 * 60 * 1000, // 2 min
      confidence_question: `Dotajā skalā novērtē, cik pārliecināts esi, ka šī ziņa skaidri izskaidro Tavu ceļojuma plānu.`,
    },
  ];

  //Generate tasks to add to timeline
  tasks.forEach(task => {
    //===Add an experiment step with tasks===//
    timeline.push({
      type: SurveyTextPlugin,
      questions: [{ prompt: task.prompt, rows: 10, columns: 80 }],
      trial_duration: task.duration,
      data: {
        task: "subjectiveCertainty",
        question_type: "answer"
      },
      on_load: function () {
        //Create the timer
        const duration = jsPsych.getCurrentTrial().trial_duration;
        const container = document.createElement("div");
        container.id = "time-left";
        container.style = "position:fixed; top:10px; right:10px; font-size:18px; font-weight:bold;";
        document.body.appendChild(container);

        let timeLeft = duration / 1000;
        container.textContent = `Atlikušais laiks: ${timeLeft} sek.`;

        //Make timer decrement
        const interval = setInterval(() => {
          timeLeft--;
          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }
          container.textContent = `Atlikušais laiks: ${timeLeft} sek.`;
        }, 1000);

        //From 2nd task onward make it possible to see preivous answers
        if (task.id >= 2) {
          const responses = document.createElement("div");
          responses.id = "previous-responses";
          const responseData = jsPsych.data.get().trials.filter((d) => d.trial_type === "survey-text");
          responses.innerHTML = "";

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

          //Button to show the previous responses
          const previousResponseButton = document.createElement("button");
          previousResponseButton.id = "response-button";
          previousResponseButton.innerHTML = "Rādīt iepriekšējo jautājumu atbildes";
          previousResponseButton.classList.add("jspsych-btn");
          previousResponseButton.style = "position:fixed; top:10px; left:10px; font-weight: bold;";
          previousResponseButton.onclick = () => {
            //Toggle previous answer visibility
            const currentVisibility = document.getElementById("previous-responses").style.visibility;
            if (currentVisibility === "visible") {
              document.getElementById("previous-responses").style.visibility = 'hidden';
              previousResponseButton.innerHTML = "Rādīt iepriekšējo jautājumu atbildes";
            } else {
              //If accessed data, then add data propery
              jsPsych.data.addProperties({ "accessedPreviousAnswer": true })
              document.getElementById("previous-responses").style.visibility = 'visible';
              previousResponseButton.innerHTML = "Slēpt iepriekšējo jautājumu atbildes";
            }
          };
          document.body.appendChild(previousResponseButton);
        }
      },
      on_finish: function (data) {
        //Set data
        data.taskId = task.id;

        //Remove the appended elements
        const timeDisplay = document.getElementById("time-left");
        if (timeDisplay) timeDisplay.remove();
        const previous = document.getElementById("previous-responses");
        if (previous) previous.remove();
        const button = document.getElementById("response-button");
        if (button) button.remove();
      },
    });

    //===Add an experiment step to check the subjective certainty===//
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
      data: {
        task: "subjectiveCertainty"
      },
      on_finish: function (data) {
        data.task_id = task.id;
        data.question_type = "confidence";
      }
    });

    //===Add an experiment step to check if the subject used LLM===//
    timeline.push({
      type: surveyHtmlForm,
      html: `
        <p>Vai, pildot šo uzdevumu, Tu izmantoji kādu LLM rīku (piemēram, ChatGPT)?</p>
        <label><input name="llm_used" type="radio" value="Jā" required> Jā</label><br>
        <label><input name="llm_used" type="radio" value="Nē"> Nē</label><br><br>
        `,
      data: {
        task: "subjectiveCertainty"
      },
      on_finish: function (data) {
        data.task_id = task.id;
        data.question_type = "llm_use";
      }
    });

    //===Add an experiment step to check if LLM usage level===//
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
      data: {
        task: "subjectiveCertainty"
      },
      on_finish: function (data) {
        data.task_id = task.id;
        data.question_type = "llm_usage_level";
      }
    };

    //===Show the LLM usage level only if subject said they used it===//
    timeline.push({
      timeline: [llm_usage_level],
      conditional_function: function () {
        const lastTrial = jsPsych.data.get().last(1).values()[0];
        return lastTrial && lastTrial.response && lastTrial.response.llm_used === "Jā";
      }
    });
  });
}