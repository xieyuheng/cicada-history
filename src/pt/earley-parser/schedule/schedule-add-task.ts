import * as Schedule from "../schedule"
import * as Task from "../task"

export function add_task(schedule: Schedule.Schedule, task: Task.Task): void {
  const id = Task.id(task)
  const task_map = schedule.chart[Task.current_index(task)]
  if (!task_map.has(id)) {
    task_map.set(id, task)
    schedule.queue.push(task)
  }
}