import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response"
import geneveEmotionWheel from "./geneveEmotionWheel";

export default function imageEmotionClassier(timeline, jsPsych) {
  //===Experiment step that explains the task===//
  timeline.push(
    {
      type: HtmlKeyboardResponsePlugin,
      stimulus: '<p>Tu redzēsi attēlus, pēc kā tiks prasīts atkārtoti novērtēt savas emociijas.</p>',
    }
  );
  for (let i = 1; i <= 2; i++) {
    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus: "",
      on_start: function (trial) {
        let group = jsPsych.data.get().last(1).values()[0].user_id.slice(-1);
        trial.stimulus = `<img src="assets/emotion_image_classifier/group_${group}/img_${i}.png" style="width:200px;">`;

      },
      on_finish: function (data) {
        let group = jsPsych.data.get().last(1).values()[0].user_id.slice(-1);
        data.image_name = `group_${group}/img_${i}.png`
        data.task = "imageEmotionClassifier"
      }
    });

    geneveEmotionWheel(timeline, jsPsych, "imageEmotionClassifier");
  }
}