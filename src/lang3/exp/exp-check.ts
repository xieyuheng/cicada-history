import * as Exp from "../exp"
import * as Stmt from "../stmt"
import * as Value from "../value"
import * as Neutral from "../neutral"
import * as Closure from "../closure"
import * as Telescope from "../telescope"
import * as Ctx from "../ctx"
import * as Trace from "../../trace"
import * as ut from "../../ut"
import { check_obj } from "./exp-check-obj"
import { check_quote } from "./exp-check-quote"
import { check_union_type } from "./exp-check-union-type"
import { check_by_infer } from "./exp-check-by-infer"

export function check(ctx: Ctx.Ctx, exp: Exp.Exp, t: Value.Value): void {
  try {
    if (t.kind === "Value.union") {
      check_union_type(ctx, exp, t)
    } else if (exp.kind === "Exp.fn") {
      // check_fn(ctx, exp, Value.is_pi(ctx, t))
      const pi = Value.is_pi(ctx, t)
      const arg = Value.not_yet(pi.arg_t, Neutral.v(exp.name))
      const ret_t = Closure.apply(pi.ret_t_cl, arg)
      Exp.check(Ctx.extend(ctx, exp.name, pi.arg_t), exp.ret, ret_t)
    } else if (exp.kind === "Exp.obj") {
      // NOTE We DO NOT need to update the `ctx` as we go along.
      // - just like checking `Exp.cons`.
      check_obj(ctx, exp, Value.is_cls(ctx, t))
    } else if (exp.kind === "Exp.same") {
      const equal = Value.is_equal(ctx, t)
      if (!Value.conversion(ctx, equal.t, equal.from, equal.to)) {
        throw new Trace.Trace(
          ut.aline(`
          |I am expecting the following two values to be the same ${Exp.repr(
            Value.readback(ctx, Value.type, equal.t)
          )}.
          |But they are not.
          |from:
          |  ${Exp.repr(Value.readback(ctx, equal.t, equal.from))}
          |to:
          |  ${Exp.repr(Value.readback(ctx, equal.t, equal.to))}
          |`)
        )
      }
    } else if (exp.kind === "Exp.begin") {
      const { stmts, ret } = exp
      ctx = Ctx.clone(ctx)
      for (const stmt of stmts) {
        Stmt.declare(ctx, stmt)
      }
      Exp.check(ctx, ret, t)
    } else if (exp.kind === "Exp.quote") {
      check_quote(ctx, exp, t)
    } else {
      check_by_infer(ctx, exp, t)
    }
  } catch (error) {
    if (error instanceof Trace.Trace) {
      throw Trace.trail(error, exp)
    } else {
      throw error
    }
  }
}
