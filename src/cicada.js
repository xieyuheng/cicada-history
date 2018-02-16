    (+data env-t
      .name-dict : [name-t den-u dict-t]
      .data-stack : [obj-u list-u]
      .mark-stack : [nat-u list-u]
      .frame-stack : [frame-u list-u]
      .scope-stack : [string-t obj-u dict-t list-u]
      .goal-stack : [goal-t list-u]
      .hypo-dict : [hypo-id-t obj-u dict-t]
      .case-dict : [case-id-t case-u dict-t])
    (+alias name-t [string-t list-u])
      (+fun name-dict-get
        : (-> env-t (: name name-t) -- env-t den-u)
        dup .name-dict name dict-get)
      (+fun data-stack-push
        : (-> (: env env-t) (: obj obj-u) -- env-t)
        (. .data-stack = [obj env.data-stack cons])
        env clone)
      (+fun data-stack-pop
        : (-> (: env env-t) -- env-t obj-u)
        (. .data-stack = [env.data-stack.cdr])
        env clone
        env.data-stack.car)
      (+fun data-stack-drop
        : (-> env-t -- env-t)
        data-stack-pop drop)
      (+fun data-stack-tos
        : (-> env-t -- env-t obj-u)
        dup .data-stack.car)
      (+fun data-stack-n-pop
        : (-> env-t nat-u -- env-t obj-u list-u)
        )
      (+fun data-stack-zip-by-list
        : (-> env-t (: list t list-u)
           -- env-t t obj-u dict-t)
        )
      (+fun mark-stack-push
        : (-> (: env env-t) (: x nat-u) -- env-t)
        (. .mark-stack = [x env.mark-stack cons])
        env clone)
      (+fun mark-stack-pop
        : (-> (: env env-t) -- env-t nat-u)
        (. .mark-stack = [env.mark-stack.cdr])
        env clone
        env.mark-stack.car)
      (+fun mark-stack-mark
        : (-> env-t -- env-t)
        dup .data-stack list-length
        mark-stack-push)
      (+fun mark-stack-collect
        : (-> env-t -- env-t obj-u list-u)
        dup .data-stack list-length mark-stack-pop sub
        data-stack-n-pop)
      (+union frame-u
        scoping-frame-t
        simple-frame-t)
      (+data scoping-frame-t
        .body : [exp-u list-u]
        .index : nat-u)
      (+data simple-frame-t
        .body : [exp-u list-u]
        .index : nat-u)
      (+fun frame-stack-push
        : (-> (: env env-t) (: frame frame-u) -- env-t)
        (. .frame-stack = [frame env.frame-stack cons])
        env clone)
      (+fun frame-stack-pop
        : (-> (: env env-t) -- env-t frame-u)
        (. .frame-stack = [env.frame-stack.cdr])
        env clone
        env.frame-stack.car)
      (+fun frame-stack-drop
        : (-> env-t -- env-t)
        frame-stack-pop drop)
      (+fun frame-stack-tos
        : (-> env-t -- env-t frame-u)
        dup .frame-stack.car)
      (+fun top-frame-finished-p
        : (-> env-t -- env-t bool-u)
        frame-stack-tos (let frame)
        frame.index frame.body list-length equal-p)
      (+fun top-frame-next-exp
        : (-> env-t -- env-t exp-u)
        frame-stack-pop (let frame)
        (. .index = [frame.index inc])
        frame clone
        frame-stack-push
        frame.body frame.index list-ref)
      (+fun scope-get dict-get)
      (+fun scope-set
        : (-> string-t obj-u dict-t
              (: local-name string-t)
              (: obj obj-u)
           -- string-t obj-u dict-t)
        (dict local-name obj)
        dict-update)
      (+data goal-t
        .lhs : [obj-u list-u]
        .rhs : [obj-u list-u]
        .index : nat-u)
      (+fun hypo-dict-find
        : (-> env-t hypo-obj-t
           -- env-t obj-u maybe-u)
        ><)
      (+fun case-dict-get
        : (-> env-t case-obj-t
           -- env-t case-u)
       ><)
    (+union exp-u
      call-exp-t
      get-exp-t
      set-exp-t
      clo-exp-t
      arrow-exp-t
      case-exp-t
      ins-u)
    (+data call-exp-t
      .name : name-t)
    (+data get-exp-t
      .local-name : string-t)
    (+data set-exp-t
      .local-name : string-t)
    (+data clo-exp-t
      .body : [exp-u list-u])
    (+data arrow-exp-t
      .ante : [exp-u list-u]
      .succ : [exp-u list-u])
    (+data case-exp-t
      .arg : [exp-u list-u]
      .clause-dict : [string-t clo-exp-t dict-t])
    (+fun list-eval
      : (-> (: env env-t) (: exp-list exp-u list-u) -- env-t)
      env .frame-stack list-length (let base)
      (. .body = exp-list
         .index = 0)
      simple-frame-cr
      frame-stack-push
      env base eval-with-base)
    (+fun eval-with-base
      : (-> env-t (: base nat-u) -- env-t)
      (when [dup .frame-stack list-length base equal-p not]
        eval-one-step base recur))
    (note it is assumed that
      there is at least one step to exe)

    (+fun eval-one-step
      : (-> env-t -- env-t)
      (if top-frame-finished-p
        (case frame-stack-pop
          (scoping-frame-t scope-stack-drop)
          (simple-frame-t nop))
        [top-frame-next-exp exe]))
    (+fun collect-obj-list
      : (-> env-t exp-u list-u -- env-t obj-u list-u)
      swap mark-stack-mark
      swap list-eval
      mark-stack-collect)
    (+fun collect-obj
      : (-> env-t list-u -- env-t obj-u)
      null cons
      collect-obj-list
      car)
    (+gene exe
      : (-> env-t (: exp exp-u) -- env-t)
      "- exe fail" p nl
      "  exp = " p exp p nl
      error)
    (+disp exe : (-> env-t (: exp call-exp-t) -- env-t)
      exp.name name-dict-get den-exe)
    (+disp exe
      : (-> env-t (: exp get-exp-t) -- env-t)
      scope-stack-tos exp.local-name scope-get
      data-stack-push)
    (+disp exe
      : (-> env-t (: exp set-exp-t) -- env-t)
      data-stack-pop (let obj)
      scope-stack-pop exp.local-name obj scope-set
      scope-stack-push)
    (+disp exe
      : (-> env-t (: exp clo-exp-t) -- env-t)
      (. .scope = scope-stack-tos
         .body = [exp.body])
      clo-obj-cr
      data-stack-push)
    (+disp exe
      : (-> env-t (: exp arrow-exp-t) -- env-t)
      (. .ante = [exp.ante collect-obj-list]
         .succ = [exp.succ collect-obj-list])
      arrow-obj-cr
      data-stack-push)
    (+disp exe
      : (-> env-t (: exp case-exp-t) -- env-t)
      exp.arg collect-obj-list car
      exp obj-match)
    (+fun obj-match
      : (-> env-t
            (: obj obj-u)
            (: case-exp case-exp-t)
         -- env-t)
      (case obj
        (data-cons-obj-t
         obj.data-cons-name
         case-exp.clause-dict
         dict-get collect-obj
         clo-obj-apply)
        (hypo-obj-t
         (case [obj hypo-dict-find]
           (some-t
            case-exp recur)
           (none-t
            obj case-exp new-case-obj
            data-stack-push)))
        (case-obj-t
         ><><><)
        (else error)))
    (+fun new-case-obj
      : (-> env-t
            (: obj hypo-obj-t)
            (: case-exp case-exp-t)
         -- env-t case-obj-t)
      case-exp.clause-dict eval-clause-dict (let clause-dict)
      obj clause-dict new-sum-obj (let sum-obj)
      (. .type = sum-obj
         .arg = obj
         .clause-dict = clause-dict)
      todo-case-cr)
    (+fun eval-clause-dict
      : (-> env-t string-t clo-exp-t dict-t
         -- env-t string-t clo-obj-t dict-t))
    (+fun new-sum-obj
      : (-> env-t
            (: obj hypo-obj-t)
            (: clause-dict [string-t clo-obj-t dict-t])
         -- env-t sum-obj-t)
       )
    (+fun clo-obj-apply
      : (-> env-t clo-obj-t -- env-t)
      )
    (+gene cut
      : (-> (: env env-t) (: exp exp-u) -- env-t)
      error)
    (+fun list-cut
      : (-> env-t (: exp-list exp-u list-u) -- env-t)
      )
    (+union ins-u
      suppose-ins-t
      dup-ins-t
      infer-ins-t
      apply-ins-t)

    (+data suppose-ins-t)
    (+data dup-ins-t)
    (+data infer-ins-t)
    (+data apply-ins-t)
    (+disp exe
      : (-> env-t (: ins suppose-ins-t) -- env-t)
      data-stack-pop (let type)
      generate-hypo-id (let hypo-id)
      (. .hypo-id = hypo-id
         .type = type)
      hypo-type-obj-cr
      (let hypo-type-obj)
      (. .hypo-id = hypo-id
         .hypo-type = hypo-type-obj)
      hypo-obj-cr
      data-stack-push)
    (+union den-u
      fun-den-t
      data-cons-den-t
      type-cons-den-t)
    (+data fun-den-t
      .type : arrow-exp-t
      .body : [exp-u list-u])
    (+data data-cons-den-t
      .type : exp-u
      .data-cons-name : string-t
      .field-name-list : [string-t list-u]
      .type-cons-name : string-t)
    (+data type-cons-den-t
      .type : exp-u
      .type-cons-name : string-t
      .field-name-list : [string-t list-u]
      .data-cons-name-list : [string-t list-u])
    (+gene den-exe
      : (-> (: env env-t) (: den den-u) -- env-t)
      "- den-exe fail" p nl
      "  unknown den : " p den p nl
      error)
    (+disp den-exe
      : (-> env-t (: den fun-den-t) -- env-t)
      (dict) scope-stack-push
      den.type collect-obj (let type)
      type.ante ante-prepare
      type.ante ante-correspond
      (. .body = den.body
         .index = 0)
      scoping-frame-cr
      frame-stack-push)
    (+disp den-exe
      : (-> env-t (: den data-cons-den-t)
         -- env-t)
      den.type collect-obj (let type)
      type.ante ante-prepare
      den.field-name-list data-stack-zip-by-list (let fields)
      (. .type = [type type->return-type]
         .data-cons-name = den.data-cons-name
         .fields = fields)
      data-cons-obj-cr
      data-stack-push)
    (+disp den-exe
      : (-> env-t (: den type-cons-den-t)
         -- env-t)
      den.type collect-obj (let type)
      type.ante ante-prepare
      den.field-name-list data-stack-zip-by-list (let fields)
      (. .type = [type type->return-type]
         .type-cons-name = den.type-cons-name
         .fields = fields)
      type-cons-obj-cr
      data-stack-push)
    (+fun ante-prepare
      : (-> env-t (: ante obj-u list-u) -- env-t)
      ante list-length data-stack-n-pop (let obj-list)
      obj-list {infer} list-map ante list-unifiy)
    (+fun ante-correspond
      : (-> env-t (: ante obj-u list-u) -- env-t)
      )
    (+fun type->return-type
      : (-> obj-u -- obj-u)
      (when [dup arrow-obj-p]
        .succ .car))
    (+union obj-u
      data-cons-obj-t type-cons-obj-t
      clo-obj-t arrow-obj-t
      hypo-obj-t hypo-type-obj-t
      case-obj-t sum-obj-t)
    (+data data-cons-obj-t
      .type : type-cons-obj-t
      .data-cons-name : string-t
      .fields : [string-t obj-u dict-t])
    (+data type-cons-obj-t
      .type : ><><><
      .type-cons-name : string-t
      .fields : [string-t obj-u dict-t])
    (+data clo-obj-t
      .scope : [string-t obj-u dict-t]
      .body : [exp-u list-u])
    (+data arrow-obj-t
      .ante : [obj-u list-u]
      .succ : [obj-u list-u])
    (+data hypo-id-t
      .id : string-t)
    (+data hypo-obj-t
      .hypo-id : hypo-id-t
      .hypo-type : hypo-type-obj-t)
    (+data hypo-type-obj-t
      .hypo-id : hypo-id-t
      .type : obj-u)
    (+fun hypo-type-obj->hypo-obj
      : (-> env-t hypo-type-obj-t
         -- env-t hypo-obj-t))
    (+data case-id-t
      .id : string-t)
    (+data case-obj-t
      .case-id : case-id-t)
    (+union case-u
      todo-case-t
      done-case-t)

    (+data todo-case-t
      .type : sum-obj-t
      .arg : hypo-obj-t
      .clause-dict : [string-t clo-obj-t dict-t])

    (+data done-case-t
      .type : obj-u
      .result : obj-u)
    (+data sum-obj-t
      .objs : [obj-u list-u])
    (+gene infer
      : (-> (: env env-t) (: obj obj-u) -- env-t obj-u)
      error)
    (+disp infer
     : (-> env-t data-cons-obj-t
        -- env-t type-cons-obj-t)
     )
    (+disp infer
     : (-> env-t type-cons-obj-t
        -- env-t type-cons-obj-t))
    (note every time the the type of a closure is asked for,
      we use the body of the closure
      to construct a new arrow object.)

    (+disp infer
      : (-> env-t clo-obj-t
         -- env-t arrow-obj-t))
    (+disp infer
      : (-> env-t arrow-obj-t
         -- env-t arrow-obj-t))
    (+disp infer
      : (-> env-t hypo-obj-t
         -- env-t hypo-type-obj-t))
    (+disp infer
      : (-> env-t hypo-type-obj-t
         -- env-t ><><><))
    (+disp infer
     : (-> env-t case-obj-t
        -- env-t obj-u))
    (+disp infer
     : (-> env-t sum-obj-t
        -- env-t sum-obj-t))
    (+fun list-unifiy
      : (-> env-t (: l obj-u list-u) (: r obj-u list-u) -- env-t)
      )
    (+fun unify-one-step
      : (-> env-t -- env-t)
      )
    (+gene unify
      : (-> env-t obj-u obj-u -- env-t)
      )
    (+fun list-cover
      : (-> env-t obj-u list-u obj-u list-u
         -- env-t))
    (+fun fun-den-type-check
      : (-> env-t (: den fun-den-t))
      mark-stack-mark
      den.type.ante list-eval
      den.body list-cut
      mark-stack-collect (let results)
      den.type.succ collect-obj-list
      results list-cover)
