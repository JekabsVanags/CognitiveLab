import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

function generatePositions(size) {
  const positions = []
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push([i, j]);
    }
  }
  return positions
}

function generateStimuli(count, randomization, settings) {
  const allStimuli = []
  for (let x = 0; x < count; x++) {
    const containsTarget = Math.random() < settings.target_probability;
    const itemCount = settings.element_counts[randomization.randomInt(0, settings.element_counts.length - 1)]
    const positions = generatePositions(settings.grid_size)

    //Generate coordinates for items
    const itemCoordinates = randomization.sampleWithoutReplacement(positions, itemCount);
    const targetCoordinates = itemCoordinates[0]

    //Create the table of items
    let stimuli = `<table style="border-collapse: collapse; margin: 0 auto;">`; // Center the table
    for (let i = 0; i < settings.grid_size; i++) {
      stimuli += `<tr>`;
      for (let j = 0; j < settings.grid_size; j++) {
        stimuli += `<td style="width: 70px; height: 70px; text-align: center; vertical-align: middle;"> `
        if (itemCoordinates.some(coord => coord[0] === i && coord[1] === j)) {
          if (containsTarget && targetCoordinates[0] === i && targetCoordinates[1] === j) {
            //Place the target
            stimuli += `<b style="color: ${settings.color}; font-size: 50px; ${settings.flip ? "transform: scale(1, -1); display: inline-block;" : ""}">${settings.symbol}</b>`
          }
          else {
            //Generate random symbol that isnt the target
            const color = randomization.sampleWithReplacement(settings.color_variations, 1)[0]
            const symbol = randomization.sampleWithReplacement(settings.symbol_variations, 1)[0]
            let flip = settings.use_flip_variations ? Math.random() < 0.5 : false

            if (color === settings.color && symbol === settings.symbol && flip === settings.flip) {
              flip = !flip
            }

            stimuli += `<b style="color: ${color}; font-size: 50px; ${flip ? "transform: scale(1, -1); display: inline-block;" : ""}">${symbol}</b>`
          }
        }
        stimuli += `</td>`;
      }
      stimuli += `</tr>`;
    }
    stimuli += `</table>`;

    allStimuli.push({ "stimuli": stimuli, "containsTarget": containsTarget, "itemCount": itemCount })
  }

  return allStimuli
}

function generateTrials(stimuli, isPractice, settings) {
  const trials = []
  stimuli.forEach((stim, i) => {
    const trial = {
      type: HtmlKeyboardResponsePlugin,
      stimulus:
        `${stim.stimuli}
         <i>Ja redzi šo simbolu spied atsarpes taustiņu</i>`,
      trial_duration: settings.response_window,
      data: {
        task: 'visualSearch',
        numberOfItems: stim.itemCount,
        containsTarget: stim.containsTarget,
        trial_index: i,
        phase: isPractice ? 'practice' : 'test'
      },
      on_finish: function (data) {
        data.correct = (data.response !== null && stim.containsTarget) ||
          (data.response === null && !stim.containsTarget);

        data.reaction_time = data.rt !== null ? data.rt : settings.response_window;
        data.timed_out = data.rt === null;
      }
    }

    const fixation = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<div style="font-size: 30px;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 500
    };

    trials.push(fixation, trial);
  })

  return trials
}

export function visualSearchTest(timeline, jsPsych, settings) {
  const randomization = jsPsych.randomization

  // Explanation screens
  const explenationScreen1 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus:
      `<b>Vizuālās meklēšanas tests</b>
       <p>Šajā testā Tu redzēsi attēlu.</p>
       <p>Tavs mērķis ir pēc iespējas ātrāk reaģēt, ja šajā attēlā redzi</p>
       <b style="color: ${settings.color}; font-size: 30px; ${settings.flip ? "transform: scale(1, -1); display: inline-block;" : ""}">${settings.symbol}</b>
       <p>Ja redzi šo simbolu, spied <b>atstarpes</b> taustiņu</p>
       <i>Lai turpinātu lūdzu spiediet jebkutu taustiņu</i>`,
  }

  const practiceStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Treniņa daļa</h2>
      <p>Tagad sāksies treniņa daļa ar ${settings.practice_trials} mēģinājumiem.</p>
      <p>Atceries, spied <b>atstarpes</b> taustiņu, ja redzi <b style="color: ${settings.color}; font-size: 30px; ${settings.flip ? "transform: scale(1, -1); display: inline-block;" : ""}">${settings.symbol}</b></p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  const testStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Galvenā testa daļa</h2>
      <p>Tagad sāksies galvenā testa daļa ar ${settings.test_trials} mēģinājumiem.</p>
      <p>Atceries, spied <b>atstarpes</b> taustiņu, ja redzi <b style="color: ${settings.color}; font-size: 30px; ${settings.flip ? "transform: scale(1, -1); display: inline-block;" : ""}">${settings.symbol}</b>.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  const completionPracticeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const testTrials = jsPsych.data.get().filter({ task: 'visualSearch', phase: 'practice' });
      const correctTrials = testTrials.filter({ correct: true });

      const totalTrials = testTrials.count();
      const correctCount = correctTrials.count();

      const trialsArray = testTrials.values(); // Convert DataCollection to an array

      const averageSpeed = totalTrials > 0
        ? Math.round(trialsArray.reduce((sum, trial) => sum + trial.reaction_time, 0) / totalTrials)
        : 0;

      const accuracy = totalTrials > 0
        ? Math.round((correctCount / totalTrials) * 100)
        : 0;

      return `
        <h2>Tests pabeigts!</h2>
        <p>Tavs precizitātes rezultāts: ${accuracy}%</p>
        <p>Tavs vidējais reakcijas laiks: ${averageSpeed} ms</p>
        <i>Spied jebkuru taustiņu, lai turpinātu.</i>
      `;
    }
  };



  const completionScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const testTrials = jsPsych.data.get().filter({ task: 'visualSearch', phase: 'test' });
      const correctTrials = testTrials.filter({ correct: true });

      const totalTrials = testTrials.count();
      const correctCount = correctTrials.count();

      const trialsArray = testTrials.values(); // Convert DataCollection to an array

      const averageSpeed = totalTrials > 0
        ? Math.round(trialsArray.reduce((sum, trial) => sum + trial.reaction_time, 0) / totalTrials)
        : 0;

      const accuracy = totalTrials > 0
        ? Math.round((correctCount / totalTrials) * 100)
        : 0;

      return `
        <h2>Tests pabeigts!</h2>
        <p>Tavs precizitātes rezultāts: ${accuracy}%</p>
        <p>Tavs vidējais reakcijas laiks: ${averageSpeed} ms</p>
        <i>Spied jebkuru taustiņu, lai turpinātu.</i>
      `;
    }
  };



  const practiceStimuli = generateStimuli(settings.practice_trials, randomization, settings)

  const practiceTrials = generateTrials(practiceStimuli, true, settings)

  const testStimuli = generateStimuli(settings.test_trials, randomization, settings)

  const testTrials = generateTrials(testStimuli, false, settings)


  timeline.push(explenationScreen1, practiceStart, ...practiceTrials, completionPracticeScreen, testStart, ...testTrials, completionScreen)
}