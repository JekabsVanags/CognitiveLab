import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";

// Server configuration
const SERVER_URL = "http://localhost:3001";

//===Experiment step that processes the data of experiments till then===//
export function dataSavingStep(jsPsych, experiment = null) {
  return (
    {
      type: HtmlKeyboardResponsePlugin,
      choices: "NO_KEYS",
      trial_duration: 1000,
      stimulus: "Dati tiek apstrādāti un saglabāti",
      on_load: function () {

        //Filter out the significant data (ones that are tied to a task)
        const filtered = jsPsych.data.get().trials.filter((d) => d.task != null && experiment ? d.task == experiment : true)
        console.log(filtered)
        //For each record process it (save to DB) and show in console as JSON
        const data = filtered.map((d) => dataProcessing(d)).filter((item) => item !== null || item)
        console.log(data)
      }
    }
  )
}

//Function to process the experiment data
export function dataProcessing(trial) {

  if (trial.task == "participants") {
    return processidTask(trial);
  }
  else if (trial.task == "nBack" && trial.phase == "test") {
    return processNBackTask(trial);
  }
  else if (trial.task == "visualSearch" && trial.phase == "test") {
    return processVisualSearchTask(trial);
  }
  else if (trial.task == "taskSwitching" && trial.phase == "test") {
    return processTaskSwitchingTask(trial);
  }
  else if (trial.task == "subjectiveCertainty") {
    return processSubjectiveCertaintyTask(trial);
  }
  else if (trial.task == "geneveEmotionWheel") {
    return processEmotionWheelTrial(trial);
  }
  else if (trial.task == "bfi10") {
    return processBFI10Task(trial);
  }
  else if (trial.task == "fss") {
    return processSandardLikertTask(trial);
  }
  else if (trial.task == "ess") {
    return processSandardLikertTask(trial);
  }
  else if (trial.task == "phq9") {
    return processSandardLikertTask(trial);
  }
  else {
    return null;
  }
}

