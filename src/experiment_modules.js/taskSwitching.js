import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { JsPsych } from "jspsych";

function generateTaskStimuli(count, randomization, settings) {
  const allStimuli = [];
  const currentTask = true
  for (let x = 0; x < count; x++) {
    const taskType = Math.random() < 0.5 ? currentTask : !currentTask;
    const targetReaction = Math.random() < settings.target_probability;
    let visual = ``

    if (taskType) {
      //Ja ir forma
      if (targetReaction) {
        visual = randomization.sampleWithReplacement([stim1, stim2], 1)[0]
      } else {
        visual = randomization.sampleWithReplacement([stim3, stim4], 1)[0]
      }
    } else {
      //Ja ir pildijums
      if (targetReaction) {
        visual = randomization.sampleWithReplacement([stim2, stim4], 1)[0]
      } else {
        visual = randomization.sampleWithReplacement([stim1, stim3], 1)[0]
      }
    }

    const stimulus = `
    <b>forma</b>
   <table style="border: 2px solid black; border-collapse: collapse; width: 80vw;">
    <tr style="height: 30vh; text-align: center; vertical-align: middle;margin: 10px; border: 2px solid black;">
      ${taskType ? `<td>${visual}</td>` : "<td></td>"}
    </tr>
    <tr style="height: 30vh; text-align: center; vertical-align: middle; margin: 10px; border: 2px solid black;">
      ${taskType ? "<td></td>" : `<td>${visual}</td>`}
    </tr>
  </table>
  <b>pildījums</b>
    `

    allStimuli.push({ stimulus, taskType, targetReaction });
  }
  return allStimuli;
}

function generateTrials(stimuli, isPractice, settings, jsPsych) {
  const trials = [];
  stimuli.forEach((stim, i) => {
    const trial = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: stim.stimulus,
      trial_duration: settings.response_window,
      choices: settings.reaction_buttons,
      data: {
        task: "taskSwitching",
        taskType: stim.taskType ? "form" : "fill",
        repeatTask: jsPsych.data.get().last(1).values()[0]?.taskType === stim.taskType ?? false,
        targetReaction: stim.targetReaction ? settings.reaction_buttons[0] : settings.reaction_buttons[1],
        trial_index: i,
        phase: isPractice ? "practice" : "test",
      },
      on_finish: function (data) {
        data.correct = (data.response === settings.reaction_buttons[0] && stim.targetReaction === true) ||
          (data.response === settings.reaction_buttons[1] && stim.targetReaction === false);
        data.reaction_time = data.rt !== null ? data.rt : settings.response_window;
        data.timed_out = data.rt === null;
      }
    };

    const fixation = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<div style="font-size: 30px;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 500,
    };

    // Add error feedback trial that only shows if the response was incorrect
    const errorFeedback = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<div style="font-size: 24px; color: red; text-align: center;">Nepareiza atbilde!</div>',
      choices: "NO_KEYS",
      trial_duration: 3000,
    };

    const conditionalError = {
      timeline: [errorFeedback],
      conditional_function: function () {
        const lastTrial = jsPsych.data.get().last(1).values()[0];
        return lastTrial && lastTrial.correct === false;
      }
    }

    trials.push(fixation, trial, conditionalError);
  });

  return trials;
}

export function taskSwitchingExperiment(timeline, jsPsych, settings) {
  const randomization = jsPsych.randomization;

  const explanationScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<b>Uzdevumu pārslēgšanas tests</b>
       <p>Dažos mēģinājumos jāreaģē uz <b>pildījumu</b>, dažos uz <b>formu</b>.</p>
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>`
  };
  const explanationScreen2 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<b>Uzdevumu pārslēgšanas tests</b>
       <p>Brīžos, kad simbols atrodas apakšējā kvadrātā, ir jāreaģē uz tā <b>pildījumu</b>.</p>
       <p>Ja redzi ••, spied <b>${settings.reaction_buttons[0]}</b></p>
       <p>Ja redzi •••, spied <b>${settings.reaction_buttons[1]}</b></p>
       <p>(Apakšējā piemērā jāspiež ${settings.reaction_buttons[1]})</p>
        ${exampleBottom}
       <i>Spied jebkuru taustiņu, lai turpinātu.</i>
       `

  };

  const explanationScreen3 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<b>Uzdevumu pārslēgšanas tests</b>
      <p>Brīžos, kad simbols atrodas augšējā kvadrātā, ir jāreaģē uz tā <b>formu</b>.</p>
      <p>Ja redzi <b>◇</b >, spied <b>${settings.reaction_buttons[0]}</b></p>
      <p>Ja redzi <b>□</b >, spied <b>${settings.reaction_buttons[1]}</b></p>
        <p>(Apakšējā piemērā jāspiež ${settings.reaction_buttons[0]})</p>
        ${exampleTop}
      <i>Spied jebkuru taustiņu, lai turpinātu.</i>`
  };

  const explanationScreen4 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<b>Uzdevumu pārslēgšanas tests</b>
      <p>Kad atbildēsi nepareizi, parādīsies paziņojums "Nepareiza atbilde!" un būs 3 sekunžu pauze.</p>
      <p>Centies atbildēt pēc iespējas precīzāk un ātrāk.</p>
      <i>Spied jebkuru taustiņu, lai turpinātu.</i>`
  };

  const practiceStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<h2>Treniņa daļa</h2>
      <p>Tagad sāksies treniņa daļa ar ${settings.practice_trials} mēģinājumiem.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>`
  };

  const testStart = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<h2>Galvenā testa daļa</h2>
      <p>Tagad sāksies galvenā testa daļa ar ${settings.test_trials} mēģinājumiem.</p>
      <i>Spied jebkuru taustiņu, lai sāktu.</i>`
  };

  const completionScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: function () {
      const testTrials = jsPsych.data.get().filter({ task: "taskSwitching", phase: "test" });
      const correctTrials = testTrials.filter({ correct: true });
      const totalTrials = testTrials.count();
      const correctCount = correctTrials.count();
      const trialsArray = testTrials.values();
      const averageSpeed = totalTrials > 0 ? Math.round(trialsArray.reduce((sum, trial) => sum + trial.reaction_time, 0) / totalTrials) : 0;
      const accuracy = totalTrials > 0 ? Math.round((correctCount / totalTrials) * 100) : 0;
      return `<h2>Tests pabeigts!</h2>
        <p>Tavs precizitātes rezultāts: ${accuracy}%</p>
        <p>Tavs vidējais reakcijas laiks: ${averageSpeed} ms</p>
        <i>Spied jebkuru taustiņu, lai turpinātu.</i>`;
    }
  };

  const practiceStimuli = generateTaskStimuli(settings.practice_trials, randomization, settings);
  const practiceTrials = generateTrials(practiceStimuli, true, settings, jsPsych);
  const testStimuli = generateTaskStimuli(settings.test_trials, randomization, settings);
  const testTrials = generateTrials(testStimuli, false, settings, jsPsych);

  timeline.push(explanationScreen, explanationScreen2, explanationScreen3, explanationScreen4, practiceStart, ...practiceTrials, testStart, ...testTrials, completionScreen);
}

