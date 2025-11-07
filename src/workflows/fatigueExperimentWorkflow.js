import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { dataSavingStep } from "../data";
import { database_preparing } from "../experiment";
import geneveEmotionWheel from "../experiment_modules.js/geneveEmotionWheel";
import nBackTest from "../experiment_modules.js/nBack";
import taskSwitchingExperiment from "../experiment_modules.js/taskSwitching";
import visualSearchTest from "../experiment_modules.js/visualSearching";
import { introScreensSleep } from "../introduction/intro_sleep_tests";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";

export default function fatigueExperimentWorkflow(timeline, jsPsych) {
  jsPsych.data.addProperties({ "experiment_name": "Fatigue experiment" })

  timeline.push(database_preparing(["nBack", "visualSearch", "taskSwitching", "geneveEmotionWheel"]))

  introScreensSleep(timeline, jsPsych)
  timeline.push(dataSavingStep(jsPsych, "participants"));


  geneveEmotionWheel(timeline, jsPsych)
  timeline.push(dataSavingStep(jsPsych, "geneveEmotionWheel"));


  nBackTest(timeline, jsPsych, {
    n_back: 2,
    stimuli: ["A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T"],
    practice_trials: 10,
    test_trials: 10,
    stimulus_duration: 500,
    response_window: 3000,
    target_probability: 0.3
  }, false)
  timeline.push(dataSavingStep(jsPsych, "nBack"));

  visualSearchTest(timeline, jsPsych, {
    symbol: "T",
    color: "red",
    flip: false,
    symbol_variations: ["T"],
    color_variations: ["red", "blue"],
    use_flip_variations: true,
    grid_size: 5,
    element_counts: [5, 10, 15, 20],
    response_window: 2000,
    practice_trials: 10,
    test_trials: 10,
    target_probability: 0.5
  }, false)
  timeline.push(dataSavingStep(jsPsych, "visualSearch"));

  taskSwitchingExperiment(timeline, jsPsych, {
    reaction_buttons: ["b", "n"],
    practice_trials: 10,
    test_trials: 10,
    target_probability: 0.5,
    response_window: 5000,
  }, false)
  timeline.push(dataSavingStep(jsPsych, "taskSwitching"));


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