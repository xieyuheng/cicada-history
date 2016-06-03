#include <stdio.h>
#include <ctype.h>
#include <stdlib.h>
#include <stdint.h>
#include <setjmp.h>
#include <string.h>

typedef enum { false, true } bool;

int
max
(int a, int b) {
  if (a < b) {
    return b;
  }
  else {
    return a;
  }
}

int
min
(int a, int b) {
  if (a > b) {
    return b;
  }
  else {
    return a;
  }
}

bool
isbarcket
(char c) {
  return (c == '(' ||
          c == ')' ||
          c == '[' ||
          c == ']' ||
          c == '{' ||
          c == '}');
}

typedef char* string;

bool
string_equal
(string s1, string s2) {
  if (strcmp(s1, s2) == 0) {
    return true;
  }
  else {
    return false;
  }
}

typedef void (*primitive)();

typedef int name;

typedef struct {
  int size;
  name *array;
} jojo;

typedef union {
  int cell;
  primitive primitive;
  jojo jojo;
} bind;

typedef struct {
  int index;
  string key;
  name type;
  bind value;
  int orbit_length;
  int orbiton;
} nametable_entry;

name k2n (string str);

nametable_entry
new_nametable_entry
(int index) {
  nametable_entry e = {
    .index = index,
    .key = 0,
    .type = k2n("none"),
    .value.cell = 0,
    .orbit_length = 0,
    .orbiton = 0
  };
  return e;
}

bool
nametable_entry_occured
(nametable_entry e) {
  return e.key != 0;
}

bool
nametable_entry_used
(nametable_entry e) {
  return e.type != k2n("none");
}

bool
nametable_entry_no_collision
(nametable_entry e) {
  return e.index == e.orbiton;
}

// prime table size
//   1000003   about 976 k
//   1000033
//   1000333
//   100003    about 97 k
//   100333
//   997
#define nametable_size 100003
nametable_entry nametable[nametable_size];
int nametable_counter = 0;

int
string_to_sum
(string str) {
  int sum = 0;
  int max_step = 10;
  int i = 0;
  while (i < strlen(str)) {
    sum = sum + str[i] * (2 << min(i, max_step));
    i++;
  }
  return sum;
}

bool
nametable_keyeq
(string k1, string k2) {
  return string_equal(k1, k2);
}

int
nametable_hash
(string key, int counter) {
  return (counter + string_to_sum(key)) % nametable_size;
}

char string_area[4 * 1024 * 1024];
int string_area_counter = 0;

string
copy_to_string_area
(string str) {
  char *str1;
  int i = 0;
  str1 = (string_area + string_area_counter);
  while (true) {
    if (str[i] == 0) {
      str1[i] = str[i];
      i++;
      break;
    }
    else {
      str1[i] = str[i];
      i++;
    }
  }
  string_area_counter = i + string_area_counter;
  return str1;
}

int // -1 denotes the hash_table is filled
nametable_insert
(string key) {
  int orbit_index = nametable_hash(key, 0);
  int counter = 0;
  while (true) {
    int index = nametable_hash(key, counter);
    if (!nametable_entry_occured(nametable[index])) {
      key = copy_to_string_area(key);
      nametable[index].key = key;
      nametable[index].orbiton = orbit_index;
      nametable[orbit_index].orbit_length = 1 + counter;
      nametable_counter = 1 + nametable_counter;
      return index;
    }
    else if (nametable_keyeq(key, nametable[index].key)) {
      return index;
    }
    else if (counter == nametable_size) {
      return -1;
    }
    else {
      counter = 1 + counter;
    }
  }
}

int // -1 denotes key not occured
nametable_search
(string key) {
  int counter = 0;
  while (true) {
    int index = nametable_hash(key, counter);
    if (!nametable_entry_occured(nametable[index])) {
      return -1;
    }
    else if (nametable_keyeq(key, nametable[index].key)) {
      return index;
    }
    else if (counter == nametable_size) {
      return -1;
    }
    else {
      counter = 1 + counter;
    }
  }
}

string n2k (int index);

void nametable_entry_print
(nametable_entry entry) {
  printf("%s : ", n2k(entry.type));
  if (entry.type == k2n("cell")) {
    printf("%d", entry.value.cell);
  }
  else if (entry.type == k2n("primitive")) {
    printf("%d", entry.value.primitive);
  }
  else if (entry.type == k2n("jojo")) {
    printf("%d ", entry.value.jojo.size);
    printf("[ ", entry.value.jojo.size);
    int i;
    for (i=0; i < entry.value.jojo.size; i=i+1) {
      printf("%d ", entry.value.jojo.array[i]);
    }
    printf("]", entry.value.jojo.size);
  }
}

