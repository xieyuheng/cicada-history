import * as Readback from "../readback"
import * as Evaluate from "../evaluate"
import * as Value from "../value"
import * as Neutral from "../neutral"
import * as Exp from "../exp"
import * as Ctx from "../ctx"
import * as Env from "../env"
import * as Mod from "../mod"
import * as Trace from "../../trace"

export function readback_type_constructor(
  mod: Mod.Mod,
  ctx: Ctx.Ctx,
  t: Value.Value,
  type_constructor: Value.type_constructor
): Exp.type_constructor {
  if (!Value.conversion(mod, ctx, Value.type, t, type_constructor.t))
    throw new Trace.Trace("t is not equivalent to type_constructor.t")

  return Exp.type_constructor(
    type_constructor.name,
    Readback.readback(mod, ctx, Value.type, type_constructor.t),
    readback_delayed_sums(mod, ctx, type_constructor.delayed)
  )
}

function readback_delayed_sums(
  mod: Mod.Mod,
  ctx: Ctx.Ctx,
  delayed: Value.DelayedSums.DelayedSums
): Array<{ tag: string; t: Exp.Exp }> {
  // TODO should we use `mod` or `delayed.mod`?
  return delayed.sums.map((sum) => ({
    tag: sum.tag,
    t: Readback.readback(
      mod,
      ctx,
      Value.type,
      Evaluate.evaluate(Mod.clone(delayed.mod), delayed.env, sum.t, {
        mode: Evaluate.EvaluationMode.mute_recursive_exp_in_mod,
      })
    ),
  }))
}