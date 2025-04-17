import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";


/**
 * Adds a visual searching test block to the jsPsych experiment timeline.
 *
 * @param {Array} timeline - The experiment timeline array to which the visual search test will be added.
 * @param {Object} jsPsych - The jsPsych instance used to build the experiment.
 * @param {Object} settings - Configuration object for the visual search test.
 * @param {string} settings.symbol - The symbol that participants are looking for.
 * @param {string} settings.color - The color of the findable symbol.
 * @param {boolean} settings.flip - Whether to flip the findable symbol.
 * @param {string[]} settings.symbol_variations - Array of possible symbol variations.
 * @param {string[]} settings.color_variations - Array of possible color variations for the symbols.
 * @param {boolean} settings.use_flip_variations - Whether to use flipped symbol variations.
 * @param {number} settings.grid_size - The number of elements in the visual grid.
 * @param {number[]} settings.element_counts - Array specifying the different numbers of elements to be shown in the grid.
 * @param {number} settings.response_window - The time (in milliseconds) the participant has to respond after each stimulus.
 * @param {number} settings.practice_trials - The number of practice trials before the main test block.
 * @param {number} settings.test_trials - The number of test trials in the main block.
 * @param {number} settings.target_probability - The probability (0–1) that a given trial will be a target.
 */

export function visualSearchTest(timeline, jsPsych, settings) {

  //===Experiment step that explains the task===//
  const explenationScreen1 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>Vizuālās meklēšanas tests</b>
      <p>Šajā testā Tu redzēsi attēlu.</p>
      <p>Tavs mērķis ir pēc iespējas ātrāk reaģēt, ja šajā attēlā redzi</p>
      <b style="color: ${settings.color}; font-size: 30px; ${settings.flip ? 'transform: scale(1, -1); display: inline-block;' : ''}">${settings.symbol}</b>
      <p>Ja redzi šo simbolu, spied <b>atstarpes</b> taustiņu.</p>
      <i>Lai turpinātu, lūdzu, spied jebkuru taustiņu.</i>
       `,
  }

  //===Experiment step that starts the practice===//
  const practiceStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Treniņa daļa</h2>
      <p>Tagad sāksies treniņa daļa ar ${settings.practice_trials} mēģinājumiem.</p>
      <p>Atceries, spied <b>atstarpes</b> taustiņu, ja redzi <b style="color: ${settings.color}; font-size: 30px; ${settings.flip ? 'transform: scale(1, -1); display: inline-block;' : ''}">${settings.symbol}</b>.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  //===Experiment step that starts the main test===//
  const testStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Galvenā testa daļa</h2>
      <p>Tagad sāksies galvenā testa daļa ar ${settings.test_trials} mēģinājumiem.</p>
      <p>Atceries, spied <b>atstarpes</b> taustiņu, ja redzi <b style="color: ${settings.color}; font-size: 30px; ${settings.flip ? 'transform: scale(1, -1); display: inline-block;' : ''}">${settings.symbol}</b>.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  //===Experiment step that finishes the training part===//
  const completionPracticeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
        <h2>Treniņa daļa pabeigta!</h2>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  };

  //===Experiment step that finishes the visualSearching experiment===//
  const completionScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
        <h2>Vizuālās meklēšanas tests pabeigts!</h2>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  };

  //Generate the stimuli (images) for the experiment
  const practiceStimuli = generateStimuli(settings.practice_trials, jsPsych.randomization, settings)
  const testStimuli = generateStimuli(settings.test_trials, jsPsych.randomization, settings)

  //Generate the trials based on the images
  const practiceTrials = generateTrials(practiceStimuli, true, settings)
  const testTrials = generateTrials(testStimuli, false, settings)

  //Add the trials to the timeline
  timeline.push(
    explenationScreen1,
    practiceStart,
    ...practiceTrials,
    completionPracticeScreen,
    testStart,
    ...testTrials,
    completionScreen)
};

//===Helper function to generate all possible coordinates in a grid of x*x===//
function generatePositions(size) {
  const positions = []
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      positions.push([i, j]);
    }
  }
  return positions
}

//===Create an array of stimuli for the experiment===//
function generateStimuli(count, randomization, settings) {
  const allStimuli = []

  for (let x = 0; x < count; x++) {

    //Check if the generated image needs to include the target based on set probability
    const containsTarget = Math.random() < settings.target_probability;

    //Randomly decide how many elements the image will contain from list of possible ammounts
    const itemCount = settings.element_counts[randomization.randomInt(0, settings.element_counts.length - 1)]
    const positions = generatePositions(settings.grid_size)

    //Randomly pick coordinates for elements
    const itemCoordinates = randomization.sampleWithoutReplacement(positions, itemCount);
    //If the target is needed, the first element becomes the target (in an unordered list)
    const targetCoordinates = itemCoordinates[0]

    //Generate the table that contains the elements (the image)
    let stimuli = `<table style="border-collapse: collapse; margin: 0 auto;">`; // Center the table

    for (let i = 0; i < settings.grid_size; i++) {
      stimuli += `<tr>`;
      for (let j = 0; j < settings.grid_size; j++) {
        stimuli += `<td style="width: 70px; height: 70px; text-align: center; vertical-align: middle;"> `

        //If the table cell contains element
        if (itemCoordinates.some(coord => coord[0] === i && coord[1] === j)) {
          if (containsTarget && targetCoordinates[0] === i && targetCoordinates[1] === j) {
            //And the element is the target, then place target element
            stimuli += `<b style="color: ${settings.color}; font-size: 50px; ${settings.flip ? "transform: scale(1, -1); display: inline-block;" : ""}">${settings.symbol}</b>`
          }
          else {
            //Otherwise generate random element that isnt the target
            const color = randomization.sampleWithReplacement(settings.color_variations, 1)[0]
            const symbol = randomization.sampleWithReplacement(settings.symbol_variations, 1)[0]
            let flip = settings.use_flip_variations ? Math.random() < 0.5 : false

            //If we have generated the target we flip it
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

    //Add the created table (image) to the array of stimuli
    allStimuli.push({ "stimuli": stimuli, "containsTarget": containsTarget, "itemCount": itemCount })
  }

  return allStimuli
}

//===Based on array of stimuli create array of trials===//
function generateTrials(stimuli, isPractice, settings) {
  const trials = []

  stimuli.forEach((stim, i) => {

    //===Experiment step that displays the stimuli===//
    const trial = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `${stim.stimuli}`,
      trial_duration: settings.response_window,
      data: {
        task: 'visualSearch',
        numberOfItems: stim.itemCount,
        containsTarget: stim.containsTarget,
        trial_index: i,
        phase: isPractice ? 'practice' : 'test'
      },
      on_finish: function (data) {
        //If responded correctly
        data.correct = (data.response !== null && stim.containsTarget) ||
          (data.response === null && !stim.containsTarget);

        //How fast responded
        data.reaction_time = data.rt !== null ? data.rt : settings.response_window;
      }
    }

    //===Experiment step with fixation cross===//
    const fixation = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<div style="font-size: 30px;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 500
    };

    //Add fixation cross and the stimulus to the trial list
    trials.push(fixation, trial);
  })

  return trials
}