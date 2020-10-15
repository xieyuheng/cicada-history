import * as Exp from "../exp"
import * as Stmt from "../stmt"
import * as Value from "../value"
import * as Neutral from "../neutral"
import * as Closure from "../closure"
import * as Telescope from "../telescope"
import * as Mod from "../mod"
import * as Env from "../env"
import * as Trace from "../../trace"

export interface EvaluationOpts {
  shadow_mod_value_p?: boolean
}

export function evaluate(
  mod: Mod.Mod,
  env: Env.Env,
  exp: Exp.Exp,
  opts: EvaluationOpts = {
    shadow_mod_value_p: false,
  }
): Value.Value {
  try {
    switch (exp.kind) {
      case "Exp.v": {
        const value = Env.lookup(env, exp.name)
        if (value !== undefined) return value
        const mod_value = Mod.lookup_value(mod, exp.name)
        if (mod_value !== undefined) {
          if (opts.shadow_mod_value_p) {
            const entry = Mod.lookup_entry(mod, exp.name)
            if (entry === undefined) throw new Error("IMPOSSIBLE")
            const t = Mod.lookup_type(mod, exp.name)
            if (t === undefined) throw new Error("IMPOSSIBLE")
            if (entry.t !== undefined) {
              Mod.update(mod, exp.name, {
                ...entry,
                value_cache: Value.not_yet(t, Neutral.v(exp.name)),
              })
            }
          }
          return mod_value
        }
        throw new Trace.Trace(Exp.explain_name_undefined(exp.name))
      }
      case "Exp.pi": {
        return Value.pi(
          Exp.evaluate(mod, env, exp.arg_t, opts),
          Closure.create(mod, env, exp.name, exp.ret_t)
        )
      }
      case "Exp.fn": {
        return Value.fn(Closure.create(mod, env, exp.name, exp.ret))
      }
      case "Exp.ap": {
        return Exp.do_ap(
          Exp.evaluate(mod, env, exp.target, opts),
          Exp.evaluate(mod, env, exp.arg, opts)
        )
      }
      case "Exp.cls": {
        env = Env.clone(env)
        const sat = new Array()
        for (const entry of exp.sat) {
          const name = entry.name
          const t = Exp.evaluate(mod, env, entry.t, opts)
          const value = Exp.evaluate(mod, env, entry.exp, opts)
          sat.push({ name, t, value })
          Env.update(env, name, value)
        }
        if (exp.scope.length === 0) {
          return Value.cls(
            sat,
            Telescope.create(mod, env, undefined, new Array())
          )
        } else {
          const [entry, ...tail] = exp.scope
          const name = entry.name
          const t = Exp.evaluate(mod, env, entry.t, opts)
          return Value.cls(sat, Telescope.create(mod, env, { name, t }, tail))
        }
      }
      case "Exp.obj": {
        const { properties } = exp
        return Value.obj(
          new Map(
            Array.from(properties, ([name, exp]) => [
              name,
              Exp.evaluate(mod, env, exp, opts),
            ])
          )
        )
      }
      case "Exp.dot": {
        return Exp.do_dot(Exp.evaluate(mod, env, exp.target, opts), exp.name)
      }
      case "Exp.equal": {
        return Value.equal(
          Exp.evaluate(mod, env, exp.t, opts),
          Exp.evaluate(mod, env, exp.from, opts),
          Exp.evaluate(mod, env, exp.to, opts)
        )
      }
      case "Exp.same": {
        return Value.same
      }
      case "Exp.replace": {
        return Exp.do_replace(
          Exp.evaluate(mod, env, exp.target, opts),
          Exp.evaluate(mod, env, exp.motive, opts),
          Exp.evaluate(mod, env, exp.base, opts)
        )
      }
      case "Exp.absurd": {
        return Value.absurd
      }
      case "Exp.absurd_ind": {
        return Exp.do_absurd_ind(
          Exp.evaluate(mod, env, exp.target, opts),
          Exp.evaluate(mod, env, exp.motive, opts)
        )
      }
      case "Exp.str": {
        return Value.str
      }
      case "Exp.quote": {
        return Value.quote(exp.str)
      }
      case "Exp.union": {
        const { left, right } = exp
        return Value.union(
          Exp.evaluate(mod, env, left, opts),
          Exp.evaluate(mod, env, right, opts)
        )
      }
      case "Exp.datatype": {
        return Value.datatype(
          exp.name,
          Exp.evaluate(mod, env, exp.t, opts),
          exp.sums,
          mod,
          env
        )
      }
      case "Exp.type": {
        return Value.type
      }
      case "Exp.begin": {
        env = Env.clone(env)
        for (const stmt of exp.stmts) {
          Stmt.execute(mod, env, stmt)
        }
        return Exp.evaluate(mod, env, exp.ret, opts)
      }
      case "Exp.the": {
        return Exp.evaluate(mod, env, exp.exp, opts)
      }
    }
  } catch (error) {
    if (error instanceof Trace.Trace) {
      throw Trace.trail(error, exp)
    } else {
      throw error
    }
  }
}
