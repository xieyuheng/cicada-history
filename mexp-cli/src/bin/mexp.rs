use std::path::Path;
use std::fs;
use std::io;
use clap as cmd;
use error_report::{
    // ErrorMsg,
    ErrorCtx,
};
use mexp::{
    SyntaxTable,
    // Mexp,
};

fn main () -> io::Result <()> {
    let matches = cmd::App::new ("mexp")
        .setting (cmd::AppSettings::ArgRequiredElseHelp)
        .author (cmd::crate_authors! ())
        .version (cmd::crate_version! ())
        .arg (cmd::Arg::with_name ("FILE")
              .required (true))
        .arg (cmd::Arg::with_name ("--mexp")
              .long ("--mexp")
              .group ("FORMAT")
              .help ("output to mexp format itself"))
        .arg (cmd::Arg::with_name ("--tree")
              .long ("--tree")
              .group ("FORMAT")
              .help ("output to tree format"))
        .arg (cmd::Arg::with_name ("--compact")
              .long ("--compact")
              .help ("compact version of output"))
        .arg (cmd::Arg::with_name ("--output")
              .long ("--output")
              .short ("-o")
              .value_name ("FILE")
              .requires ("FORMAT")
              .takes_value (true))
        .get_matches ();

    let mut output = String::new ();

    if let Some (path_str) = matches.value_of ("FILE") {
        let path = Path::new (path_str);
        if path.is_file () {
            let input = fs::read_to_string (path)?;
            let syntax_table = SyntaxTable::default ();
            let result = syntax_table.parse (&input);
            if result.is_ok () {
                let mexp_vec = result.unwrap ();
                for mexp in mexp_vec {
                    if matches.is_present ("--mexp") {
                        if matches.is_present ("--compact") {
                            output += &mexp.to_string ();
                            output += "\n";
                        } else {
                            output += &mexp.to_pretty_string ();
                            output += "\n";
                        }
                    } else if matches.is_present ("--tree") {
                        if matches.is_present ("--compact") {
                            output += &mexp.to_tree_format ();
                            output += "\n";
                        } else {
                            output += &mexp.to_pretty_tree_format ();
                            output += "\n";
                        }
                    }
                }
            } else {
                let error = result.unwrap_err ();
                let ctx = ErrorCtx::new ()
                    .source (path_str)
                    .body (&input);
                error.print (ctx);
                std::process::exit (1);
            }
        } else {
            eprintln! ("- input path is not to a file");
            eprintln! ("  path = {:?}", path);
            std::process::exit (1);
        }
    }

    if let Some (path_str) = matches.value_of ("--output") {
        let path = Path::new (path_str);
        if let Err (error) = fs::write (path, output) {
            eprintln! ("- output fail");
            eprintln! ("  path = {:?}", path);
            eprintln! ("  error = {}", error);
            std::process::exit (1);
        }
    } else {
        print! ("{}", output);
    }

    Ok (())
}
