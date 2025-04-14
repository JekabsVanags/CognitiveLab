/**
 * @title CognitiveLab
 * @description Tests
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";
import { introScreens } from "./intro";
import { nBackTest } from "./experiment_modules.js/nBack";
import { visualSearchTest } from "./experiment_modules.js/visualSearching";
import { taskSwitchingExperiment } from "./experiment_modules.js/taskSwitching";
import { subjectiveCertainty } from "./experiment_modules.js/subjectiveCertainty";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();

  const timeline = []

  // Preload
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  // introScreens(timeline)

  // nBackTest(timeline, jsPsych, {
  //   n_back: 2, //How many back need to remember
  //   stimuli: ["A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T"],
  //   practice_trials: 10,
  //   test_trials: 30,
  //   stimulus_duration: 500,
  //   response_window: 3000,
  //   target_probability: 0.3 // How many matches % will be generated
  // })

  // visualSearchTest(timeline, jsPsych, {
  //   symbol: "T",
  //   color: "red",
  //   flip: false,
  //   symbol_variations: ["T", "U"],
  //   color_variations: ["red", "blue", "red"],
  //   use_flip_variations: true,
  //   grid_size: 5,
  //   element_counts: [5, 10, 15, 20],
  //   response_window: 2000,
  //   practice_trials: 10,
  //   test_trials: 50,
  //   target_probability: 0.5
  // })

  // taskSwitchingExperiment(timeline, jsPsych, {
  //   target_color: "red",
  //   target_symbol: "X",
  //   symbol_variations: ["T", "U"],
  //   color_variations: ["green", "blue"],
  //   reaction_buttons: ["b", "n"],
  //   practice_trials: 10,
  //   test_trials: 50,
  //   target_probability: 0.5,
  //   response_window: 5000,
  // })

  subjectiveCertainty(timeline, jsPsych)


  await jsPsych.run(timeline);

  return jsPsych;
}
