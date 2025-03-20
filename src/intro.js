import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

export function introScreens(timeline) {
  const welcomeScreen = {
    type: HtmlKeyboardResponsePlugin,
    stimulus:
      `<b>Paldies, ka pieteicaties palīdzēt!</b>
      <p>Eksperiments prasīs aptuveni 20 minūtes</p>
      <i>Lai turpinātu lūdzu spiediet jebkutu taustiņu</i>`,
  }

  const fullExplanation = {
    type: FullscreenPlugin,
    message:
      `<p>Kopējais eksperiments dalīsies 4 daļās</p>
      <p>Nospiežot pogu Jūs piekrītiet sākt eksperimentu</p>`,
    button_label: "Sākt"
  }

  timeline.push(welcomeScreen, fullExplanation);
}