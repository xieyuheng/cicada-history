use std::sync::Arc;
use error_report::{
    Span,
    ErrorMsg,
    ErrorInCtx,
};
#[cfg (test)]
use error_report::{
    ErrorCtx,
};
use mexp::{
    SyntaxTable,
    Mexp,
    MexpArg,
};

#[derive (Clone)]
#[derive (Debug)]
#[derive (PartialEq)]
pub enum Exp {
    Const { span: Span, num: isize },
    ZeroP { span: Span, exp1: Arc <Exp> },
    If { span: Span,
         exp1: Arc <Exp>,
         exp2: Arc <Exp>,
         exp3: Arc <Exp> },
    Diff { span: Span,
           exp1: Arc <Exp>,
           exp2: Arc <Exp> },
    Var { span: Span, var: Var },
    Let { span: Span, var: Var, exp1: Arc <Exp>,
          body: Arc <Exp> },
}

pub type Var = String;

fn note_about_mexp_syntax_of_exp () -> ErrorMsg {
    ErrorMsg::new ()
        .head ("mexp syntax of <Exp>")
        .line ("<Exp::Const> = num?")
        .line ("<Exp::ZeroP> = zero-p (<Exp>)")
        .line ("<Exp::If> = if { <Exp> <Exp> <Exp> }")
        .line ("<Exp::Diff> = diff (<Exp> <Exp>)")
        .line ("<Exp::Var> = <Var>")
        .line ("<Exp::Let> = let { <Var> = <Exp> <Exp> }")
}

fn num_symbol_p (symbol: &str) -> bool {
    symbol .parse::<isize> () .is_ok ()
}

fn var_symbol_p (symbol: &str) -> bool {
    ! num_symbol_p (symbol)
}

fn mexp_to_const_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    if let Mexp::Sym {
        span,
        symbol
    } = mexp {
        if num_symbol_p (symbol) {
            let num = symbol.parse::<isize> () .unwrap ();
            let span = span.clone ();
            Ok (Exp::Const { span, num })
        } else {
            ErrorInCtx::new ()
                .head ("unknown symbol")
                .span (span.clone ())
                .wrap_in_err ()
        }
    } else {
        ErrorInCtx::new ()
            .head ("unknown mexp")
            .span (mexp.span ())
            .note (note_about_mexp_syntax_of_exp ())
            .wrap_in_err ()
    }
}

fn mexp_to_var_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    if let Mexp::Sym {
        span,
        symbol
    } = mexp {
        if var_symbol_p (symbol) {
            let var = symbol.to_string ();
            let span = span.clone ();
            Ok (Exp::Var { span, var })
        } else {
            ErrorInCtx::new ()
                .head ("unknown symbol")
                .span (span.clone ())
                .wrap_in_err ()
        }
    } else {
        ErrorInCtx::new ()
            .head ("unknown mexp")
            .span (mexp.span ())
            .note (note_about_mexp_syntax_of_exp ())
            .wrap_in_err ()
    }
}

fn mexp_to_zero_p_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    if let Mexp::Apply {
        span: apply_span,
        head: box Mexp::Sym {
            symbol: "zero-p", ..
        },
        arg: MexpArg::Tuple {
            span: arg_span,
            body,
        },
    } = mexp {
        if let [mexp1] = &body[..] {
            let exp1 = mexp_to_exp (mexp1)?;
            Ok (Exp::ZeroP {
                span: apply_span.clone (),
                exp1: Arc::new (exp1),
            })
        } else {
            ErrorInCtx::new ()
                .head ("wrong arity of `zero-p`")
                .line ("the arity should be 1")
                .span (arg_span.clone ())
                .wrap_in_err ()
        }
    } else {
        ErrorInCtx::new ()
            .head ("unknown mexp")
            .span (mexp.span ())
            .note (note_about_mexp_syntax_of_exp ())
            .wrap_in_err ()
    }
}

