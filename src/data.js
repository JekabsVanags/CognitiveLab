const server = "http://localhost:3001"


export function dataProcessing(trial) {
  if (trial.task === "email") {
    const data = { task: "participants", email: trial.response.answer ?? "" };

    fetch(`${server}/api/experiment/insert_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return data;
  }
  else if (trial.task === "n-back" && trial.phase === "test") {
    //Frontend data
    const data = {
      task: "nBack",
      email: trial.email,
      is_target: trial.is_target ?? null,
      is_correct: trial.correct ?? null,
      reaction_time: trial.rt ?? 0,
      stim: `'${trial.letter}'` ?? 'null',
    };

    //To server
    fetch(`${server}/api/experiment/insert_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return data;
  }
  else if (trial.task === "visualSearch" && trial.phase === "test") {
    const data = {
      task: "visualSearch",
      email: trial.email,
      is_target: trial.containsTarget ?? null,
      is_correct: trial.correct ?? null,
      reaction_time: trial.rt ?? 0,
      stim_count: trial.numberOfItems ?? 0,
    }

    //Save to database
    fetch(`${server}/api/experiment/insert_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return data
  }
  else if (trial.task === "taskSwitching" && trial.phase === "test") {
    const data = {
      task: "taskSwitching",
      email: trial.email,
      target_reaction: `'${trial.targetReaction}'` ?? null,
      task_type: `'${trial.taskType}'` ?? null,
      task_repeated: trial.repeatTask ?? null,
      is_correct: trial.correct ?? null,
      reaction_time: trial.rt ?? 0,
    };

    //Save to database
    fetch(`${server}/api/experiment/insert_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return data;
  }
  else if (trial.task === "subjectiveCertainty") {
    if (trial.question_type === "confidence") {
      const data = {
        task: "subjectiveCertaintyConfidenceLevel",
        email: trial.email,
        response: trial.response.Q0,
        task_id: trial.task_id,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? false
      }

      //Save to DB
      fetch(`${server}/api/experiment/insert_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return data;
    }
    else if (trial.question_type === "llm_use") {
      const data = {
        task: "subjectiveCertaintyLLMUsed",
        email: trial.email,
        response: trial.response.llm_used === "Jā" ? true : false,
        task_id: trial.task_id,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? false
      };

      fetch(`${server}/api/experiment/insert_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return data;
    }
    else if (trial.question_type === "llm_usage_level") {
      const data = {
        task: "subjectiveCertaintyLLMUsageLevel",
        email: trial.email,
        response: trial.response.Q0 ?? null,
        task_id: trial.task_id,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? false
      }

      fetch(`${server}/api/experiment/insert_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return data;
    }
    else if (trial.question_type === "answer") {
      const data = {
        task: "subjectiveCertaintyAnswer",
        email: trial.email,
        response: `'${trial.response.Q0}'`,
        task_id: trial.task_id,
        response_time: trial.rt ?? null,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? false
      }

      fetch(`${server}/api/experiment/insert_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return data;
    }
  }
  else {
    return null;
  }
}

export function databasePreparing(experiments) {
  const metaData = [
    { name: "email", type: "varchar(255)" }
  ]

  const tables = [
    { tableName: "participants", tableColumns: [] },
    { tableName: "nBack", tableColumns: [{ name: "is_target", type: "bool" }, { name: "is_correct", type: "bool" }, { name: "reaction_time", type: "bigint" }, { name: "stim", type: "char" }] },
    { tableName: "visualSearch", tableColumns: [{ name: "is_target", type: "bool" }, { name: "is_correct", type: "bool" }, { name: "reaction_time", type: "bigint" }, { name: "stim_count", type: "int" }] },
    { tableName: "taskSwitching", tableColumns: [{ name: "target_reaction", type: "char" }, { name: "task_type", type: "varchar(255)" }, { name: "task_repeated", type: "bool" }, { name: "is_correct", type: "bool" }, { name: "reaction_time", type: "bigint" }] },
    { tableName: "subjectiveCertainty", suffix: "ConfidenceLevel", tableColumns: [{ name: "response", type: "int" }, { name: "task_id", type: "int" }, { name: "has_been_to_america", type: "bool" }, { name: "has_planned_a_trip", type: "bool" }, { name: "accessed_previous_answers", type: "bigint" }] },
    { tableName: "subjectiveCertainty", suffix: "LLMUsed", tableColumns: [{ name: "response", type: "bool" }, { name: "task_id", type: "int" }, { name: "has_been_to_america", type: "bool" }, { name: "has_planned_a_trip", type: "bool" }, { name: "accessed_previous_answers", type: "bigint" }] },
    { tableName: "subjectiveCertainty", suffix: "LLMUsageLevel", tableColumns: [{ name: "response", type: "int" }, { name: "task_id", type: "int" }, { name: "has_been_to_america", type: "bool" }, { name: "has_planned_a_trip", type: "bool" }, { name: "accessed_previous_answers", type: "bigint" }] },
    { tableName: "subjectiveCertainty", suffix: "Answer", tableColumns: [{ name: "response", type: "text" }, { name: "response_time", type: "bigint" }, { name: "task_id", type: "int" }, { name: "has_been_to_america", type: "bool" }, { name: "has_planned_a_trip", type: "bool" }, { name: "accessed_previous_answers", type: "bigint" }] },
  ]

  tables.forEach((table) => {
    if (experiments.includes(table.tableName) || table.tableName === "participants") {
      table.tableColumns = [...metaData, ...table.tableColumns];
      fetch(`${server}/api/prepare_table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(table),
      });
    }
  })
}