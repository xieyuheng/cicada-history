import { freshen } from "./freshen"
import * as Ty from "../ty"
import * as Exp from "../exp"
import * as Value from "../value"
import * as Neutral from "../neutral"
import * as ut from "../../ut"

// NOTE
// The typed version of the readback procedure
// takes the types into account to perform eta-expansion.

export function readback(
  used: Set<string>,
  t: Ty.Ty,
  value: Value.Value
): Exp.Exp {
  if (t.kind === "Ty.Nat") {
    if (value.kind === "Value.Zero") {
      return { kind: "Exp.Zero" }
    } else if (value.kind === "Value.Succ") {
      return { kind: "Exp.Succ", prev: Value.readback(used, t, value.prev) }
    } else {
      throw new Error("TODO")
    }
  } else if (t.kind === "Ty.Arrow") {
    const name = freshen(used, value_arg_name(value))
    const v: Value.Reflection = {
      kind: "Value.Reflection",
      t: t.arg_t,
      neutral: { kind: "Neutral.Var", name },
    }
    const ret = Exp.do_ap(value, v)
    const body = Value.readback(new Set([...used, name]), t.ret_t, ret)
    // NOTE everything with a function type
    //   is immediately read back as having a Lambda on top.
    //   This implements the η-rule for functions.
    return { kind: "Exp.Fn", name, body }
  } else {
    if (value.kind === "Value.Reflection") {
      if (ut.equal(t, value.t)) {
        return Neutral.readback(used, value.neutral)
      } else {
        throw new Error("TODO")
      }
    } else {
      throw new Error("TODO")
    }
  }
}

function value_arg_name(value: Value.Value): string {
  return value.kind === "Value.Fn" ? value.name : "x"
}