fn mexp_to_diff_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    if let Mexp::Apply {
        span: apply_span,
        head: box Mexp::Sym {
            symbol: "diff", ..
        },
        arg: MexpArg::Tuple {
            span: arg_span,
            body,
        },
    } = mexp {
        if let [mexp1, mexp2] = &body[..] {
            let exp1 = mexp_to_exp (&mexp1)?;
            let exp2 = mexp_to_exp (&mexp2)?;
            Ok (Exp::Diff {
                span: apply_span.clone (),
                exp1: Arc::new (exp1),
                exp2: Arc::new (exp2),
            })
        } else {
            ErrorInCtx::new ()
                .head ("wrong arity of `diff`")
                .line ("the arity should be 2")
                .span (arg_span.clone ())
                .wrap_in_err ()
        }
    } else {
        ErrorInCtx::new ()
            .head ("unknown mexp")
            .span (mexp.span ())
            .note (note_about_mexp_syntax_of_exp ())
            .wrap_in_err ()
    }
}

fn mexp_to_if_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    if let Mexp::Apply {
        span: apply_span,
        head: box Mexp::Sym {
            symbol: "if", ..
        },
        arg: MexpArg::Block {
            span: arg_span,
            body,
        },
    } = mexp {
        if let [mexp1, mexp2, mexp3] = &body[..] {
            let exp1 = mexp_to_exp (&mexp1)?;
            let exp2 = mexp_to_exp (&mexp2)?;
            let exp3 = mexp_to_exp (&mexp3)?;
            Ok (Exp::If {
                span: apply_span.clone (),
                exp1: Arc::new (exp1),
                exp2: Arc::new (exp2),
                exp3: Arc::new (exp3),
            })
        } else {
            ErrorInCtx::new ()
                .head ("syntax error in `if {}`")
                .line ("there must be 3 <exp> in `{}`")
                .span (arg_span.clone ())
                .wrap_in_err ()
        }
    } else {
        ErrorInCtx::new ()
            .head ("unknown mexp")
            .span (mexp.span ())
            .note (note_about_mexp_syntax_of_exp ())
            .wrap_in_err ()
    }
}

fn mexp_to_let_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    if let Mexp::Apply {
        span: apply_span,
        head: box Mexp::Sym {
            symbol: "let", ..
        },
        arg: MexpArg::Block {
            span: arg_span,
            body,
        },
    } = mexp {
        if let [
            Mexp::Infix {
                span: _infix_span,
                op: "=",
                lhs: box Mexp::Sym {
                    span: _var_span,
                    symbol,
                },
                rhs,
            },
            mexp2,
        ] = &body[..] {
            let exp2 = mexp_to_exp (&mexp2)?;
            let exp1 = mexp_to_exp (&rhs)?;
            Ok (Exp::Let {
                span: apply_span.clone (),
                var: symbol.to_string (),
                exp1: Arc::new (exp1),
                body: Arc::new (exp2),
            })
        } else {
            ErrorInCtx::new ()
                .head ("syntax error in `let {}`")
                .line ("there must be 2 <exp> in `{}`")
                .span (arg_span.clone ())
                .wrap_in_err ()
        }
    } else {
        ErrorInCtx::new ()
            .head ("unknown mexp")
            .span (mexp.span ())
            .note (note_about_mexp_syntax_of_exp ())
            .wrap_in_err ()
    }
}

pub fn mexp_to_exp <'a> (
    mexp: &Mexp <'a>,
) -> Result <Exp, ErrorInCtx> {
    mexp_to_const_exp (mexp)
        .or (mexp_to_var_exp (mexp))
        .or (mexp_to_zero_p_exp (mexp))
        .or (mexp_to_diff_exp (mexp))
        .or (mexp_to_zero_p_exp (mexp))
        .or (mexp_to_if_exp (mexp))
        .or (mexp_to_let_exp (mexp))
}

pub fn str_to_exp_vec (
    s: &str,
) -> Result <Vec <Exp>, ErrorInCtx> {
    let syntax_table = SyntaxTable::default ();
    let mexp_vec = syntax_table.parse (s)?;
    let mut exp_vec = Vec::new ();
    for mexp in &mexp_vec {
        exp_vec.push (mexp_to_exp (mexp)?);
    }
    Ok (exp_vec)
}

