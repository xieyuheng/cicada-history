(note program = exp)
(note exp
  = <const-exp>
  | <zero?-exp>
  | <if-exp>
  | <diff-exp>
  | <var-exp>
  | <let-exp>)

(note expval
  = <num-val>
  | <bool-val>)

(+data <num-val>  .num)
(+data <bool-val> .bool)

(note env = <null-env> | <cons-env>)

(+data <null-env>)
(+data <cons-env> .rest .var .val)

(+jojo env-apply (-> :var :env -- expval)
  (case :env
    <null-env> ["- env-apply fail" p nl
                "  can not find var : " p :var p nl
                error]
    <cons-env> (if [:env .var :var equal?]
                   [:env .val]
                   [:var :env .rest env-apply])))

(+data <const-exp> .num)
(+data <zero?-exp> .exp1)
(+data <if-exp>    .exp1 .exp2 .exp3)
(+data <diff-exp>  .exp1 .exp2)
(+data <var-exp>   .var)
(+data <let-exp>   .var .exp1 .body)

(note
  (= :n const-exp :env eval, :n num-val)
  (= :var var-exp :env eval, :var :env env-apply)
  (= :exp1 :exp2 diff-exp :env eval,
     :exp1 :env eval .num
     :exp2 :env eval .num sub num-val))

(+jojo init-env
  null-env
  ':x 10 num-val cons-env
  ':v 5  num-val cons-env
  ':i 1  num-val cons-env)

(+jojo program-eval (-> :program -- expval)
  :program init-env eval)

(note
  (= :exp1 :env eval, :val1)
  ------------------------------------
  (= :exp1 zero?-exp :env eval
     (if [:val1 .num 0 eq?]
       [true  bool-val]
       [false bool-val])))

(note
  (= :exp1 :env eval, :val1)
  ------------------------------------
  (= :exp1 :exp2 :exp3 if-exp :env eval
     (if [:val1 .bool]
       [:exp2 :env eval]
       [:exp3 :env eval])))

(note
  (= :exp1 :exp2 :exp3 if-exp :env eval
     (if [:exp1 :env eval .bool]
       [:exp2 :env eval]
       [:exp3 :env eval])))

(note

  null-env ':x 33 cons-env ':y 22 cons-env :env!

  (=
   '(if (zero? (diff :x 11))
      (diff :y 2)
      (diff :y 4))
   parse :env eval

   (if ['(zero? (diff :x 11)) parse :env eval .bool]
     ['(diff :y 2) parse :env eval]
     ['(diff :y 4) parse :env eval])

   (if [false bool-val .bool]
     ['(diff :y 2) parse :env eval]
     ['(diff :y 4) parse :env eval])

   (if false
     ['(diff :y 2) parse :env eval]
     ['(diff :y 4) parse :env eval])

   '(diff :y 4) parse :env eval

   18 num-val))

(note
  (= :exp1 :env eval, :val1)
  ------------------------------------
  (= :var :exp1 :body :env eval,
     :body :env :var :val1 cons-env eval))

(note
  (= :var :exp1 :body :env eval,
   :env, :var, :exp1 :env eval, cons-env
   :body swap eval))

(+jojo eval (-> :exp :env -- expval)
  (case :exp
    <const-exp> [:exp .num  num-val]
    <zero?-exp> [:exp .exp1 :env eval .num 0 equal? bool-val]
    <if-exp>    (if [:exp .exp1 :env eval .bool]
                    [:exp .exp2 :env eval]
                    [:exp .exp3 :env eval])
    <diff-exp>  [:exp .exp1 :env eval .num
                 :exp .exp2 :env eval .num sub num-val]
    <var-exp>   [:exp .var :env env-apply]
    <let-exp>   [:env
                 :exp .var
                 :exp .exp1 :env eval
                 cons-env :new-env!
                 :exp .body :new-env eval]))

(note
  123 -- <const-exp>
  (diff ... ...) -- <diff-exp>
  (if ... ... ...) -- <if-exp>
  (zero? ...) -- <zero?-exp>
  :var -- <var-exp>
  (let :var ... ...) -- <let-exp>)

(+jojo parse (-> :sexp -- exp)
  (cond
    [:sexp string?] [:sexp parse/string]
    [:sexp cons?] [:sexp parse/cons]
    else  ["- parse fail" p nl
           "  can not parse sexp : " p
           :sexp sexp-print nl
           error]))

(+jojo parse/string (-> :string -- exp)
  (cond
    [:string int-string?]   [:string string->int const-exp]
    [:string local-string?] [:string var-exp]
    else ["- parse/string fail" p nl
          "  can not parse string : " p :string p nl
          error]))

(+jojo parse/cons (-> :sexp -- exp)
  :sexp .car :key!
  :sexp .cdr :body!
  (cond [:key 'zero? eq?] [:body parse/spread zero?-exp]
        [:key 'if eq?]    [:body parse/spread if-exp]
        [:key 'diff eq?]  [:body parse/spread diff-exp]
        [:key 'let eq?]   [:body .car :body
                           .cdr parse/spread let-exp]))

(+jojo parse/spread {parse} list-map list-spread)

(+jojo LET (-> :body --)
  :body {parse program-eval expval-print nl} list-for-each
  '(begin))

(+jojo expval-print (-> :expval)
  (case :expval
    <num-val>  [:expval .num p]
    <bool-val> [:expval .bool p]))

(LET
 1 2 3
 (diff 2 1)
 (diff 3 1)
 (let :y 5 (diff :x :y))
 (zero? 1)
 (zero? 0)
 (let :y (diff :x 3)
   (if (zero? :y) 0 666)))
