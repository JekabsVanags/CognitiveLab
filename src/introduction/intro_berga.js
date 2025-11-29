import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

export default function introBerga(timeline, jsPsych) {
  //===First experiment screen===//
  const welcomeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>Aicinām Jūs piedalīties pētījumā “Vairākfaktoru saistība ar vizuālo uztveri un emociju mērījumiem, izmantojot Ženēvas emociju apli",</p>
      <p>kuru veic Agne Berga, Latvijas Universitātes doktorantūras studiju ietvaros!</p>
      <i>Lai turpinātu, lūdzu, spied jebkuru taustiņu.</i>
      `,
  }

  const welcomeScreen2 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>Pētījuma ietvaros tiks pārbaudīta vairākfaktoru (personības iezīmju, depresijas iezīmju,
        noguruma izteiktība,</p><p> miegainības izteiktība) saistība ar vizuālo uztveri un izjustajām emocijām,
        to intensitāti.</p>
      `,
  }

  const welcomeScreen3 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>Dalība pētījumā ir anonīma un iegūtās atbildes tiks izmantotas un analizētas tikai apkopotā veidā.</p>
      <p>Dalība pētījumā Jums aizņems aptuveni X minūtes.</p>
      <i>Dalība ir brīvprātīga un var tikt pārtraukta jebkurā brīdī.</i>
      `,
  }

  const welcomeScreen4 = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>Pētījums ir apstiprināts Latvijas universitātes Humanitāro un sociālo zinātņu pētījumu ētikas
        komitejā, Nr. X (datums). </p>
        <p>Neskaidrību vai jautājumu gadījumā e-pasts saziņai:
        berga.agne@gmail.com</p>
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
      <p>Nospiežot pogu, Tu piekrīti sākt eksperimentu un eksperimenta datu apstrādei.</p> `,
    button_label: "Sākt!"
  }

  //Add the intro screens to the timeline
  timeline.push(welcomeScreen, welcomeScreen2, welcomeScreen3, welcomeScreen4, autoIdScreen, fullExplanation);
}