void
nametable_report_orbit
(int index, int counter) {
  while (counter < nametable[index].orbit_length) {
    string key = nametable[index].key;
    int next_index = nametable_hash(key, counter);
    if (index == nametable[next_index].orbiton) {
      printf("  - %d %s\n", next_index, nametable[next_index].key);
    }
    if (nametable_entry_used(nametable[next_index])) {
      printf("    = ");
      nametable_entry_print(nametable[next_index]);
      printf("\n");
    }
    counter = 1 + counter;
  }
}

void
nametable_report
() {
  printf("\n");
  printf("- nametable_report\n");
  printf("  : <index> <key> // <orbit-length>\n");
  int index = 0;
  while (index < nametable_size) {
    if (nametable_entry_occured(nametable[index]) &&
        nametable_entry_no_collision(nametable[index])) {
      printf("  - %d %s // %d\n",
             index, nametable[index].key, nametable[index].orbit_length);
      if (nametable_entry_used(nametable[index])) {
        printf("    = ");
        nametable_entry_print(nametable[index]);
        printf("\n");
      }
      nametable_report_orbit(index, 1);
    }
    index = 1 + index;
  }
  printf("  : <index> <key> // <orbit-length>\n");
  printf("\n");
  printf("- used : %d\n", nametable_counter);
  printf("- free : %d\n", nametable_size - nametable_counter);
}

void
nametable_print
() {
  printf("\n");
  printf("- nametable_print\n");
  int index = 0;
  while (index < nametable_size) {
    printf("  - %d %s %d // %d\n",
           index,
           nametable[index].key,
           nametable[index].value,
           nametable[index].orbit_length);
    index = 1 + index;
  }
  printf("\n");
  printf("- used : %d\n", nametable_counter);
  printf("- free : %d\n", nametable_size - nametable_counter);
}

name
k2n
(string str) {
  return nametable_insert(str);
}

string
n2k
(int index) {
  return nametable[index].key;
}

void
init_nametable
() {
  int i = 0;
  while (i < nametable_size) {
    nametable[i] = new_nametable_entry(i);
    i++;
  }
}

name jojo_area[1024 * 1024];
int jojo_area_counter = 0;

void
here
(int n) {
  jojo_area[jojo_area_counter] = n;
  jojo_area_counter++;
}

void
nametable_set_cell
(int index, int cell) {
  nametable[index].type = k2n("cell");
  nametable[index].value.cell = cell;
}

void
nametable_set_primitive
(int index, primitive primitive) {
  nametable[index].type = k2n("primitive");
  nametable[index].value.primitive = primitive;
}

int
nametable_get_cell
(int index) {
  return nametable[index].value.cell;
}

primitive
nametable_get_primitive
(int index) {
  return nametable[index].value.primitive;
}

jojo
nametable_get_jojo
(int index) {
  return nametable[index].value.jojo;
}

void
nametable_test
() {
  k2n("testkey0");
  k2n("testkey1");
  k2n("testkey2");
  k2n("testkey3");
  k2n("testkey4");

  k2n("testkey0");
  k2n("testkey1");
  k2n("testkey2");
  k2n("testkey3");
  k2n("testkey4");

  k2n("testtestkey0");
  k2n("testtestkey1");
  k2n("testtestkey2");
  k2n("testtestkey3");
  k2n("testtestkey4");

  k2n("testtesttestkey0");
  k2n("testtesttestkey1");
  k2n("testtesttestkey2");
  k2n("testtesttestkey3");
  k2n("testtesttestkey4");

  k2n("testtesttesttestkey0");
  k2n("testtesttesttestkey1");
  k2n("testtesttesttestkey2");
  k2n("testtesttesttestkey3");
  k2n("testtesttesttestkey4");

  nametable_set_cell(k2n("k1"), 1);
  nametable_report();

  nametable_set_cell(k2n("k1"), 0);
  nametable_report();

  // nametable_print();
}

typedef int argument_stack[1024 * 4];

argument_stack as;
int as_pointer = 0;

void
as_push
(int value) {
  as[as_pointer] = value;
  as_pointer = as_pointer + sizeof(int);
}

int
as_pop
() {
  as_pointer = as_pointer - sizeof(int);
  return as[as_pointer];
}

