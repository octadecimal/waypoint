#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function extractDotBlocks(markdown) {
  const blocks = [];
  const regex = /```dot\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const content = match[1].trim();
    const name = content.match(/digraph\s+(\w+)/)?.[1] ?? `graph_${blocks.length + 1}`;
    blocks.push({ name, content });
  }
  return blocks;
}

export function graphBody(dot) {
  const match = dot.match(/digraph\s+\w+\s*\{([\s\S]*)\}/);
  return match ? match[1].replace(/^\s*rankdir\s*=\s*(?:"[^"]*"|\w+)\s*;?\s*/gm, "").trim() : "";
}

function combineGraphs(blocks, name) {
  const clusters = blocks.map(({ name: label, content }, index) => {
    const body = graphBody(content)
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n");
    return `  subgraph cluster_${index} {\n    label=${JSON.stringify(label)};\n${body}\n  }`;
  });
  return `digraph ${name}_combined {\n  rankdir=TB;\n  compound=true;\n  newrank=true;\n\n${clusters.join("\n\n")}\n}`;
}

function render(dot) {
  return execFileSync("dot", ["-Tsvg"], {
    input: dot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

function main() {
  const args = process.argv.slice(2);
  const combine = args.includes("--combine");
  const skillArgument = args.find((argument) => !argument.startsWith("--"));
  if (!skillArgument) {
    console.error("Usage: render_graphs.mjs <skill-directory> [--combine]");
    return 2;
  }

  const skillDirectory = path.resolve(skillArgument);
  const skillFile = path.join(skillDirectory, "SKILL.md");
  if (!existsSync(skillFile)) {
    console.error(`SKILL.md not found: ${skillFile}`);
    return 2;
  }

  const blocks = extractDotBlocks(readFileSync(skillFile, "utf8"));
  if (blocks.length === 0) {
    console.log(`No dot blocks found in ${skillFile}`);
    return 0;
  }

  try {
    execFileSync("dot", ["-V"], { stdio: "ignore" });
  } catch {
    console.error("Graphviz 'dot' is required to render diagrams.");
    return 2;
  }

  const outputDirectory = path.join(skillDirectory, "diagrams");
  mkdirSync(outputDirectory, { recursive: true });
  if (combine) {
    const name = path.basename(skillDirectory).replaceAll("-", "_");
    const dot = combineGraphs(blocks, name);
    writeFileSync(path.join(outputDirectory, `${name}_combined.dot`), dot);
    writeFileSync(path.join(outputDirectory, `${name}_combined.svg`), render(dot));
  } else {
    for (const block of blocks) {
      writeFileSync(path.join(outputDirectory, `${block.name}.svg`), render(block.content));
    }
  }
  console.log(`Rendered ${blocks.length} diagram(s) to ${outputDirectory}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
