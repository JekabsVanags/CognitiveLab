import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { dataSavingStep, dataSavingStepDeographic, imageEmotionDataSavingStep } from "../data";
import { database_preparing } from "../experiment";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import introBerga from "../introduction/intro_berga";
import bfi10_questionaire from "../questionaire_modules/bfi10";
import imageEmotionClassier from "../experiment_modules/imageEmotionClassifer";
import tas20_questionaire from "../questionaire_modules/tas20";
import fss_questionaire from "../questionaire_modules/fss";
import ess_questionaire from "../questionaire_modules/ess";
import phq9_questionaire from "../questionaire_modules/phq9";
import geneveEmotionWheel from "../experiment_modules/geneveEmotionWheel";
import demographic_berga from "../demographic/demographic_berga";
import visualSearchTest from "../experiment_modules/visualSearching";



export default function agneBergaWorkflow(timeline, jsPsych) {
  jsPsych.data.addProperties({ "experiment_name": "Agne Berga experiment" })

  timeline.push(database_preparing(["visualSearch", "geneveEmotionWheel", "likertSurvey", "imageEmotionTask", "demographic"]))

  introBerga(timeline, jsPsych)
  timeline.push(dataSavingStep(jsPsych, "participants"));

  //Initial emotions
  geneveEmotionWheel(timeline, jsPsych)
  timeline.push(dataSavingStep(jsPsych, "geneveEmotionWheel"));

  //Questionaires
  fss_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "fss"));
  ess_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "ess"));

  imageEmotionClassier(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "imageEmotionClassifier"));

  //Visual search as in my bachelors
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
    practice_trials: 15,
    test_trials: 30,
    target_probability: 0.5
  }, false)
  timeline.push(dataSavingStep(jsPsych, "visualSearch"));

  phq9_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "phq9"));
  bfi10_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "bfi10"));
  tas20_questionaire(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "tas20"));

  demographic_berga(timeline, jsPsych);
  timeline.push(dataSavingStep(jsPsych, "demographic"));

  timeline.push({
    type: FullscreenPlugin,
    fullscreen_mode: false
  });

  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
    <p style="font-size: 30px;">Paldies par Jūsu atvēlēto laiku dalībai pētījumā!</p>
  `,
    choices: "NO_KEYS"
  });
}