import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function ess_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
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
    "0 Nekad neiesnaustos",
    "1 Neliela varbūtība, ka iesnaustos vai aizmigtu",
    "2 Vidēji liela varbūtība, ka iesnaustos vai aizmigtu",
    "3 Liela varbūtība, ka iesnaustos vai aizmigtu",
  ];

  let questions = []

  // Izveido jautājumus
  for (let i = 0; i < ess_questions_lv.length; i++) {
    questions.push({
      prompt: ess_questions_lv[i],
      labels: likert_labels_lv,
      required: true,
    });
  }

  const questionaire = {
    type: SurveyLikertPlugin,
    questions: questions,
    data: {
      task: "ess",
      questions: ess_questions_lv,
    },
    on_finish: function (data) {
      data.response = Object.values(data.response);
    }
  };

  timeline.push(explanationScreen, questionaire);
}