typedef name* return_stack[1024 * 4];

return_stack rs;
int rs_pointer = 0;

void
rs_push
(name* value) {
  rs[rs_pointer] = value;
  rs_pointer = rs_pointer + sizeof(int);
}

name*
rs_pop
() {
  rs_pointer = rs_pointer - sizeof(int);
  return rs[rs_pointer];
}

void
apply
(name jo) {
  if (!nametable_entry_used(nametable[jo])) {
    printf("undefined name : %s\n", n2k(jo));
    return;
  }
  int jo_type = nametable[jo].type;
  if (jo_type == k2n("primitive")) {
    primitive primitive = nametable_get_primitive(jo);
    primitive();
  }
  else if (jo_type == k2n("jojo")) {
    jojo jojo = nametable_get_jojo(jo);
    rs_push(jojo.array);
  }
  else if (jo_type == k2n("cell")) {
    int cell = nametable_get_cell(jo);
    as_push(cell);
  }
}

void
p_apply
() {
  apply(as_pop());
}

jmp_buf jmp_buffer;

bool
exit_eval
() {
  longjmp(jmp_buffer, 666);
}

void
eval
() {
  if (666 == setjmp(jmp_buffer)) {
    return;
  }
  else {
    int rs_base = rs_pointer;
    while (rs_pointer >= rs_base) {
      name* function_body = rs_pop();
      rs_push(function_body + 1);
      int jo = *(int*)function_body;
      apply(jo);
    }
  }
}

void
eval_jo
(name jo) {
  int jo_type = nametable[jo].type;
  if (jo_type == k2n("primitive")) {
    primitive primitive = nametable_get_primitive(jo);
    primitive();
  }
  else if (jo_type == k2n("jojo")) {
    jojo jojo = nametable_get_jojo(jo);
    rs_push(jojo.array);
    eval();
  }
  else if (jo_type == k2n("cell")) {
    int cell = nametable_get_cell(jo);
    as_push(cell);
  }
}

void
define_primitive
(string str, primitive fun) {
  name index = k2n(str);
  nametable_set_primitive(index, fun);
}

void
define_function
(string str, int size, string *str_array) {
  name index = k2n(str);
  int i;
  name *array;
  array = (jojo_area + jojo_area_counter);
  for (i=0; i < size; i=i+1) {
    array[i] = k2n(str_array[i]);
  }
  jojo_area_counter = size + jojo_area_counter;
  nametable[index].type = k2n("jojo");
  nametable[index].value.jojo.size = size;
  nametable[index].value.jojo.array = array;
}

void
define_variable
(string str, int cell) {
  name index = k2n(str);
  nametable_set_cell(index, cell);
}

void
p_dup
() {
  // (int int -> int)
  int a = as_pop();
  as_push(a);
  as_push(a);
}

void
export_stack_operation
() {
  define_primitive("dup", p_dup);
}

void
p_end
() {
  // (rs: addr ->)
  rs_pop();
}

void
p_bye
() {
  // (-> [exit])
  printf("bye bye ^-^/\n");
  exit_eval();
}

void
export_ending
() {
  define_primitive("end", p_end);
  define_primitive("bye", p_bye);
}

void
p_jump_back
() {
  // (offset -> [rs])
  name* function_body = rs_pop();
  rs_push(function_body - as_pop());
}

void
p_jump_over
() {
  // (offset -> [rs])
  name* function_body = rs_pop();
  rs_push(function_body + as_pop());
}

void
i_lit
() {
  // ([rs] -> int)
  name* function_body = rs_pop();
  rs_push(function_body + 1);
  int jo = *(int*)function_body;
  as_push(jo);
}

void
i_tail_call
() {
  // ([rs] -> int)
  name* function_body = rs_pop();
  int jo = *(int*)function_body;
  apply(jo);
}

void
p_jump_if_false
() {
  // (bool addr -> [rs])
  name* a = as_pop();
  int b = as_pop();
  if (b == 0) {
    rs_pop();
    rs_push(a);
  }
}

void
export_control
() {
  define_primitive("jump-back", p_jump_back);
  define_primitive("jump-over", p_jump_over);
  define_primitive("i/lit", i_lit);
  define_primitive("i/tail-call", i_tail_call);
  define_primitive("jump-if-false", p_jump_if_false);
}

void
p_mul
() {
  // (integer integer -> integer)
  int a = as_pop();
  int b = as_pop();
  as_push(a * b);
}

