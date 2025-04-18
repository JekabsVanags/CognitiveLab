// Server configuration
const SERVER_URL = "http://localhost:3001";

//Function to process the experiment data
export function dataProcessing(trial) {

  if (trial.task === "email") {
    return processEmailTask(trial);
  }
  else if (trial.task === "nBack" && trial.phase === "test") {
    return processNBackTask(trial);
  }
  else if (trial.task === "visualSearch" && trial.phase === "test") {
    return processVisualSearchTask(trial);
  }
  else if (trial.task === "taskSwitching" && trial.phase === "test") {
    return processTaskSwitchingTask(trial);
  }
  else if (trial.task === "subjectiveCertainty") {
    return processSubjectiveCertaintyTask(trial);
  }
  else {
    return null;
  }
}

//===Process email collection data===//
function processEmailTask(trial) {
  const data = {
    task: "participants",
    email: trial.response.answer ?? "",
    trial_index: 0
  };

  saveToDatabase(data);
  return data;
}

//===Process n-back task data===//
function processNBackTask(trial) {
  const data = {
    task: "nBack",
    email: trial.email,
    is_target: trial.isTarget ?? null,
    is_correct: trial.correct ?? null,
    reaction_time: trial.rt ?? 0,
    stim: `'${trial.letter}'` ?? 'null',
    trial_index: trial.trialIndex
  };

  saveToDatabase(data);
  return data;
}

//===Process visual search task data===//
function processVisualSearchTask(trial) {
  const data = {
    task: "visualSearch",
    email: trial.email,
    is_target: trial.containsTarget ?? null,
    is_correct: trial.correct ?? null,
    reaction_time: trial.rt ?? 0,
    stim_count: trial.numberOfItems ?? 0,
    trial_index: trial.trialIndex
  };

  saveToDatabase(data);
  return data;
}

//===Process task switching experiment data===//
function processTaskSwitchingTask(trial) {
  const data = {
    task: "taskSwitching",
    email: trial.email,
    target_reaction: `'${trial.targetReaction}'` ?? null,
    task_type: `'${trial.taskType}'` ?? null,
    task_repeated: trial.repeatTask ?? null,
    is_correct: trial.correct ?? null,
    reaction_time: trial.rt ?? 0,
    trial_index: trial.trialIndex
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
    email: trial.email,
    response: trial.response.Q0,
    task_id: trial.task_id,
    has_been_to_america: trial.hasBeenToAmerica ?? null,
    has_planned_a_trip: trial.hasPlannedATrip ?? null,
    accessed_previous_answers: trial.accessedPreviousAnswer ?? false,
    trial_index: trial.trialIndex
  };

  saveToDatabase(data);
  return data;
}

//===Process subjective certainty experiment llm usage level data===//
function processLLMUsageQuestion(trial) {
  const data = {
    task: "subjectiveCertaintyLLMUsageLevel",
    email: trial.email,
    response: trial.response.Q0 ?? null,
    task_id: trial.taskId,
    has_been_to_america: trial.hasBeenToAmerica ?? null,
    has_planned_a_trip: trial.hasPlannedATrip ?? null,
    accessed_previous_answers: trial.accessedPreviousAnswer ?? false,
    trial_index: trial.trialIndex
  };

  saveToDatabase(data);
  return data;
}

//===Process subjective certainty experiment text amswer data===//
function processAnswerQuestion(trial) {
  const data = {
    task: "subjectiveCertaintyAnswer",
    email: trial.email,
    response: `'${trial.response.Q0}'`,
    task_id: trial.task_id,
    response_time: trial.rt ?? null,
    has_been_to_america: trial.hasBeenToAmerica ?? null,
    has_planned_a_trip: trial.hasPlannedATrip ?? null,
    accessed_previous_answers: trial.accessedPreviousAnswer ?? false,
    trial_index: trial.trialIndex
  };

  saveToDatabase(data);
  return data;
}

// Function to save the responses to database
function saveToDatabase(data) {
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
    { name: "email", type: "varchar(255)" },
    { name: " trial_index", type: "int" }
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