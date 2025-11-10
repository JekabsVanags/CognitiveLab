import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { dataSavingStep } from "../data";
import { database_preparing } from "../experiment";
import geneveEmotionWheel from "../experiment_modules/geneveEmotionWheel";
import nBackTest from "../experiment_modules/nBack";
import taskSwitchingExperiment from "../experiment_modules/taskSwitching";
import visualSearchTest from "../experiment_modules/visualSearching";
import { introScreensSleep } from "../introduction/intro_sleep_tests";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import bfi10 from "../questionaire_modules/bfi10";
import introBerga from "../introduction/intro_berga";
import fss from "../questionaire_modules/fss";
import fss_questionaire from "../questionaire_modules/fss";
import bfi10_questionaire from "../questionaire_modules/bfi10";
import ess_questionaire from "../questionaire_modules/ess";
import phq9_questionaire from "../questionaire_modules/phq9";

export default function agneBergaWorkflow(timeline, jsPsych) {
  jsPsych.data.addProperties({ "experiment_name": "Agne Berga experiment" })

  timeline.push(database_preparing(["visualSearch", "geneveEmotionWheel", "likertSurvey"]))

  introBerga(timeline, jsPsych)
  timeline.push(dataSavingStep(jsPsych, "participants"));

  // geneveEmotionWheel(timeline, jsPsych)
  // timeline.push(dataSavingStep(jsPsych, "geneveEmotionWheel"));

  // visualSearchTest(timeline, jsPsych, {
  //   symbol: "T",
  //   color: "red",
  //   flip: false,
  //   symbol_variations: ["T"],
  //   color_variations: ["red", "blue"],
  //   use_flip_variations: true,
  //   grid_size: 5,
  //   element_counts: [5, 10, 15, 20],
  //   response_window: 2000,
  //   practice_trials: 10,
  //   test_trials: 10,
  //   target_probability: 0.5
  // }, false)
  // timeline.push(dataSavingStep(jsPsych, "visualSearch"));

  bfi10_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "bfi10"));
  fss_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "fss"));
  phq9_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "phq9"));
  ess_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "ess"));

  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: false
  });

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
    <p style="font-size: 30px;">Paldies par dalību!</p>
  `,
    choices: "NO_KEYS"
  });
}