#[derive (Clone)]
#[derive (Debug)]
#[derive (PartialEq)]
pub enum Val {
    Num { num: isize },
    Bool { boolean: bool },
}

#[derive (Clone)]
#[derive (Debug)]
#[derive (PartialEq)]
pub enum Env {
    Null {},
    Cons { var: Var, val: Val, rest: Arc <Env> },
}

impl Env {
    pub fn apply (
        &self,
        var: &Var,
    ) -> Result <Val, ErrorInCtx> {
        match self {
            Env::Null {} => {
                ErrorInCtx::new ()
                    .head ("Env::apply fail")
                    .wrap_in_err ()
            }
            Env::Cons { var: head, val, rest } => {
                if head == var {
                    Ok (val.clone ())
                } else {
                    rest.apply (var)
                }
            }
        }
    }
}

impl Env {
    pub fn eval (
        &self,
        exp: &Exp,
    ) -> Result <Val, ErrorInCtx> {
        match exp {
            Exp::Const { num, .. } => {
                Ok (Val::Num { num: *num })
            }
            Exp::ZeroP { exp1, .. } => {
                let boolean = {
                    self.eval (exp1)? == Val::Num { num: 0 }
                };
                Ok (Val::Bool { boolean })
            }
            Exp::If { exp1, exp2, exp3, span } => {
                if let Val::Bool { boolean } = self.eval (exp1)? {
                    if boolean {
                        self.eval (exp2)
                    } else {
                        self.eval (exp3)
                    }
                } else {
                    ErrorInCtx::new ()
                        .head ("eval Exp:If fail")
                        .span (span.clone ())
                        .wrap_in_err ()
                }
            }
            Exp::Diff { exp1, exp2, span } => {
                let num1 = if let Val::Num {
                    num
                } = self.eval (exp1)? {
                    num
                } else {
                    return ErrorInCtx::new ()
                        .head ("eval Exp::Diff fail")
                        .span (span.clone ())
                        .wrap_in_err ();
                };
                let num2 = if let Val::Num {
                    num
                } = self.eval (exp2)? {
                    num
                } else {
                    return ErrorInCtx::new ()
                        .head ("eval Exp::Diff fail")
                        .wrap_in_err ();
                };
                Ok (Val::Num { num: num1 - num2 })
            }
            Exp::Var { var, .. } => {
                self.apply (var)
            }
            Exp::Let { var, exp1, body, .. } => {
                let new_env = Env::Cons {
                    var: var.clone (),
                    val: self.eval (exp1)?,
                    rest: Arc::new (self.clone ()),
                };
                new_env.eval (body)
            }
        }
    }
}

#[cfg (test)]
const EXAMPLE_CODE: &'static str = "
1
2
3

diff (2 1)
diff (3 1)

zero-p (1)
zero-p (0)

if {
  zero-p (1)
  0
  666
}

let {
  y = 5
  diff (x y)
}

let {
  y = diff (x 3)
  if {
    zero-p (y)
    0
    666
  }
}
";

#[test]
fn test_str_to_exp_vec () {
    let input = EXAMPLE_CODE;
    match str_to_exp_vec (input) {
        Ok (exp_vec) => {
            for exp in exp_vec {
                println! ("- exp = {:?}", exp);
            }
        }
        Err (error) => {
            error.print (
                ErrorCtx::new ()
                    .body (input))
        }
    }
}

#[test]
fn test_env_eval () {
    let input = EXAMPLE_CODE;
    let env = Env::Null {};
    let env = Env::Cons {
        var: "x".to_string (),
        val: Val::Num { num: 6 },
        rest: Arc::new (env),
    };

    match str_to_exp_vec (input) {
        Ok (exp_vec) => {
            for exp in exp_vec {
                match env.eval (&exp) {
                    Ok (val) => {
                        println! ("> {:?}\n{:?}", exp, val);
                    }
                    Err (error) => {
                        error.print (
                            ErrorCtx::new ()
                                .body (input))
                    }
                }
            }
        }
        Err (error) => {
            error.print (
                ErrorCtx::new ()
                    .body (input))
        }
    }
}
