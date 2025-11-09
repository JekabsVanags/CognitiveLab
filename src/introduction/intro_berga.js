import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

export default function introBerga(timeline, jsPsych) {
  //===First experiment screen===//
  const welcomeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <b>Paldies, ka pieteicies palīdzēt!</b>
      <p>Eksperiments prasīs aptuveni ? minūtes.</p>
      <i>Lai turpinātu, lūdzu, spied jebkuru taustiņu.</i>
      `,
  }

  //===Experiment screen where we get automated ID===//
  const autoIdScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>Sistēma jums piešķir identifikatoru...</p>`,
    choices: "NO_KEYS",
    trial_duration: 1000,
    data: { task: "participants" },
    on_start: async function (trial) {
      try {
        const response = await fetch('http://localhost:3001/api/experiment/last_id');
        const data = await response.json();
        console.log(data)

        const userGroup = ((data.last_id + 5) % 3) + 1;
        const userID = `U${data.last_id + 1}G${userGroup}`;
        trial.data.response = { answer: userID };
        jsPsych.data.addProperties({ user_id: userID });

        console.log('Assigned user ID:', userID);
      } catch (error) {
        console.error('Failed to fetch next ID:', error);
      }
    }
  };


  //===Experiment screen explaining the experiment flow===//
  const fullExplanation = {
    type: FullscreenPlugin,
    message: `
      <p>Eksperiments sastāvēs no 4 testiem un 1 uzdevuma.</p>
      <p>Nospiežot pogu, Tu piekrīti sākt eksperimentu un eksperimenta datu apstrādei.</p> `,
    button_label: "Sākt!"
  }

  //Add the intro screens to the timeline
  timeline.push(welcomeScreen, autoIdScreen, fullExplanation);
}