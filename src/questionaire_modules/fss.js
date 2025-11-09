import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function fss_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
       <b>Noguruma smaguma pakāpes aptauja</b>
       <p>Lūdzu, novērtējiet savu pašsajūtu pēdējās nedēļas laikā un cik lielā mērā Jūs piekrītat/nepiekrītat zemāk minētajam apgalvojumam</p>
       <p>(1 - pilnīgi nepiekrītu, 7 - pilnīgipiekrītu)</p>
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `,
  };

  var ffs_questions_lv = [
    "Mana motivācija ir zemāka, kad esmu noguris / usi",
    "Fiziskas aktivitātes izraisa manu nogurumu",
    "Es ātri nogurstu",
    "Nogurums traucē manai fiziskajai funkcionēšanai",
    "Nogurums man bieži rada problēmas",
    "Nogurums traucē veikt ilgstošas fiziskas darbības",
    "Nogurums traucē veikt noteiktus pienākumus",
    "Nogurums ir viens no maniem visvairāk traucējošajiem simptomiem",
    "Nogurums traucē manai darba, ģimenes un sociālajai dzīvei"
  ];
  // Likerta skala
  const likert_labels_lv = [
    "1 Pilnīgi nepiekrītu",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7 Pilnīgi piekrītu"
  ];

  let questions = []

  // Izveido jautājumus
  for (let i = 0; i < ffs_questions_lv.length; i++) {
    const ffs_item = {
      type: SurveyLikertPlugin,
      questions: [{
        prompt: ffs_questions_lv[i],
        labels: likert_labels_lv,
        required: true,
      }],
      data: {
        task: "ffs",
        question_id: i,
        question: ffs_questions_lv[i],
      },
      on_finish: function (data) {
        data.response = data.response.Q0 + 1
      }
    };
    questions.push(ffs_item);
  }

  const finish = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
        <h2>Noguruma smaguma pakāpes aptauja pabeigta!</h2>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  }

  timeline.push(explanationScreen, ...questions, finish);
}