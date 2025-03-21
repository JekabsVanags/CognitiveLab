import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response"


function generateSequence(length, n_back, target_probability, stimuli, randomization) {
  const sequence = [];

  // Random first N positions
  for (let i = 0; i < n_back; i++) {
    sequence.push(randomization.sampleWithoutReplacement(stimuli, 1)[0]);
  }

  // Others are semi random keeping with the probability
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

    // Fixation cross
    const fixation = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<div style="font-size: 30px;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 500
    };

    // Stimulus presentation
    const stimulus = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `
        <div style="font-size: 60px;">${isPractice ? practiceInfo : ''} <span> ${letter} </span> </div>
      `,
      choices: [' '],
      stimulus_duration: settings.stimulus_duration,
      trial_duration: settings.response_window,
      data: {
        task: 'n-back',
        letter: letter,
        is_target: isTarget,
        trial_index: i,
        phase: isPractice ? 'practice' : 'test'
      },
      on_finish: function (data) {
        data.correct = (data.response !== null && isTarget) ||
          (data.response === null && !isTarget);
      }
    };

    trials.push(fixation, stimulus);
  }

  return trials;
}


export function nBackTest(timeline, jsPsych, settings) {

  // Now we need jsPsych as a parameter
  const randomization = jsPsych.randomization
  // Explanation screens
  const explenationScreen1 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus:
      `<b>N-Back īstermiņa atmiņas tests</b>
       <p>Šajā testā Tu redzēsi virkni ar burtiem. Katrs burts tiks parādīts pāris sekundes.</p>
       <p>Tev ir jāizlemj, vai šis pats burts tika rādīts arī 2 iterācijas atpakaļ, tas ir vai aizpagāšais burts sakrīt ar pašreizējo.</p>
       <p>Ja šis burts sakrīt, spied <b>atstarpes</b> taustiņu</p>
       <i>Lai turpinātu lūdzu spiediet jebkutu taustiņu</i>`,
  }

  const explenationScreen2 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus:
      `<b>N-Back īstermiņa atmiņas tests</b>
       <p>Lai palīdzētu Tev iemācīties šī testa principu, sākumā tev tiks pasniegta informācija par bijušajiem burtiem. Pēc 10 mēģinajumiem šī palīdzība pazudīs un Tev būs jāpaļaujas uz savu atmiņu.</p>
       <i>Lai turpinātu lūdzu spiediet jebkutu taustiņu</i>`,
  }

  const practiceStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Treniņa daļa</h2>
      <p>Tagad sāksies treniņa daļa ar ${settings.practice_trials} mēģinājumiem.</p>
      <p>Atceries, spied <b>atstarpes</b> taustiņu, ja burts sakrīt ar to, kas bija rādīts 2 soļus atpakaļ.</p>
      <p>Treniņa laikā tev tiks parādīti iepriekšējie burti, lai palīdzētu iemācīties uzdevumu.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  const testStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <h2>Galvenā testa daļa</h2>
      <p>Tagad sāksies galvenā testa daļa ar ${settings.test_trials} mēģinājumiem.</p>
      <p>Atceries, spied <b>atstarpes</b> taustiņu, ja burts sakrīt ar to, kas bija rādīts 2 soļus atpakaļ.</p>
      <p>Tagad tev vairs netiks rādīti iepriekšējie burti - tev būs jāpaļaujas uz savu atmiņu.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>
    `
  };

  const completionScreenPractice = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const testTrials = jsPsych.data.get().filter({ task: 'n-back', phase: 'practice' });
      const correctTrials = testTrials.filter({ correct: true });
      const accuracy = Math.round((correctTrials.count() / testTrials.count()) * 100);

      return `
        <h2>Trenniņa daļa pabeigts!</h2>
        <p>Tavs precizitātes rezultāts: ${accuracy}%</p>
        <p>Tālāk mēģini atcerēties iepriekšējo burtu!</p>
        <i>Spied jebkuru taustiņu, lai turpinātu.</i>
      `;
    }
  };

  const completionScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const testTrials = jsPsych.data.get().filter({ task: 'n-back', phase: 'test' });
      const correctTrials = testTrials.filter({ correct: true });
      const accuracy = Math.round((correctTrials.count() / testTrials.count()) * 100);

      return `
        <h2>Tests pabeigts!</h2>
        <p>Tavs precizitātes rezultāts: ${accuracy}%</p>
        <i>Spied jebkuru taustiņu, lai turpinātu.</i>
      `;
    }
  };

  // Generate practice sequence
  const practiceSequence = generateSequence(
    settings.practice_trials,
    settings.n_back,
    settings.target_probability,
    settings.stimuli,
    randomization,
  );

  // Generate test sequence
  const testSequence = generateSequence(
    settings.test_trials,
    settings.n_back,
    settings.target_probability,
    settings.stimuli,
    randomization,
  );

  // Create the trials and append them
  const practiceTrials = createTrials(practiceSequence, true, settings);
  const testTrials = createTrials(testSequence, false, settings);

  timeline.push(explenationScreen1, explenationScreen2, practiceStart, ...practiceTrials, completionScreenPractice, testStart, ...testTrials, completionScreen);
}