//===Process id collection data===//
function processidTask(trial) {
  const data = {
    task: "participants",
    user_id: trial.response.answer ?? "",
    trial_index: 0,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

//===Process BFI-10 personality questionaire===//
function processBFI10Task(trial) {
  const data = trial.response.map((response, index) => ({
    task: "likertSurvey",
    trial_index: trial.trial_index,
    questionaire: "bfi10",
    user_id: trial.user_id,
    experiment_name: trial.experiment_name,
    question_id: index,
    question: trial.questions[index] + (trial.reversed.includes(index) ? " (Vērtības jau apgrieztas)" : ""),
    response: response
  }));


  data.forEach(entry => saveToDatabase(entry));
  return data;
}

function processSandardLikertTask(trial) {
  if (trial.response.length > 1) {
    const data = trial.response.map((response, index) => ({
      task: "likertSurvey",
      trial_index: trial.trial_index,
      questionaire: trial.task,
      user_id: trial.user_id,
      experiment_name: trial.experiment_name,
      question_id: index,
      question: trial.questions[index],
      response: response
    }));

    console.log(data)
    data.forEach(entry => saveToDatabase(entry));
    return data;
  }
  else {
    const data = {
      task: "likertSurvey",
      trial_index: trial.trial_index,
      questionaire: trial.task,
      user_id: trial.user_id,
      experiment_name: trial.experiment_name,
      question_id: trial.question_id,
      question: trial.question,
      response: trial.response
    };

    saveToDatabase(data);
    return data;
  }
}
//===Process Geneve emotion wheel task data===//
function processEmotionWheelTrial(trial) {
  const emotions = JSON.parse(trial.response);

  const data = emotions.map((item) => ({
    task: "geneveEmotionWheel",
    user_id: trial.user_id,
    emotion: item.emotion,
    intensity: item.intensity,
    trial_index: trial.trial_index,
    experiment_name: trial.experiment_name
  }));

  data.forEach(entry => saveToDatabase(entry));

  return data;
}


//===Process n-back task data===//
function processNBackTask(trial) {
  const data = {
    task: "nBack",
    user_id: trial.user_id,
    is_target: trial.isTarget ?? null,
    is_correct: trial.correct ?? null,
    reaction_time: trial.rt ?? 0,
    stim: trial.letter ?? 'null',
    trial_index: trial.trialIndex,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

//===Process visual search task data===//
function processVisualSearchTask(trial) {
  const data = {
    task: "visualSearch",
    user_id: trial.user_id,
    is_target: trial.containsTarget ?? null,
    is_correct: trial.correct ?? null,
    reaction_time: trial.rt ?? 0,
    stim_count: trial.numberOfItems ?? 0,
    trial_index: trial.trialIndex,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

//===Process task switching experiment data===//
function processTaskSwitchingTask(trial) {
  const data = {
    task: "taskSwitching",
    user_id: trial.user_id,
    target_reaction: trial.targetReaction ?? null,
    task_type: trial.taskType ?? null,
    task_repeated: trial.repeatTask ?? null,
    is_correct: trial.correct ?? null,
    reaction_time: trial.rt ?? 0,
    trial_index: trial.trialIndex,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

//===Process subjective certainty task data===//
//========Based on the question type==========//
function processSubjectiveCertaintyTask(trial) {
  const questionType = trial.question_type;

  if (questionType === "confidence") {
    return processConfidenceQuestion(trial);
  }
  else if (questionType === "llm_usage_level") {
    return processLLMUsageQuestion(trial);
  }
  else if (questionType === "answer") {
    return processAnswerQuestion(trial);
  }

  return null;
}

//===Process subjective certainty experiment confidence level data===//
function processConfidenceQuestion(trial) {
  const data = {
    task: "subjectiveCertaintyConfidenceLevel",
    user_id: trial.user_id,
    response: trial.response.Q0,
    task_id: trial.task_id,
    has_been_to_america: trial.hasBeenToAmerica ?? null,
    has_planned_a_trip: trial.hasPlannedATrip ?? null,
    accessed_previous_answers: trial.accessedPreviousAnswer ?? false,
    trial_index: trial.trialIndex,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

//===Process subjective certainty experiment llm usage level data===//
function processLLMUsageQuestion(trial) {
  const data = {
    task: "subjectiveCertaintyLLMUsageLevel",
    id: trial.id,
    response: trial.response.Q0 ?? null,
    task_id: trial.task_id,
    has_been_to_america: trial.hasBeenToAmerica ?? null,
    has_planned_a_trip: trial.hasPlannedATrip ?? null,
    accessed_previous_answers: trial.accessedPreviousAnswer ?? false,
    trial_index: trial.trialIndex,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

//===Process subjective certainty experiment text amswer data===//
function processAnswerQuestion(trial) {
  const data = {
    task: "subjectiveCertaintyAnswer",
    user_id: trial.user_id,
    response: trial.response.Q0,
    task_id: trial.task_id,
    response_time: trial.rt ?? null,
    has_been_to_america: trial.hasBeenToAmerica ?? null,
    has_planned_a_trip: trial.hasPlannedATrip ?? null,
    accessed_previous_answers: trial.accessedPreviousAnswer ?? false,
    trial_index: trial.trialIndex,
    experiment_name: trial.experiment_name
  };

  saveToDatabase(data);
  return data;
}

// Function to save the responses to database
export function saveToDatabase(data) {
  fetch(`${SERVER_URL}/api/experiment/insert_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

//Function that prepares database for the experiments
//(Creates databases if they dont exist, non-destructive)
export function databasePreparing(experiments) {
  // Common fields for all tables
  const metaData = [
    { name: "user_id", type: "varchar(255)" },
    { name: "trial_index", type: "int" },
    { name: "experiment_name", type: "varchar(255)" }
  ];

  // Table definitions with their specific columns
  const tables = [
    {
      tableName: "participants",
      tableColumns: []
    },
    {
      tableName: "nBack",
      tableColumns: [
        { name: "is_target", type: "bool" },
        { name: "is_correct", type: "bool" },
        { name: "reaction_time", type: "bigint" },
        { name: "stim", type: "char" }
      ]
    },
    {
      tableName: "visualSearch",
      tableColumns: [
        { name: "is_target", type: "bool" },
        { name: "is_correct", type: "bool" },
        { name: "reaction_time", type: "bigint" },
        { name: "stim_count", type: "int" }
      ]
    },
    {
      tableName: "taskSwitching",
      tableColumns: [
        { name: "target_reaction", type: "char" },
        { name: "task_type", type: "varchar(255)" },
        { name: "task_repeated", type: "bool" },
        { name: "is_correct", type: "bool" },
        { name: "reaction_time", type: "bigint" }
      ]
    },
    {
      tableName: "geneveEmotionWheel",
      tableColumns: [
        { name: "emotion", type: "varchar(255)" },
        { name: "intensity", type: "int" },

      ]
    },
    {
      tableName: "subjectiveCertainty",
      suffix: "ConfidenceLevel",
      tableColumns: [
        { name: "response", type: "int" },
        { name: "task_id", type: "int" },
        { name: "has_been_to_america", type: "bool" },
        { name: "has_planned_a_trip", type: "bool" },
        { name: "accessed_previous_answers", type: "bigint" }
      ]
    },
    {
      tableName: "subjectiveCertainty",
      suffix: "LLMUsageLevel",
      tableColumns: [
        { name: "response", type: "int" },
        { name: "task_id", type: "int" },
        { name: "has_been_to_america", type: "bool" },
        { name: "has_planned_a_trip", type: "bool" },
        { name: "accessed_previous_answers", type: "bigint" }
      ]
    },
    {
      tableName: "subjectiveCertainty",
      suffix: "Answer",
      tableColumns: [
        { name: "response", type: "text" },
        { name: "response_time", type: "bigint" },
        { name: "task_id", type: "int" },
        { name: "has_been_to_america", type: "bool" },
        { name: "has_planned_a_trip", type: "bool" },
        { name: "accessed_previous_answers", type: "bigint" }
      ]
    },
    {
      tableName: "likertSurvey",
      tableColumns: [
        { name: "questionaire", type: "text" },
        { name: "question_id", type: "int" },
        { name: "question", type: "text" },
        { name: "response", type: "int" },
      ]
    },
  ];

  // Create each table if the experiment is included in the experiment list
  tables.forEach((table) => {
    if (experiments.includes(table.tableName) || table.tableName === "participants") {
      //Table consists of the metadata and the other columns
      table.tableColumns = [...metaData, ...table.tableColumns];

      fetch(`${SERVER_URL}/api/prepare_table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(table),
      });
    }
  });
}
