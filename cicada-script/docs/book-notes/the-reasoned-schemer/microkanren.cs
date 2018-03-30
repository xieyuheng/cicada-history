    (+fun :)
    (+macro +alias note)
    (+macro -> (let body)
      body {'-- eq-p} list-ante
      {', eq-p not} list-filter
      sexp-filter-colon (let new-body)
      `(let (@ new-body list-spread)))
    (+fun sexp-filter-colon (let ante)
      (case ante
        (null-t null-c)
        (cons-t
          (case ante.cdr
            (null-t null-c)
            (cons-t
              (if [ante.cdr.car ': eq-p]
                [ante.car ante.cdr.cdr.cdr recur cons-c]
                [ante.cdr recur]))))))
    (+macro +type (let body)
       body.car (let name)
       body.cdr (let rest)
      `(+data (@ name) (@ rest sexp-filter-colon list-spread)))
  (+type var-t
    id : number-t)

  (+alias term-u
    (| string-t
       var-t
       term-u list-u))
  (+alias substitution-t [var-t term-u dict-t])

  (+fun empty-substitution
    : (-> -- substitution-t)
    new-dict)

  (+fun s-ext
    : (-> substitution-t
          var-t
          term-u
       -- substitution-t)
    dict-insert)

  (+fun walk
    : (-> term : term-u
          substitution : substitution-t
       -- term-u)
    (case term
      (var-t
        (if [substitution term dict-find]
          [substitution recur]
          [term]))
      (else term)))

  (+fun unify
    : (-> s : substitution-t
          u : term-u
          v : term-u
       -- (| substitution-t
             false-t))
    u s walk (let u)
    v s walk (let v)
    (cond
      (and [u var-p] [v var-p] [u v eq-p]) [s]
      [u var-p] [s u v s-ext]
      [v var-p] [s v u s-ext]
      (and [u cons-p] [v cons-p])
      [s u.car v.car recur
       dup false-p (bool-when-not u.cdr v.cdr recur)]
      else (if [u v eq-p]
             s
             false-c)))
  (+type state-t
    substitution : substitution-t
    id-counter : number-t)
  (+alias stream-u list-u)

  (+fun unit
    : (-> state-t -- state-t stream-u)
    null-c cons-c)

  (+fun mzero
    : (-> -- state-t stream-u)
    null-c)
  (+alias goal-t (-> state-t -- state-t stream-u))

  (+fun ==
    : (-> u : term-u
          v : term-u
       -- goal-t)
    {(let state)
     state.substitution u v unify (let substitution)
     (if [substitution false-p]
       mzero
       [substitution
        (. substitution)
        state clone
        unit])})

  (+fun call/fresh
    : (-> fun : (-> var-t -- goal-t) -- goal-t)
    {(let state)
     state.id-counter (let id)
     id inc (. id-counter) state clone
     id var-c fun
     apply})

  (+fun disj
    : (-> goal1 : goal-t
          goal2 : goal-t
       -- goal-t)
    {(let state)
     state goal1
     state goal2
     mplus})

  (+fun mplus
    : (-> stream1 : [state-t stream-u]
          stream2 : [state-t stream-u]
       -- state-t stream-u)
    (cond [stream1 null-p] stream2
          ;; ><><><
          else [stream1.car
                stream1.cdr stream2 recur
                cons-c]))

  (note
    (define (mplus $1 $2)
      (cond [(null? $1) $2]
            [(procedure? $1) (lambda () (mplus $2 ($1)))]
            [else (cons (car $1) (mplus (cdr $1) $2))])))

  (+fun conj
    : (-> goal1 : goal-t
          goal2 : goal-t
       -- goal-t)
    {goal1 {goal2} bind})

  (+fun bind
    : (-> stream : [state-t stream-u]
          goal : goal-t
       -- state-t stream-u)
    (cond [stream null-p] mzero
          ;; ><><><
          else [stream.car goal
                stream.cdr {goal} recur
                mplus]))

  (note
    (define (bind $ g)
      (cond [(null? $) mzero]
            [(procedure? $) (lambda () (bind ($) g))]
            [else (mplus (g (car $)) (bind (cdr $) g))])))
    (begin
      empty-substitution
      '(a b c)
      '(a b c)
      unify
      empty-substitution
      eq-p bool-assert)

    (begin
      empty-substitution
      '((a b c) (a b c) (a b c))
      '((a b c) (a b c) (a b c))
      unify
      empty-substitution
      eq-p bool-assert)

    (begin
      empty-substitution
      (lit-list 'a 'b 0 var-c)
      (lit-list 'a 'b 'c)
      unify
      empty-substitution 0 var-c 'c s-ext
      eq-p bool-assert)

    (begin
      empty-substitution
      `((a b c) (a b c) (a b (@ 0 var-c)))
      `((a b c) (a b c) (a b c))
      unify
      empty-substitution 0 var-c 'c s-ext
      eq-p bool-assert)

    (begin
      empty-substitution
      `(a b (@ 0 var-c))
      `(a b c)
      unify
      empty-substitution 0 var-c 'c s-ext
      eq-p bool-assert)
    (note
      (define empty-state ' (() . 0))

      ((call/fresh (λ (q) (== q 5))) empty-state)

      ((((#(0) . 5)) . 1)))

    (+fun empty-state
      : (-> -- state-t)
      empty-substitution
      0
      state-c)

    empty-state
    {5 ==} call/fresh
    apply
    p nl

    (note
      (define a-and-b
        (conj
         (call/fresh (λ (a) (== a 7)))
         (call/fresh (λ (b) (disj (== b 5) (== b 6))))))

      (a-and-b empty-state)

      ((((#(1) . 5) (#(0) . 7)) . 2)
       (((#(1) . 6) (#(0) . 7)) . 2)))

    (+fun a-and-b
      {7 ==} call/fresh
      {(let b)  b 5 ==  b 6 ==  disj} call/fresh
      conj)

    empty-state
    a-and-b
    apply
    p nl

