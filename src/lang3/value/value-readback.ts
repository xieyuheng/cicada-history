import * as Value from "../value"
import * as Closure from "../closure"
import * as Neutral from "../neutral"
import * as Exp from "../exp"
import * as Ctx from "../ctx"
import * as Env from "../env"
import * as ut from "../../ut"

export function readback(
  ctx: Ctx.Ctx,
  t: Value.Value,
  value: Value.Value
): Exp.Exp {
  if (t.kind === "Value.pi") {
    // NOTE everything with a function type
    //   is immediately read back as having a Lambda on top.
    //   This implements the η-rule for functions.
    const fresh_name = ut.freshen_name(new Set(ctx.keys()), t.ret_t_cl.name)
    const variable = Value.not_yet(t.arg_t, Neutral.v(fresh_name))
    return Exp.fn(
      fresh_name,
      Value.readback(
        Ctx.extend(ctx, fresh_name, t.arg_t),
        Closure.apply(t.ret_t_cl, variable),
        Exp.do_ap(value, variable)
      )
    )
  } else if (t.kind === "Value.cls") {
    // NOTE η-expanded every value with cls type to obj.
    const properties = new Map()
    const { sat, next, scope } = t.tel
    let { env } = t.tel
    env = Env.clone(env)
    for (const entry of sat) {
      const property_value = Exp.do_dot(value, entry.name)
      const property_t = entry.t
      const property_exp = Value.readback(ctx, property_t, property_value)
      properties.set(entry.name, property_exp)
    }
    if (next !== undefined) {
      const property_value = Exp.do_dot(value, next.name)
      const property_t = next.t
      const property_exp = Value.readback(ctx, property_t, property_value)
      properties.set(next.name, property_exp)
      Env.update(env, next.name, property_value)
    }
    for (const entry of scope) {
      const property_value = Exp.do_dot(value, entry.name)
      const property_t = Exp.evaluate(env, entry.t)
      const property_exp = Value.readback(ctx, property_t, property_value)
      properties.set(entry.name, property_exp)
      Env.update(env, entry.name, property_value)
    }
    return Exp.obj(properties)
  } else if (
    t.kind === "Value.absurd" &&
    value.kind === "Value.not_yet" &&
    value.t.kind === "Value.absurd"
  ) {
    return Exp.the(Exp.absurd, Neutral.readback(ctx, value.neutral))
  } else if (t.kind === "Value.equal" && value.kind === "Value.same") {
    return Exp.same
  } else if (t.kind === "Value.str" && value.kind === "Value.quote") {
    return Exp.quote(value.str)
  } else if (t.kind === "Value.type" && value.kind === "Value.str") {
    return Exp.str
  } else if (t.kind === "Value.type" && value.kind === "Value.absurd") {
    return Exp.absurd
  } else if (t.kind === "Value.type" && value.kind === "Value.equal") {
    return Exp.equal(
      Value.readback(ctx, Value.type, value.t),
      Value.readback(ctx, value.t, value.from),
      Value.readback(ctx, value.t, value.to)
    )
    // } else if (t.kind === "Value.type" && value.kind === "Value.sigma") {
    //   const fresh_name = ut.freshen_name(new Set(ctx.keys()), value.cdr_t_cl.name)
    //   const variable = Value.not_yet(value.car_t, Neutral.v(fresh_name))
    //   const car_t = Value.readback(ctx, Value.type, value.car_t)
    //   const cdr_t = Value.readback(
    //     Ctx.extend(ctx, fresh_name, value.car_t),
    //     Value.type,
    //     Closure.apply(value.cdr_t_cl, variable)
    //   )
    //   return Exp.sigma(fresh_name, car_t, cdr_t)
  } else if (t.kind === "Value.type" && value.kind === "Value.cls") {
    throw new Error("TODO")
  } else if (t.kind === "Value.type" && value.kind === "Value.pi") {
    const fresh_name = ut.freshen_name(new Set(ctx.keys()), value.ret_t_cl.name)
    const variable = Value.not_yet(value.arg_t, Neutral.v(fresh_name))
    const arg_t = Value.readback(ctx, Value.type, value.arg_t)
    const ret_t = Value.readback(
      Ctx.extend(ctx, fresh_name, value.arg_t),
      Value.type,
      Closure.apply(value.ret_t_cl, variable)
    )
    return Exp.pi(fresh_name, arg_t, ret_t)
  } else if (t.kind === "Value.type" && value.kind === "Value.type") {
    return Exp.type
  } else if (value.kind === "Value.not_yet") {
    // NOTE  t and value.t are ignored here,
    //  maybe use them to debug.
    return Neutral.readback(ctx, value.neutral)
  } else {
    throw new Error(
      ut.aline(`
      |I can not readback value: ${ut.inspect(value)},
      |of type: ${ut.inspect(t)}.
      |`)
    )
  }
}