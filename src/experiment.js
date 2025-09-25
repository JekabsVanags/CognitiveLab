/**
 * @title CognitiveLab
 * @description Tests
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";
import { nBackTest } from "./experiment_modules.js/nBack";
import { visualSearchTest } from "./experiment_modules.js/visualSearching";
import { taskSwitchingExperiment } from "./experiment_modules.js/taskSwitching";
import { databasePreparing } from "./data";
import full_workflow from "./workflows/full_workflow";
import { geneveEmotionWheel } from "./experiment_modules.js/geneveEmotionWheel";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

//===Experiment step that creates the database tables necessary for the experiment===/
const database_preparing = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: "Sagatavo DB eksperimenta datu ievākšanai",
  choices: "NO_KEYS",
  trial_duration: 1000,
  on_load: function () {
    const experiments = ["nBack", "visualSearch", "taskSwitching"]
    databasePreparing(experiments)
    //saveDataFromJSON()
  }
}

/**Currently available experiments:
 * - nBack (fucntion name: nBackTest)
 * - visualSearch (function name: visualSearchTest)
 * - taskSwitching (function name: taskSwitchingExperiment)
 * - subjectiveCertainty (function name: subjectiveCertainty)
 */

export async function run({ assetPaths, input = {}, environment, title, version }) {
  //Create new experiment timeline
  const jsPsych = initJsPsych();
  const timeline = []

  const experimentName = jsPsych.data.getURLVariable("experiment")
  console.log(experimentName)
  // Preload
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  timeline.push(database_preparing)

  //===Place the experiment functions here===//
  switch (experimentName) {
    case "nBack":
      geneveEmotionWheel(timeline, jsPsych);
      nBackTest(timeline, jsPsych, {
        n_back: 2,
        stimuli: ["A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T"],
        practice_trials: 2,
        test_trials: 2,
        stimulus_duration: 500,
        response_window: 3000,
        target_probability: 0.3
      }, true)
      break;
    case "visualSearch":
      geneveEmotionWheel(timeline, jsPsych);
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
        practice_trials: 2,
        test_trials: 2,
        target_probability: 0.5
      }, true)
      break;
    case "taskSwitching":
      geneveEmotionWheel(timeline, jsPsych);
      taskSwitchingExperiment(timeline, jsPsych, {
        reaction_buttons: ["b", "n"],
        practice_trials: 2,
        test_trials: 2,
        target_probability: 0.5,
        response_window: 5000,
      }, true)
      break;
    case "emotionRing":
      geneveEmotionWheel(timeline, jsPsych)
      break;
    default:
      full_workflow(timeline, jsPsych)
      break;
  }

  //===Launches the experiment===//
  await jsPsych.run(timeline);

  return jsPsych;
}
