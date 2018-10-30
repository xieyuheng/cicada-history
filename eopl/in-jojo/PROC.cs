(note program = exp)
(note exp
  = <const-exp>
  | <zero?-exp>
  | <if-exp>
  | <diff-exp>
  | <var-exp>
  | <let-exp>
  | <proc-exp>
  | <call-exp>)

(+data <const-exp> .num)
(+data <zero?-exp> .exp1)
(+data <if-exp>    .exp1 .exp2 .exp3)
(+data <diff-exp>  .exp1 .exp2)
(+data <var-exp>   .var)
(+data <let-exp>   .var .exp1 .body)

(+data <proc-exp>  .var .body)
(+data <call-exp>  .rator .rand)

(note expval
  = <num-val>
  | <bool-val>
  | <proc-val>)

(+data <num-val>  .num)
(+data <bool-val> .bool)

(+data <proc-val> .proc)

(+data <proc> .var .body .saved-env)

(+jojo proc-apply (-> :val :proc -- expval)
  :proc .saved-env :proc .var :val cons-env
  :proc .body swap eval)

(note
  (= :var :body proc-exp :env eval,
     :var :body :env proc proc-val))

(note
  (= :rator :rand call-exp :env eval,
     :rator :env eval .proc :proc!
     :rand  :env eval :arg!
     :arg :proc proc-apply))

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

(+jojo init-env
  null-env
  ':x 10 num-val cons-env
  ':v 5  num-val cons-env
  ':i 1  num-val cons-env)

(+jojo program-eval (-> :program -- expval)
  :program init-env eval)

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
                 :exp .body :new-env eval]

    <proc-exp>  [:exp .var :exp .body :env proc proc-val]
    <call-exp>  [:exp .rator :env eval .proc :proc!
                 :exp .rand  :env eval :arg!
                 :arg :proc proc-apply]))

(note
  123 -- <const-exp>
  (diff ... ...) -- <diff-exp>
  (if ... ... ...) -- <if-exp>
  (zero? ...) -- <zero?-exp>
  :var -- <var-exp>
  (let :var ... ...) -- <let-exp>

  (proc :var ...) -- <proc-exp>
  (call :rator :rand) -- <call-exp>)

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
                           .cdr parse/spread let-exp]

        [:key 'proc eq?]  [:body .car :body
                           .cdr parse/spread proc-exp]
        [:key 'call eq?]  [:body parse/spread call-exp]))

(+jojo parse/spread {parse} list-map list-spread)

(+jojo PROC (-> :body --)
  :body {parse program-eval expval-print nl} list-for-each
  '(begin))

(+jojo expval-print (-> :expval)
  (case :expval
    <num-val>  [:expval .num p]
    <bool-val> [:expval .bool p]))

(PROC
 1 2 3
 (diff 2 1)
 (diff 3 1)
 (let :y 5 (diff :x :y))
 (zero? 1)
 (zero? 0)
 (let :y (diff :x 3)
   (if (zero? :y) 0 666))

 (let :x 200
   (let :f (proc :z (diff :z :x) )
     (let :x 100
       (let :g (proc :z (diff :z :x))
         (diff (call :f 1)
           (call :g 1)))))))

(note What is the value of the following PROC program?

  (PROC
   (let :makemult
     (proc :maker
       (proc :x (if (zero? :x) 0
                  (diff (call (call :maker :maker)
                          (diff :x 1))
                    -4))))
     (let :times4
       (proc :x
         (call (call :makemult :makemult) :x))
       (call :times4 3)))))
