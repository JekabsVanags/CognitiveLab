import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function bfi10_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
       <p>Lūdzu, novērtējiet cik lielā mērā Jūs piekrītat/nepiekrītat tālāk minētajiem apgalvojumiem.</p>
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `,
  };

  var bfi_questions_lv = [
    "ir atturīgs, mazrunīgs", // 1. Extraversion (apgriezts)
    "ir taktisks un jauks gandrīz pret visiem", // 2. Agreeableness
    "ir ar noslieci uz slinkošanu", // 3. Conscientiousness (apgriezts)
    "ir mierīgs, viegli tiek galā ar stresu", // 4. Neuroticism (apgriezts)
    "maz interesējas par mākslu", // 5. Openness (apgriezts)
    "ir komunikabls un sabiedrisks", // 6. Extraversion
    "ir „piekasīgs”, kritizē citus, meklē trūkumus citos", // 7. Agreeableness (apgriezts)
    "darbu veic ar lielu atbildību un rūpīgumu", // 8. Conscientiousness
    "viegli kļūst nervozs", // 9. Neuroticism
    "ir ar bagātu iztēli" // 10. Openness
  ];

  // Likerta skala
  const likert_labels_lv = [
    "1 Nepiekrītu",
    "2 Drīzāk nepiekrītu",
    "3 Nevaru izlemt",
    "4 Drīzāk piekrītu",
    "5 Piekrītu"
  ];

  // Apgriezto jautājumu indeksi
  const reversed_items = [0, 2, 3, 4, 6];

  // Izveido jautājumus
  let questions = []

  for (let i = 0; i < bfi_questions_lv.length; i++) {
    questions.push({
      prompt: `Es sevi raksturotu, kā kādu, kas ${bfi_questions_lv[i]}`,
      labels: likert_labels_lv,
      required: true,
    })
  }

  const questionaire = {
    type: SurveyLikertPlugin,
    questions: questions,
    data: {
      task: "bfi10",
      questions: bfi_questions_lv,
      reversed: reversed_items
    },
    on_finish: function (data) {
      const responses = Object.values(data.response);

      // Apstrādā apgrieztos jautājumus
      const adjustedResponses = responses.map((d, index) => {
        const value = d + 1;
        return reversed_items.includes(index) ? 6 - value : value;
      });

      data.response = adjustedResponses;
    }
  };

  timeline.push(explanationScreen, questionaire);
}