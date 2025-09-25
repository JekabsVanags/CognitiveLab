import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response"


/**
 * Adds an n-Back test block to the jsPsych experiment timeline.
 *
 * @param {Array} timeline - The experiment timeline array to which the n-Back test will be added.
 * @param {Object} jsPsych - The jsPsych instance used to build the experiment.
 * @param {Object} settings - Configuration object for the n-Back test.
 * @param {number} settings.n_back - How many steps back the participant must remember (e.g., 2 for 2-Back).
 * @param {string[]} settings.stimuli - Array of possible textual stimuli to be used in the test (e.g., letters).
 * @param {number} settings.practice_trials - Number of practice trials to include before the actual test.
 * @param {number} settings.test_trials - Number of test trials in the main block.
 * @param {number} settings.stimulus_duration - Duration (in milliseconds) that each stimulus is shown.
 * @param {number} settings.response_window - Time (in milliseconds) the participant has to respond after each stimulus.
 * @param {number} settings.target_probability - Probability (0–1) that a given trial will be a target (i.e., matches the one n-back).
 * @param {boolean} [showStats=false] - Whether to show statistics on the completion screen.
 */

export function nBackTest(timeline, jsPsych, settings, showStats = false) {

  //===Experiment step that explains the task===//
  const explenationScreen1 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>N-Back īstermiņa atmiņas tests</b>
      <p>Šajā testā Tu redzēsi virkni burtu. Katrs burts tiks parādīts uz pāris sekundēm.</p>
      <p>Tev būs jāizlemj, vai šis pats burts tika rādīts arī 2 iterācijas atpakaļ — proti, vai aizpagājušais burts sakrīt ar pašreizējo.</p>
      <p>Ja burts sakrīt, spied <b>atstarpes</b> taustiņu.</p>
      <i>Lai turpinātu, lūdzu, spied jebkuru taustiņu.</i>
       `,
  }

  //===Experiment step that explains the training part===//
  const explenationScreen2 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>N-Back īstermiņa atmiņas tests</b>
      <p>Lai palīdzētu Tev apgūt šī testa principu, sākumā tiks rādīta informācija par iepriekšējiem burtiem.</p>
      <p>Pēc 10 mēģinājumiem šī palīdzība pazudīs, un Tev būs jāpaļaujas uz savu atmiņu.</p>
      <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `
  }

  //===Experiment step that starts the practice===//
  const practiceStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Treniņa daļa</h2>
      <p>Tagad sāksies treniņa daļa ar ${settings.practice_trials} mēģinājumiem.</p>
      <p>Atceries: spied <b>atstarpes</b> taustiņu, ja burts sakrīt ar to, kas tika rādīts ${settings.n_back} soļus iepriekš.</p>
      <p>Treniņa laikā Tev tiks parādīti iepriekšējie burti, lai atvieglotu uzdevuma apguvi.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  //===Experiment step that starts the main test===//
  const testStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Galvenā testa daļa</h2>
      <p>Tagad sāksies galvenā testa daļa ar ${settings.test_trials} mēģinājumiem.</p>
      <p>Atceries: spied <b>atstarpes</b> taustiņu, ja burts sakrīt ar to, kas tika rādīts 2 soļus iepriekš.</p>
      <p>Šoreiz Tev vairs netiks rādīti iepriekšējie burti — būs jāpaļaujas uz savu atmiņu.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  //===Experiment step that finishes the training part===//
  const completionScreenPractice = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
        <h2>Treniņa daļa pabeigta!</h2>
        <p>Tālāk mēģini atcerēties iepriekšējo burtu bez palīdzības!</p>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `
  };

  //===Experiment step that finishes the nBack experiment===//
  const completionScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function() {
      if (!showStats) {
        return `
          <h2>Tests pabeigts!</h2>
          <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
        `;
      }
      // Get all test trial data
      const testData = jsPsych.data.get().filter({task: 'nBack', phase: 'test'});
      const total = testData.count();
      const correct = testData.filter({correct: true}).count();
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        // Calculate average reaction time for correct responses
      const correctRTs = testData.select('rt').values;
      const avgRT = correctRTs.length > 0
        ? Math.round(correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length)
        : '—';

      return `
        <h2>Tests pabeigts!</h2>
        <p>Tu atbildēji pareizi uz <b>${correct}</b> no <b>${total}</b> mēģinājumiem.</p>
        <p>Tava precizitāte: <b>${accuracy}%</b></p>
        <p>Vidējais reakcijas laiks: <b>${avgRT} ms</b></p>
        <i>Nospied jebkuru taustiņu, lai turpinātu.</i>
      `;
    }
  };

  // Generate practice sequences
  const practiceSequence = generateSequence(
    settings.practice_trials,
    settings.n_back,
    settings.target_probability,
    settings.stimuli,
    jsPsych.randomization,
  );

  // Generate test sequences
  const testSequence = generateSequence(
    settings.test_trials,
    settings.n_back,
    settings.target_probability,
    settings.stimuli,
    jsPsych.randomization,
  );

  // Create the trials and append them to the timeline
  const practiceTrials = createTrials(practiceSequence, true, settings);
  const testTrials = createTrials(testSequence, false, settings);
  timeline.push(
    explenationScreen1,
    explenationScreen2,
    practiceStart,
    ...practiceTrials,
    completionScreenPractice,
    testStart,
    ...testTrials,
    completionScreen);
};

//===Create an array of stimuli for the experiment===//
function generateSequence(length, n_back, target_probability, stimuli, randomization) {
  const sequence = [];

  // Random first N positions
  for (let i = 0; i < n_back; i++) {
    sequence.push(randomization.sampleWithoutReplacement(stimuli, 1)[0]);
  }

  // Others are semi random, keeping with the set probability
  for (let i = n_back; i < length; i++) {
    const isTarget = Math.random() < target_probability;

    if (isTarget) {
      // If we need a match we use current - n 
      sequence.push(sequence[i - n_back]);
    } else {
      // Otherwise create new random letter that is not a match
      sequence.push(randomization.sampleWithoutReplacement(stimuli.filter(e => e !== sequence[i - n_back]), 1)[0]);
    }
  }

  return sequence;
}

//===Based on array of stimuli create array of trials===//
function createTrials(sequence, isPractice, settings) {
  const trials = [];
  const previousLetters = [];

  for (let i = 0; i < sequence.length; i++) {
    const letter = sequence[i];

    // Add current letter to history
    previousLetters.push(letter);
    if (previousLetters.length > settings.n_back + 1) {
      previousLetters.shift();
    }

    // Determine if this is a target trial
    const isTarget = i >= settings.n_back && letter === sequence[i - settings.n_back];

    // Information for practice mode
    let practiceInfo = '';
    if (isPractice) {
      for (let j = 0; j < previousLetters.length - 1; j++) {
        practiceInfo += `<span style="color: gray; margin-right: 30px">${previousLetters[j]}</span>`;
      }
    }

    //===Experiment step with fixation cross===//
    const fixation = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<div style="font-size: 30px;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 500
    };

    //===Experiment step with stimulus presentation===//
    const stimulus = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `
        <div style="font-size: 60px;">${isPractice ? practiceInfo : ''} <span> ${letter} </span> </div>
      `,
      choices: [' '],
      stimulus_duration: settings.stimulus_duration,
      trial_duration: settings.response_window,
      data: {
        task: 'nBack',
        letter: letter,
        isTarget: isTarget,
        trialIndex: i,
        phase: isPractice ? 'practice' : 'test'
      },
      on_finish: function (data) {
        //If responded correctly
        data.correct = (data.response !== null && isTarget) ||
          (data.response === null && !isTarget);
      }
    };

    //Add fixation cross and the stimulus to the trial list
    trials.push(fixation, stimulus);
  }

  return trials;
}