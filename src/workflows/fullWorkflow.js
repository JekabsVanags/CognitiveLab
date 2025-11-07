import { nBackTest } from "../experiment_modules.js/nBack";
import { taskSwitchingExperiment } from "../experiment_modules.js/taskSwitching";
import { visualSearchTest } from "../experiment_modules.js/visualSearching";
import { introScreens } from "../introduction/intro_jv_bakalaurs";
import { dataSavingStep } from "../data";

export default function full_workflow(timeline, jsPsych) {
  introScreens(timeline, jsPsych)

  nBackTest(timeline, jsPsych, {
    n_back: 2,
    stimuli: ["A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T"],
    practice_trials: 2,
    test_trials: 2,
    stimulus_duration: 500,
    response_window: 3000,
    target_probability: 0.3
  })
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
    practice_trials: 2,
    test_trials: 2,
    target_probability: 0.5
  })
  timeline.push(dataSavingStep(jsPsych, "visualSearch"));

  taskSwitchingExperiment(timeline, jsPsych, {
    reaction_buttons: ["b", "n"],
    practice_trials: 2,
    test_trials: 2,
    target_probability: 0.5,
    response_window: 5000,
  })
  timeline.push(dataSavingStep(jsPsych, "taskSwitching"));

  return timeline
}
