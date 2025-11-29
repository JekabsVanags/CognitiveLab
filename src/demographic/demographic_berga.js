import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyHtmlFormPlugin from "@jspsych/plugin-survey-html-form";

export default function demographic(timeline, jsPsych) {
  // Question 1: Gender
  const genderQuestion = {
    type: SurveyHtmlFormPlugin,
    html: `
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 20px;"><b>Kāds ir Jūsu dzimums?</b></p>
        <div style="display: inline-block; text-align: left;">
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="gender" value="Sieviete" required style="margin-right: 10px;">
            Sieviete
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="gender" value="Vīrietis" required style="margin-right: 10px;">
            Vīrietis
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="gender" value="Cits" required style="margin-right: 10px;">
            Cits
          </label>
        </div>
      </div>
    `,
    button_label: "Turpināt",
    on_finish: function (data) {
      const genderMap = { "Sieviete": 1, "Vīrietis": 2, "Cits": 3 };
      const gender = genderMap[data.response.gender]; // 1=Sieviete, 2=Vīrietis, 3=Cits
      jsPsych.data.addProperties({ gender });
    },
  };
  timeline.push(genderQuestion);

  // Question 2: Age (dropdown)
  const ageOptions = [];
  for (let i = 18; i <= 100; i++) {
    ageOptions.push(`<option value="${i}">${i}</option>`);
  }

  const ageQuestion = {
    type: SurveyHtmlFormPlugin,
    html: `
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 20px;"><b>Kāds ir Jūsu vecums (gadi)?</b></p>
        <select name="age" id="age-select" required style="width: 200px; padding: 8px; margin-bottom: 10px; font-size: 16px;">
          <option value="" disabled selected>Izvēlieties vecumu</option>
          ${ageOptions.join("")}
        </select>
      </div>
    `,
    button_label: "Turpināt",
    autofocus: "age-select",
    on_finish: function (data) {
      const age = parseInt(data.response.age);
      jsPsych.data.addProperties({ age });
    },
  };
  timeline.push(ageQuestion);

  // Question 3: Employment
  const employmentQuestion = {
    type: SurveyHtmlFormPlugin,
    html: `
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 20px;"><b>Vai Jūs strādājat, esat darba attiecībās?</b></p>
        <div style="display: inline-block; text-align: left;">
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="employment" value="Strādāju pilna laika darbu" required style="margin-right: 10px;">
            Strādāju pilna laika darbu
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="employment" value="Strādāju nepilna laika darbu" required style="margin-right: 10px;">
            Strādāju nepilna laika darbu
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="employment" value="Nestrādāju" required style="margin-right: 10px;">
            Nestrādāju
          </label>
        </div>
      </div>
    `,
    button_label: "Turpināt",
    on_finish: function (data) {
      const employmentMap = {
        "Strādāju pilna laika darbu": 1,
        "Strādāju nepilna laika darbu": 2,
        "Nestrādāju": 3
      };
      const employment = employmentMap[data.response.employment]; // 1=Pilns laiks, 2=Nepilns laiks, 3=Nestrādāju
      jsPsych.data.addProperties({ employment });
    },
  };
  timeline.push(employmentQuestion);

  // Question 4: Student status
  const studentQuestion = {
    type: SurveyHtmlFormPlugin,
    html: `
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 20px;"><b>Vai Jūs esat students/e?</b></p>
        <div style="display: inline-block; text-align: left;">
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="student" value="Jā" required style="margin-right: 10px;">
            Jā
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="student" value="Nē" required style="margin-right: 10px;">
            Nē
          </label>
        </div>
      </div>
    `,
    button_label: "Turpināt",
    on_finish: function (data) {
      const studentMap = { "Jā": 1, "Nē": 2 };
      const student = studentMap[data.response.student]; // 1=Jā, 2=Nē
      jsPsych.data.addProperties({ student });
    },
  };
  timeline.push(studentQuestion);

  // Question 5: Has children
  const hasChildrenQuestion = {
    type: SurveyHtmlFormPlugin,
    html: `
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 20px;"><b>Vai Jums ir nepilngadīgi bērni (ar kuriem dzīvojat kopā)?</b></p>
        <div style="display: inline-block; text-align: left;">
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="has_children" value="Jā" required style="margin-right: 10px;">
            Jā
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
            <input type="radio" name="has_children" value="Nē" required style="margin-right: 10px;">
            Nē
          </label>
        </div>
      </div>
    `,
    button_label: "Turpināt",
    data: {
      question: "has_children"
    },
    on_finish: function (data) {
      const childrenMap = { "Jā": 1, "Nē": 2 };
      const response_coded = childrenMap[data.response.has_children]; // 1=Jā, 2=Nē\
      data.response_coded = response_coded;
      jsPsych.data.addProperties({ has_children: response_coded });
    },
  };
  timeline.push(hasChildrenQuestion);

  // Question 6: Young children (conditional)
  const youngChildrenQuestion = {
    timeline: [
      {
        type: SurveyHtmlFormPlugin,
        html: `
          <div style="text-align: center;">
            <p style="font-size: 18px; margin-bottom: 20px;"><b>Vai kāds no Jūsu bērniem ir jaunāks par 4 gadiem?</b></p>
            <div style="display: inline-block; text-align: left;">
              <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
                <input type="radio" name="young_children" value="Jā" required style="margin-right: 10px;">
                Jā
              </label>
              <label style="display: block; margin: 10px 0; cursor: pointer; font-size: 16px;">
                <input type="radio" name="young_children" value="Nē" required style="margin-right: 10px;">
                Nē
              </label>
            </div>
          </div>
        `,
        button_label: "Turpināt",
        on_finish: function (data) {
          const youngChildrenMap = { "Jā": 1, "Nē": 2 };
          const young_children = youngChildrenMap[data.response.young_children]; // 1=Jā, 2=Nē
          jsPsych.data.addProperties({ young_children });
        },
      },
    ],
    conditional_function: function () {
      const lastTrials = jsPsych.data
        .get()
        .filter({ question: "has_children" });
      if (lastTrials.count() > 0) {
        const lastResponse = lastTrials.last(1).values()[0].response_coded;
        return lastResponse === 1; // Show only if answered "Jā" (coded as 1)
      }
      return false;
    },
  };
  timeline.push(youngChildrenQuestion);

  // Question 7: Leisure activities (multiple choice)
  const leisureActivitiesQuestion = {
    type: SurveyHtmlFormPlugin,
    html: `
      <div style="text-align: center;">
        <p style="font-size: 18px; margin-bottom: 10px;"><b>Lūdzu, norādiet Jums atbilstošākās brīvā laika nodarbes (var izvēlēties vairākas atbildes):</b></p>
        <p style="font-size: 14px; margin-bottom: 20px;">Izvēlieties visas, kas attiecas:</p>
        <div style="text-align: left; max-width: 800px; margin: 0 auto;">
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_fiziskas" value="true" style="margin-right: 10px;">
            Fiziskās aktivitātes (piem., skriešana, riteņbraukšana, peldēšana, sporta zāles apmeklēšana, komandu sporta veidi, dejošana u.tml.)
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_relaksejosas" value="true" style="margin-right: 10px;">
            Relaksējošas aktivitātes (piem., lasīšana, TV skatīšanās, mūzikas klausīšanās, meditēšana u.tml.)
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_socialas" value="true" style="margin-right: 10px;">
            Sociālas aktivitātes (piem., tikšanās ar ģimeni/draugiem, pasākumu apmeklēšana, galda spēļu spēlēšana, brīvprātīgais darbs)
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_radosas" value="true" style="margin-right: 10px;">
            Radošas un intelektuālas aktivitātes (piem., mūzikas instrumentu spēlēšana, dziedāšana, gleznošana, fotografēšana, rokdarbi, valodu apguve u.tml.)
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_speles" value="true" style="margin-right: 10px;">
            Spēles un digitālas aktivitātes (piem., video spēles, sociālie tīkli, online kursu apguve, programmēšana u.tml.)
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_majsaimnieciba" value="true" style="margin-right: 10px;">
            Ar mājsaimniecību saistītas aktivitātes (piem., ēdiena gatavošana, kārtošana/tīrīšana, telpu labiekārtošana u.tml.)
          </label>
          <label style="display: block; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" name="leisure_daba" value="true" style="margin-right: 10px;">
            Atpūta dabā (piem., pārgājieni, putnu vērošana, makšķerēšana, jaunu vietu apskate u.tml)
          </label>
          <div style="margin-top: 20px;">
            <label style="display: block; margin: 10px 0;">
              Cits (ja vēlaties, norādiet citas nodarbes):
              <input type="text" name="leisure_other" style="width: 100%; margin-top: 5px; padding: 5px;">
            </label>
          </div>
        </div>
      </div>
    `,
    button_label: "Turpināt",
    data: {
      task: "demographic"
    },
    on_finish: function (data) {
      const activityMap = {
        "leisure_fiziskas": 1,
        "leisure_relaksejosas": 2,
        "leisure_socialas": 3,
        "leisure_radosas": 4,
        "leisure_speles": 5,
        "leisure_majsaimnieciba": 6,
        "leisure_daba": 7
      };

      const selected = [];
      for (const [key, value] of Object.entries(activityMap)) {
        if (data.response[key]) {
          selected.push(value);
        }
      }

      const otherText = data.response.leisure_other || "";

      data.response_coded = selected; // Array of selected numbers
      data.leisure_other = otherText;
      jsPsych.data.addProperties({ activities: selected });
      jsPsych.data.addProperties({ additional_activities: otherText });
    },
  };
  timeline.push(leisureActivitiesQuestion);
}