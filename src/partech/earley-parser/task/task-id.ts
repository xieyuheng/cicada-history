import * as Task from "../task"
import { repr_progress_entry } from "./task-repr"

export function id(task: Task.Task): string {
  return Task.repr(task)
}

// export function id(task: Task.Task): string {
//   let s = task.grammar_name + ":" + task.choice_name + "@" + task.index + " "
//   for (let i = 0; i < task.progress.length; i++) {
//     s += repr_progress_entry(task.progress[i])
//     s += " "
//   }
//   return s
// }
