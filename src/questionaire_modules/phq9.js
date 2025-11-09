import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function phq9_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
       <b>Depresijas noteikšanas aptauja</b>
       <p>Cik bieži pēdējo 2 nedēļu laikā Jūs esat izjutis sekojošo</p>
       <p>(1 - pilnīgi nepiekrītu, 7 - pilnīgipiekrītu)</p>
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `,
  };

  var phq9_questions_lv = [
    "Pazeminātu interesi vai prieku par to, ko darāt ikdienā",
    "Nospiestību, nomāktību, bezcerību",
    "Grūtības iemigt, gulēt naktī bez pamošanās vai pārlieku lielu miegainību",
    "Pastiprinātu nogurumu vai enerģijas trūkumu",
    "Sliktu vai pārlieku lielu apetīti",
    "Pazeminātu pašapziņu, sajūtu, ka esat neveiksminieks/ce, ka esat pievīlis/usi sevi vai savu ģimeni",
    "Grūtības koncentrēties, piemēram, lasot vai skatoties televīziju",
    "Gausumu kustībās un runā, ko pamanījuši arī apkārtējie. Vai arī palieku nemieru, kustīgumu",
    "Domas, ka būtu labāk, ja būtu miris/usi vai domas par nodarīšanu sev pāri jebkādā veidā"
  ];

  // Likerta skala
  const labels_lv = [
    "Nemaz",
    "Dažas dienas",
    "Vairāk nekā pusi laika",
    "Gandrīz visu laiku",
  ];

  let questions = []

  // Izveido jautājumus
  for (let i = 0; i < phq9_questions_lv.length; i++) {
    const ffs_item = {
      type: SurveyLikertPlugin,
      questions: [{
        prompt: phq9_questions_lv[i],
        labels: labels_lv,
        required: true,
      }],
      data: {
        task: "phq9",
        question_id: i,
        question: phq9_questions_lv[i],
      },
      on_finish: function (data) {
        data.response = data.response.Q0
      }
    };
    questions.push(ffs_item);
  }

  const finish = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
        <h2>Depresijas noteikšanas aptauja pabeigta!</h2>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  }

  timeline.push(explanationScreen, ...questions, finish);
}