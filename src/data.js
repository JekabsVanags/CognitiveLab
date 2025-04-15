export default function dataProcessing(trial) {
  if (trial.task === "email") {
    return { respondent_email: trial.response.answer ?? null };
  }
  else if (trial.task === "n-back" && trial.phase === "test") {
    return {
      task: "n-back",
      is_target: trial.is_target ?? null,
      is_correct: trial.correct ?? null,
      reaction_time: trial.rt ?? null,
      stim: trial.letter ?? null,
    };
  }
  else if (trial.task === "visualSearch" && trial.phase === "test") {
    return {
      task: "visualSearch",
      is_target: trial.containsTarget ?? null,
      is_correct: trial.correct ?? null,
      reaction_time: trial.rt ?? null,
      stim_count: trial.numberOfItems ?? null,
    }
  }
  else if (trial.task === "taskSwitching" && trial.phase === "test") {
    return {
      task: "taskSwitching",
      target_reaction: trial.targetReaction ?? null,
      task_type: trial.taskType ?? null,
      task_repeated: trial.repeatTask ?? null,
      is_correct: trial.correct ?? null,
      reaction_time: trial.rt ?? null,
    }
  }
  else if (trial.task === "subjectiveCertainty") {
    if (trial.question_type === "confidence") {
      return {
        task: "subjectiveCertaintyConfidenceLevel",
        response: trial.response.Q0,
        task_id: trial.task_id,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? null
      }
    }
    else if (trial.question_type === "llm_use") {
      return {
        task: "subjectiveCertaintyLLMUsed",
        response: trial.response.llm_used === "Jā" ? true : false,
        task_id: trial.task_id,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? null
      }
    }
    else if (trial.question_type === "llm_usage_level") {
      return {
        task: "subjectiveCertaintyLLMUsageLevel",
        response: trial.response.Q0 ?? null,
        task_id: trial.task_id,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? null
      }
    }
    else if (trial.question_type === "answer") {
      return {
        task: "subjectiveCertaintyAnswers",
        response: trial.response.Q0,
        task_id: trial.task_id,
        response_time: trial.rt ?? null,
        has_been_to_america: trial.hasBeenToAmerica ?? null,
        has_planned_a_trip: trial.hasPlannedATrip ?? null,
        accessed_previous_answers: trial.accessedPreviousAnswer ?? false
      }
    }
  }
  else {
    return null;
  }
}