void
export_int
() {
  define_primitive("mul", p_mul);
}

typedef uint8_t byte;

name
read_symbol
() {
  // ([io] -> symbol)
  char buf[1024];
  int cur = 0;
  int collecting = false;
  char c;
  char go = true;
  while (go) {
    c = getchar();
    if (!collecting) {
      if (isspace(c)) {
        // do nothing
      }
      else {
        collecting = true;
        buf[cur] = c;
        cur++;
        if (isbarcket(c)) {
          go = false;
        }
      }
    }
    else {
      if (isbarcket(c) ||
          isspace(c)) {
        ungetc(c, stdin);
        go = false;
      }
      else {
        buf[cur] = c;
        cur++;
      }
    }
  }
  buf[cur] = 0;
  return k2n(buf);
}

void
p_read_symbol
() {
  as_push(read_symbol());
}

void
p_simple_wirte
() {
  // (integer -> [io])
  printf("%d\n", as_pop());
}

void
export_io
() {
  define_primitive("read-symbol", p_read_symbol);
  define_primitive("simple-wirte", p_simple_wirte);
  define_primitive(".", p_simple_wirte);
}

void
p_true
() {
  as_push(1);
}

void
p_false
() {
  as_push(0);
}

void
export_bool
() {
  define_primitive("true", p_true);
  define_primitive("false", p_false);
}

void
k_comment
() {
  // ([io] ->)
  while (true) {
    name s = read_symbol();
    if (s == k2n("(")) {
      k_comment();
    }
    if (s == k2n(")")) {
      break;
    }
  }
}

void
compile_question
() {
  // ([io] -> [jojo_area])
  while (true) {
    name s = read_symbol();
    if (s == k2n("(")) {
      eval_jo(read_symbol());
    }
    else if (s == k2n("->")) {
      break;
    }
    else {
      here(s);
    }
  }
}

void
compile_answer
() {
  // ([io] -> [jojo_area])
  here(k2n("i/lit"));
  int* offset_place = (jojo_area + jojo_area_counter);
  jojo_area_counter++;
  here(k2n("jump-if-false"));
  while (true) {
    name s = read_symbol();
    if (s == k2n("(")) {
      eval_jo(read_symbol());
    }
    else if (s == k2n(")")) {
      break;
    }
    else {
      here(s);
    }
  }
  offset_place[0] = (jojo_area + jojo_area_counter);
}

void
k_if
() {
  // ([io] -> [jojo_area])
  compile_question();
  compile_answer();
}

void
k_tail_call
() {
  // ([io] -> [jojo_area])
  here(k2n("i/tail-call"));
  name s = read_symbol();
  here(s);
  k_comment();

}

void
export_keyword
() {
  define_primitive(":", k_comment);
  define_primitive("if", k_if);
  define_primitive("taca", k_tail_call);
}

void
p_define_function
() {
  // ([io] -> [nametable])
  name index;
  index = read_symbol();
  int old_jojo_area_counter = jojo_area_counter;
  name* array = jojo_area + jojo_area_counter;
  while (true) {
    name s = read_symbol();
    if (s == k2n("(")) {
      eval_jo(read_symbol());
    }
    else if (s == k2n(")")) {
      break;
    }
    else {
      here(s);
    }
  }
  nametable[index].type = k2n("jojo");
  nametable[index].value.jojo.size = jojo_area_counter - old_jojo_area_counter;
  nametable[index].value.jojo.array = array;
}

void
export_top_level_keyword
() {
  define_primitive("define-function", p_define_function);
  define_primitive("~", p_define_function);
}

void
do_nothing
() {
}

void
export_mise
() {
  define_primitive("(", do_nothing);
  define_primitive("apply", p_apply);
}

void
the_story_begins
() {

  init_nametable();

  export_stack_operation();
  export_ending();
  export_control();
  export_int();
  export_io();
  export_bool();
  export_keyword();
  export_top_level_keyword();
  export_mise();

  define_variable("little-test-number", 4);
  // basic-repl can not be defined as primitive
  string p_basic_repl[] = {
    "read-symbol",
    "apply",
    "little-test-number",
    "jump-back"
  };
  define_function("basic-repl", 4, p_basic_repl);

  jojo first_jojo = nametable_get_jojo(k2n("basic-repl"));
  rs_push(first_jojo.array);

  // nametable_report();
  eval();
}

int
main
(int argc, string* argv) {
  the_story_begins();
  // nametable_test();
  return 0;
}
