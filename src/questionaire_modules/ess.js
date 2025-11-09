import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function ess_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
       <b>Epvortas miegainības aptauja</b>
       <p>Lūdzu, novērtējiet iespējamību iesnausties dažādās situācijās skalā no 0 līdz 3.</p>
       <p>Zemākā vērtība “0” norāda, ka “nekad neiesnaužos” un augstākā vērtība “3” norāda, ka “ir liela varbūtība iesnausties vai aizmigt”.</p>
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `,
  };

  var ess_questions_lv = [
    "Sēžot un lasot",
    "Skatoties TV",
    "Sēžot publiskā vietā (teātrī, sapulcē, un tml.)",
    "Sēžot kā pasažieris transportā vairāk kā stundu, esot sastrēgumā",
    "Sēžot un runājoties ar kādu",
    "Apsēžoties pēc pusdienām (bez alkohola)",
    "Automašīnā pie stūres, kamēr mašīna apstājusies uz dažām minūtēm",
  ];

  // Likerta skala
  const likert_labels_lv = [
    "0 Nekad",
    "1",
    "2",
    "3 Liela varbūtība",
  ];

  let questions = []

  // Izveido jautājumus
  for (let i = 0; i < ess_questions_lv.length; i++) {
    const ffs_item = {
      type: SurveyLikertPlugin,
      questions: [{
        prompt: ess_questions_lv[i],
        labels: likert_labels_lv,
        required: true,
      }],
      data: {
        task: "ess",
        question_id: i,
        question: ess_questions_lv[i],
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
        <h2>Epvortas miegainības aptauja pabeigta!</h2>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  }

  timeline.push(explanationScreen, ...questions, finish);
}