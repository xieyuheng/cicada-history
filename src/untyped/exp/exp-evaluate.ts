import * as Exp from "../exp"
import * as Env from "../env"
import * as Value from "../value"

export function evaluate(env: Env.Env, exp: Exp.Exp): Value.Value {
  try {
    switch (exp.kind) {
      case Exp.Kind.Var: {
        const result = Env.lookup(env, exp.name)
        if (result !== undefined) {
          return result
        } else {
          throw new Exp.Trace.Trace(exp, `unknown variable name: ${exp.name}`)
        }
      }
      case Exp.Kind.Fn: {
        return {
          ...exp,
          kind: Value.Kind.Fn,
          env,
        }
      }
      case Exp.Kind.Ap: {
        return Exp.elim_ap(evaluate(env, exp.rator), evaluate(env, exp.rand))
      }
      case Exp.Kind.Suite: {
        for (const def of exp.defs) {
          env = Env.extend(Env.clone(env), def.name, evaluate(env, def.exp))
        }
        return evaluate(env, exp.body)
      }
    }
  } catch (error) {
    if (error instanceof Exp.Trace.Trace) {
      const trace = error
      trace.previous.push(exp)
      throw trace
    } else {
      throw error
    }
  }
}