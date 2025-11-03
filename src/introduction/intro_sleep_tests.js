import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyHtmlFormPlugin from "@jspsych/plugin-survey-html-form";

/**
 * Adds intro section to the jsPsych experiment timeline, collects the ids
 *
 * @param {Array} timeline - The experiment timeline array to which the n-Back test will be added.
 * @param {Object} jsPsych - The jsPsych instance used to build the experiment.
 */

export function introScreensSleep(timeline, jsPsych) {

  //===First experiment screen===//
  const welcomeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>Paldies, ka pieteicies palīdzēt!</b>
      <p>Eksperiments prasīs aptuveni 30 minūtes.</p>
      <i>Lai turpinātu, lūdzu, spied jebkuru taustiņu.</i>
      `,
  }

  //===Experiment screen where we get the internal identifier (id)===//
  const idScreen = {
    type: SurveyHtmlFormPlugin,
    html: `
      <p>Lūgums ievadīt jūsu identifikatoru.</p>
      <label>ID: </label><input name="answer" type="text" required> <br> <br>
      `,
    data: {
      task: "participants"
    },
    on_finish: function (data) {
      //Global variable to attach internal identifier to all responses
      jsPsych.data.addProperties({ "user_id": `'${data.response.answer}'` })
    }
  }

  //===Experiment screen explaining the experiment flow===//
  const fullExplanation = {
    type: FullscreenPlugin,
    message: `
      <p>Eksperiments sastāv no X uzdevumiem..</p>
      <p>Nospiežot pogu, Tu piekrīti sākt eksperimentu un eksperimenta datu apstrādei.</p> `,
    button_label: "Sākt!"
  }

  //Add the intro screens to the timeline
  timeline.push(welcomeScreen, idScreen, fullExplanation);
}