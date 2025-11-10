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
import { databasePreparing } from "./data";
import fatigueExperimentWorkflow from "./workflows/fatigueExperimentWorkflow";
import agneBergaWorkflow from "./workflows/agneBergaWorkflow";
import { subjectiveCertainty } from "./experiment_modules/subjectiveCertainty";
import bfi10 from "./questionaire_modules/bfi10";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

//===Experiment step that creates the database tables necessary for the experiment===/
export const database_preparing = (experiments) => ({
  type: HtmlKeyboardResponsePlugin,
  stimulus: "Sagatavo DB eksperimenta datu ievākšanai",
  choices: "NO_KEYS",
  trial_duration: 1000,
  on_load: function () {
    databasePreparing(experiments)
    //saveDataFromJSON()
  }
})

/**Currently available experiments:
 * - nBack (fucntion name: nBackTest)
 * - visualSearch (function name: visualSearchTest)
 * - taskSwitching (function name: taskSwitchingExperiment)
 * - subjectiveCertainty (function name: subjectiveCertainty)
 * - geneveEmotionWheel(function name: geneveEmotionWheel)
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

  const experiment = jsPsych.data.getURLVariable("experiment")

  //===Place the experiment functions here===//
  agneBergaWorkflow(timeline, jsPsych)

  //===Launches the experiment===//
  await jsPsych.run(timeline);

  //return jsPsych;
}