let stim3 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="27.44 41.464 153.213 153.213" width="153.213px" height="153.213px">
  <rect x="27.44" y="41.464" width="153.213" height="153.213" style="stroke: rgb(0, 0, 0); stroke-width: 5px; fill: rgb(255, 255, 255);" transform="matrix(1, 0, 0, 1, 3.552713678800501e-15, 7.105427357601002e-15)"/>
  <g transform="matrix(1, 0, 0, 1, 0.35150259733200073, 0.3119974434375763)">
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.695" cy="71.349" rx="17.802" ry="17.802"/>
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.695" cy="118.083" rx="17.802" ry="17.802"/>
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.695" cy="164.168" rx="17.802" ry="17.802"/>
  </g>
</svg>`

let stim4 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="29.935 223.539 153.213 153.213" width="153.213px" height="153.213px">
  <rect x="29.935" y="223.539" width="153.213" height="153.213" style="stroke: rgb(0, 0, 0); stroke-width: 5px; fill: rgb(255, 255, 255);" transform="matrix(1, 0, 0, 1, 3.552713678800501e-15, 7.105427357601002e-15)"/>
  <g transform="matrix(1, 0, 0, 1, 2.68850040435791, 1.4170091152191162)">
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.853" cy="252.319" rx="17.802" ry="17.802"/>
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.853" cy="345.138" rx="17.802" ry="17.802"/>
  </g>
</svg>`

let stim1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="264.2245 9.7572 216.676 216.676" width="216.676px" height="216.676px">
  <rect x="143.463" y="127.476" width="153.213" height="153.213" style="stroke: rgb(0, 0, 0); stroke-width: 5px; fill: rgb(255, 255, 255); transform-origin: 220.069px 204.081px 0px;" transform="matrix(-0.707107007504, -0.707107007504, 0.707107007504, -0.707107007504, 152.492777558565, -85.984446021676)"/>
  <g transform="matrix(1, 0, 0, 1, 268.86700439453125, 0.3362550735473633)">
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.695" cy="71.349" rx="17.802" ry="17.802"/>
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.695" cy="118.083" rx="17.802" ry="17.802"/>
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.695" cy="164.168" rx="17.802" ry="17.802"/>
  </g>
</svg>`

let stim2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="201.0775 217.9332 216.676 216.676" width="216.676px" height="216.676px">
  <rect x="143.463" y="127.476" width="153.213" height="153.213" style="stroke: rgb(0, 0, 0); stroke-width: 5px; fill: rgb(255, 255, 255); transform-origin: 220.068px 204.081px 0px;" transform="matrix(-0.707107007504, -0.707107007504, 0.707107007504, -0.707107007504, 89.347481491745, 122.192286475956)"/>
  <g transform="matrix(1, 0, 0, 1, 205.56300354003906, 27.543201446533203)">
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.853" cy="252.319" rx="17.802" ry="17.802"/>
    <ellipse style="stroke: rgb(0, 0, 0); stroke-width: 4px; fill: rgb(255, 255, 255);" cx="103.853" cy="345.138" rx="17.802" ry="17.802"/>
  </g>
</svg>`

let exampleTop = `
<div style="display: flex; flex-direction: column; align-items: center;">
   <b>forma</b>
   <table style="border: 2px solid black; border-collapse: collapse; width: 80vw;">
    <tbody><tr style="height: 10vh; text-align: center; margin: 10px; vertical-align: middle; border: 2px solid black; height: 30vh;">
      <td>${stim2}</td>
    </tr>
    <tr style="height: 10vh; text-align: center; vertical-align: middle; border: 2px solid black;">
      <td></td>
    </tr>
  </tbody></table>
     <b>pildījums</b>
    </div>`

let exampleBottom = `
<div style="display: flex; flex-direction: column; align-items: center;">
    <b>forma</b>
   <table style="border: 2px solid black; border-collapse: collapse; width: 80vw;">
    <tbody><tr style="height: 10vh; text-align: center; vertical-align: middle; border: 2px solid black;">
      <td></td>
    </tr>
    <tr style="height: 10vh; text-align: center; vertical-align: middle; border: 2px solid black; height: 30vh;">
      <td>${stim3}</td>
    </tr>
  </tbody></table>
  <b>pildījums</b>
    </div>`