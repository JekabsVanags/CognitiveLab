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
import { introScreens } from "./intro";
import { nBackTest } from "./experiment_modules.js/nBack";
import { visualSearchTest } from "./experiment_modules.js/visualSearching";
import { taskSwitchingExperiment } from "./experiment_modules.js/taskSwitching";
import { subjectiveCertainty } from "./experiment_modules.js/subjectiveCertainty";
import { databasePreparing, dataProcessing } from "./data";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

//===Experiment step that processes the data of experiments till then===//
const data_processing = (jsPsych) => {
  return (
    {
      type: HtmlKeyboardResponsePlugin,
      stimulus: "Dati tiek apstrādāti un saglabāti",
      on_load: function () {

        //Filter out the significant data (ones that are tied to a task)
        const filtered = jsPsych.data.get().trials.filter((d) => d.task != null)

        //For each record process it (save to DB) and show in console as JSON
        const data = filtered.map((d) => dataProcessing(d)).filter((item) => item !== null)
        console.log(data)
      }
    }
  )
}

//===Experiment step that creates the database tables necessary for the experiment===/
const database_preparing = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: "Sagatavo DB eksperimenta datu ievākšanai",
  on_load: function () {
    const experiments = ["nBack", "visualSearch", "taskSwitching", "subjectiveCertainty"]
    databasePreparing(experiments)
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

  // Preload
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  introScreens(timeline, jsPsych)

  // nBackTest(timeline, jsPsych, {
  //   n_back: 2, //How many back need to remember
  //   stimuli: ["A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T"],
  //   practice_trials: 10,
  //   test_trials: 30,
  //   stimulus_duration: 500,
  //   response_window: 3000,
  //   target_probability: 0.3 // How many matches % will be generated
  // })


  visualSearchTest(timeline, jsPsych, {
    symbol: "T",
    color: "red",
    flip: false,
    symbol_variations: ["T", "U"],
    color_variations: ["red", "blue", "red"],
    use_flip_variations: true,
    grid_size: 5,
    element_counts: [5, 10, 15, 20],
    response_window: 2000,
    practice_trials: 10,
    test_trials: 10, //Aizvietot ar 50
    target_probability: 0.5
  })

  timeline.push(data_processing(jsPsych));

  // taskSwitchingExperiment(timeline, jsPsych, {
  //   target_color: "red",
  //   target_symbol: "X",
  //   symbol_variations: ["T", "U"],
  //   color_variations: ["green", "blue"],
  //   reaction_buttons: ["b", "n"],
  //   practice_trials: 10,
  //   test_trials: 10, //Aizvietot ar 50
  //   target_probability: 0.5,
  //   response_window: 5000,
  // })

  // subjectiveCertainty(timeline, jsPsych)

  // timeline.push(data_processing)

  await jsPsych.run(timeline);

  return jsPsych;
}
