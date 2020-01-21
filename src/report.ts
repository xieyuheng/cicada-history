export class Report extends Error {
  constructor(
    public message_list: Array<string>,
  ) {
    super(merge_message_list(message_list))
  }

  throw_append(message: string) {
    throw new Report([
      ...this.message_list,
      message,
    ])
  }

  throw_prepend(message: string) {
    throw new Report([
      message,
      ...this.message_list,
    ])
  }
}

function merge_message_list(message_list: Array<string>): string {
  let s = ""
  s += "------\n"
  for (let message of message_list) {
    s += message
    s += "------\n"
  }
  return s
}