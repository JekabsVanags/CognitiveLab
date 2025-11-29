import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyLikertPlugin from "@jspsych/plugin-survey-likert";

export default function tas20_questionaire(timeline, jsPsych) {
  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
       <p>Lasiet sekojošos apgalvojumus un norādiet, cik lielā mērā piekrītat vai nepiekrītat katram apgalvojumam.</p>
       <p>Norādiet tikai vienu atbildi, kas atbilst katram apgalvojumam.</p>
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `,
  };

  let negative = [3, 4, 9, 17, 18]

  var tas20_questions_lv = [
    "Man bieži nav skaidrs, kādas emocijas es izjūtu.",
    "Man grūti atrast īstot vārdus savām izjūtām.",
    "Manā ķermenī ir tādas sajūtas, ko pat ārsti neizprot.",
    "Es bez grutībām spēju izteikties par savām izjūtām.",
    "Es labāk izvēlos problēmas analizēt nevis tikai par tām izteikties.",
    "Kad esmu neapmierināts/a, nezinu, vai esmu bēdīgs/a, nobijies/usies vai dusmīgs/a.",
    "Es bieži esm neizpratnē par sajūtām savā ķermenī.",
    "Es labāk ļautu, lai notikumi iet savu gaitu, nevis censtos izprast, kāpēc notiek tieši tā.",
    "Man ir izjūtas, kuras es nespēju precīzi noteikt.",
    "Spēt izprast savas emocijas ir būtiski.",
    "Man ir grūti izteikt to, ko es izjūtu pret cilvēkiem.",
    "Cilvēki saka man, lai es plašāk izsakos par savām izjūtām.",
    "Es neizprotu, kas īsti manī notiek.",
    "Es bieži nezinu, kāpēc dusmojos.",
    "Es drīzāk dodu priekšroku runāt ar cilvēkiem par to,ko viņi dara ikdienā nevis par viņu izjūtām.",
    "Es labprātāk skatos vieglus izklaidējošus raidījumus nekā psiholoģiskas drāmas.",
    "Man ir grūti uzticēt savas slēptākās izjūtas pat tuvākajiem draugiem.",
    "Es varu justies pavisam tuvs/a kādam pat klusējot.",
    "Esmu sapratis/usi, ka savu izjūtu izvērtēšana ir noderīga, risinot personiskas problēmas.",
    "Zemteksta meklēšana, skatoties filmu vai lugu, traucē gūt prieku no tām."
  ];

  // Likerta skala
  const likert_labels_lv = [
    "1 Pilnībā nepiekrītu",
    "2 Daļēji nepiekrītu",
    "3 Ne nepiekrītu, ne piekrītu",
    "4 Daļēji piekrītu",
    "5 Pilnībā piekrītu"
  ];

  let questions = []

  // Izveido jautājumus
  for (let i = 0; i < tas20_questions_lv.length; i++) {
    questions.push({
      prompt: tas20_questions_lv[i],
      labels: likert_labels_lv,
      required: true,
    });
  }

  const questionaire = {
    type: SurveyLikertPlugin,
    questions: questions,
    data: {
      task: "tas20",
      questions: tas20_questions_lv,
      negative: negative
    },
    on_finish: function (data) {
      const responses = Object.values(data.response);

      // Apstrādā apgrieztos jautājumus
      const adjustedResponses = responses.map((d, index) => {
        const value = d + 1;
        return negative.includes(index) ? value * -1 : value;
      });

      data.response = adjustedResponses;
    }
  };

  timeline.push(explanationScreen, questionaire);
}