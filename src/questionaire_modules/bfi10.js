import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function bfi10_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
       <b>Lielā piecinieka personības aptauja</b>
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
  const reversed_items = [1, 3, 4, 5, 7];
  let questions = [];
  // Izveido jautājumus
  for (let i = 0; i < bfi_questions_lv.length; i++) {
    const question_number = i + 1;

    const bfi_item = {
      type: SurveyLikertPlugin,
      questions: [{
        prompt: `Es sevi raksturotu, kā kādu, kas ${bfi_questions_lv[i]}`,
        labels: likert_labels_lv,
        required: true,
      }],
      data: {
        task: "bfi10",
        question_id: i,
        question: bfi_questions_lv[i],
        reversed: reversed_items.includes(question_number)
      },
      on_finish: function (data) {
        // Saglabā jau apgrieztus datus
        if (data.reversed) {
          data.response = 6 - (data.response.Q0 + 1)
        }
        else {
          data.response = data.response.Q0 + 1
        }
      }
    };
    questions.push(bfi_item);
  }

  const finish = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
        <h2>Lielā piecinieka personības aptauja pabeigta!</h2>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  }

  timeline.push(explanationScreen, ...questions, finish);
}