const ansiSubs = (string) =>
  string
    .replace(/&lpar;/g, "(")
    .replace(/&rpar;/g, ")")
    .replace(/&#91;/g, "[")
    .replace(/&#93;/g, "]")
    .replace(/&#44;/g, ",")
    // Foreground colors
    .replace(/%[cCxX]x/g, "\u001b[30m")
    .replace(/%[cCxX]r/g, "\u001b[31m")
    .replace(/%[cCxX]g/g, "\u001b[32m")
    .replace(/%[cCxX]y/g, "\u001b[33m")
    .replace(/%[cCxX]b/g, "\u001b[34m")
    .replace(/%[cCxX]m/g, "\u001b[35m")
    .replace(/%[cCxX]c/g, "\u001b[36m")
    .replace(/%[cCxX]w/g, "\u001b[37m")
    .replace(/%[cCxX]n/g, "\u001b[0m")
    .replace(/%[cCxX]h/g, "\u001b[1m")
    .replace(/%[cCxX]X/g, "\u001b[40m")
    .replace(/%[cCxX]R/g, "\u001b[41m")
    .replace(/%[cCxX]G/g, "\u001b[42m")
    .replace(/%[cCxX]Y/g, "\u001b[42m")
    .replace(/%[cCxX]B/g, "\u001b[43m")
    .replace(/%[cCxX]M/g, "\u001b[44m")
    .replace(/%[cCxX]C/g, "\u001b[45m")
    .replace(/%[cCxX]W/g, "\u001b[47m")
    .replace(/%c(\d{1,3})/g, "\u001b[38;5;$1m")
    .replace(/%[bB]/g, " ")
    .replace(/%[rR]/g, "\n")
    .replace(/%{tT}/g, "\t")
    .replace(/%[uU]/g, "\u001b[4m");

module.exports.ansiSubs = ansiSubs;
