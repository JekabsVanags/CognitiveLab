import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyHtmlFormPlugin from "@jspsych/plugin-survey-html-form";

export function introScreens(timeline, jsPsych) {
  const welcomeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus:
      `<b>Paldies, ka pieteicaties palīdzēt!</b>
      <p>Eksperiments prasīs aptuveni 20 minūtes</p>
      <i>Lai turpinātu lūdzu spiediet jebkutu taustiņu</i>`,
  }

  const idScreen = {
    type: SurveyHtmlFormPlugin,
    html: `<p>Lūgums ievadīt epastu, caur kuru pieteicies uz klātienes eksperimentu</p>
           <label>Epasts: </label><input name="answer" type="text" required> <br> <br>`,
    data: {
      task: "email"
    },
    on_finish: function (data) {
      jsPsych.data.addProperties({ "email": data.response.answer })
    }
  }

  const fullExplanation = {
    type: FullscreenPlugin,
    message:
      `<p>Kopējais eksperiments dalīsies 4 daļās</p>
      <p>Nospiežot pogu Jūs piekrītiet sākt eksperimentu</p>`,
    button_label: "Sākt"
  }

  timeline.push(welcomeScreen, idScreen, fullExplanation);
}