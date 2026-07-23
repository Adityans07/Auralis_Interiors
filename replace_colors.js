const fs = require("fs");
const path = require("path");

const dirs = [
  "/Users/aditya/auralis-interiors/components/admin",
  "/Users/aditya/auralis-interiors/app/admin"
];

const replacements = [
  [/text-ink-900/g, "text-foreground"],
  [/text-ink-800/g, "text-foreground"],
  [/text-ink-700/g, "text-foreground/90"],
  [/text-ink-600/g, "text-muted-foreground"],
  [/text-ink-500/g, "text-muted-foreground"],
  [/text-ink-400/g, "text-muted-foreground/80"],
  [/border-sand-200/g, "border-white/10"],
  [/border-sand-300/g, "border-white/20"],
  [/bg-white\/70/g, "bg-white/5"],
  [/bg-white\/80/g, "bg-white/5"],
  [/bg-white\/90/g, "bg-white/10"],
  [/bg-white/g, "bg-base"],
  [/bg-sand-100\/50/g, "bg-white/5"],
  [/bg-sand-100\/60/g, "bg-white/5"],
  [/bg-sand-100\/70/g, "bg-void"],
  [/bg-sand-100/g, "bg-white/10"],
  [/text-sand-50/g, "text-foreground"],
  [/text-sand-100\/80/g, "text-muted-foreground"],
  [/text-sand-100\/70/g, "text-muted-foreground"],
  [/text-sand-100/g, "text-muted-foreground"],
  [/text-sand-200/g, "text-muted-foreground"],
  [/text-sand-300/g, "text-muted-foreground"],
  [/bg-ink-900/g, "bg-white/10"],
  [/bg-ink-950\/50/g, "bg-black/50"],
  [/bg-ink-950/g, "bg-void"],
  [/shadow-soft/g, "shadow-glow"],
  [/border-ink-900\/40/g, "border-white/20"],
  [/border-ink-900/g, "border-white/20"],
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      let originalContent = content;
      for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    processDir(dir);
  }
}
console.log("Done");

