import * as Neutral from "../neutral"
import * as Closure from "../closure"
import * as Telescope from "../telescope"
import * as Exp from "../exp"
import * as Mod from "../mod"
import * as Env from "../env"

export type Value =
  | pi
  | fn
  | cls
  | obj
  | equal
  | same
  | absurd
  | str
  | quote
  | union
  | datatype
  | type
  | not_yet

export interface pi {
  kind: "Value.pi"
  arg_t: Value
  ret_t_cl: Closure.Closure
}

export const pi = (arg_t: Value, ret_t_cl: Closure.Closure): pi => ({
  kind: "Value.pi",
  arg_t,
  ret_t_cl,
})

export interface fn {
  kind: "Value.fn"
  ret_cl: Closure.Closure
}

export const fn = (ret_cl: Closure.Closure): fn => ({
  kind: "Value.fn",
  ret_cl,
})

export interface cls {
  kind: "Value.cls"
  sat: Array<{ name: string; t: Value; value: Value }>
  tel: Telescope.Telescope
}

export const cls = (
  sat: Array<{ name: string; t: Value; value: Value }>,
  tel: Telescope.Telescope
): cls => ({
  kind: "Value.cls",
  sat,
  tel,
})

export interface obj {
  kind: "Value.obj"
  properties: Map<string, Value>
}

export const obj = (properties: Map<string, Value>): obj => ({
  kind: "Value.obj",
  properties,
})

export interface equal {
  kind: "Value.equal"
  t: Value
  from: Value
  to: Value
}

export const equal = (t: Value, from: Value, to: Value): equal => ({
  kind: "Value.equal",
  t,
  from,
  to,
})

export interface same {
  kind: "Value.same"
}

export const same: same = {
  kind: "Value.same",
}

export interface absurd {
  kind: "Value.absurd"
}

export const absurd: absurd = {
  kind: "Value.absurd",
}

export interface str {
  kind: "Value.str"
}

export const str: str = {
  kind: "Value.str",
}

export interface quote {
  kind: "Value.quote"
  str: string
}

export const quote = (str: string): quote => ({
  kind: "Value.quote",
  str,
})

export interface union {
  kind: "Value.union"
  left: Value
  right: Value
}

export const union = (left: Value, right: Value): union => ({
  kind: "Value.union",
  left,
  right,
})

export interface datatype {
  kind: "Value.datatype"
  name: string
  t: Value
  sums: Array<{ tag: string; t: Exp.Exp }>
  mod: Mod.Mod
  env: Env.Env
}

export const datatype = (
  name: string,
  t: Value,
  sums: Array<{ tag: string; t: Exp.Exp }>,
  mod: Mod.Mod,
  env: Env.Env
): datatype => ({
  kind: "Value.datatype",
  name,
  t,
  sums,
  mod,
  env,
})

export interface type {
  kind: "Value.type"
}

export const type: type = {
  kind: "Value.type",
}

export interface not_yet {
  kind: "Value.not_yet"
  t: Value
  neutral: Neutral.Neutral
}

export const not_yet = (t: Value, neutral: Neutral.Neutral): not_yet => ({
  kind: "Value.not_yet",
  t,
  neutral,
})
