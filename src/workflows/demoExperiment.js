export default function demoExperiment(timeline, experimentName) {
  switch (experimentName) {
    case "nBack":
      timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: `<p style="font-size: 30px;">Lūdzu, spied pogu, lai sāktu eksperimentu!</p>`,
        button_label: "Sākt!"
      });
      nBackTest(timeline, jsPsych, {
        n_back: 2,
        stimuli: ["A", "B", "C", "D", "E", "H", "I", "K", "L", "M", "O", "P", "R", "S", "T"],
        practice_trials: 10,
        test_trials: 30,
        stimulus_duration: 500,
        response_window: 3000,
        target_probability: 0.3
      }, true)
      break;
    case "visualSearch":
      timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: `<p style="font-size: 30px;">Lūdzu, spied pogu, lai sāktu eksperimentu!</p>`,
        button_label: "Sākt!"
      });
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
        test_trials: 30,
        target_probability: 0.5
      }, true)
      break;
    case "taskSwitching":
      timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: `<p style="font-size: 30px;">Lūdzu, spied pogu, lai sāktu eksperimentu!</p>`,
        button_label: "Sākt!"
      });
      taskSwitchingExperiment(timeline, jsPsych, {
        reaction_buttons: ["b", "n"],
        practice_trials: 10,
        test_trials: 30,
        target_probability: 0.5,
        response_window: 5000,
      }, true)
      break;
    case "emotionWheel":
      timeline.push({
        type: FullscreenPlugin,
        fullscreen_mode: true,
        message: `<p style="font-size: 30px;">Lūdzu, spied pogu, lai sāktu eksperimentu!</p>`,
        button_label: "Sākt!"
      });
      geneveEmotionWheel(timeline, jsPsych)
      break;
    default:
      //full_workflow(timeline, jsPsych)
      timeline.push({
        type: HtmlKeyboardResponsePlugin,
        stimulus: `
          <p style="font-size: 30px;">Lūdzu, izvēlies eksperimentu!</p>
          <div style="margin-top:20px;">
            <button style="padding: 10px 20px 10px 20px; text-align: center; border-radius: 8px; background: #eee;" onclick="window.location.href='?experiment=nBack'">Atmiņa</button>
            <button style="padding: 10px 20px 10px 20px; text-align: center; border-radius: 8px; background: #eee;" onclick="window.location.href='?experiment=taskSwitching'">Daudzuzdevumu veikšana</button>
            <button style="padding: 10px 20px 10px 20px; text-align: center; border-radius: 8px; background: #eee;" onclick="window.location.href='?experiment=visualSearch'">Vizuālā meklēšana</button>
          </div>
        `,
        choices: "NO_KEYS"
      });
      break;
  }
}