  (+union nat-u
    zero-t
    succ-t)

  (+data zero-t)

  (+data succ-t
    prev)

  (+fun add
    (let m n)
    (case n
      (zero-t m)
      (succ-t m n.prev recur succ-c)))

  (+fun mul
    (let m n)
    (case n
      (zero-t n)
      (succ-t m n.prev recur m add)))

  ;; (+fun factorial
  ;;   (let n)
  ;;   (case n
  ;;     (zero-t zero-c succ-c)
  ;;     (succ-t n.prev recur n mul)))

  ;; (begin
  ;;   zero-c succ-c succ-c succ-c
  ;;   zero-c succ-c succ-c succ-c add factorial)

  ;; (+fun factorial
  ;;   (let n)
  ;;   (case [n 0 eq-p]
  ;;     (true-t 1)
  ;;     (false-t n number-dec recur n number-mul)))

  ;; (begin
  ;;   10 factorial)

  ;; (begin
  ;;   1 2 3 null-c cons-c cons-c cons-c
  ;;   1 2 3 null-c cons-c cons-c cons-c eq-p)

  (+var var-1 1)

  var-1 2 number-add
