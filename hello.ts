import pc from "picocolors";

function banner(text: string): string {
  return pc.bold(pc.green(text));
}

const who = process.argv.length > 2 ? process.argv[2] : "world";
console.log(banner(`hello, ${who}`));
