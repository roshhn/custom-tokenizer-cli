#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import { CustomTokenizer } from "./tokenizer.js";

const program = new Command();

program.name("tokenizer").description("Custom Tokenizer CLI").version("1.0.0");

program
    .command("train")
    .description("Train tokenizer on text file")
    .option("-i, --input <file>", "input text file")
    .option("-o, --output <file>", "output tokenizer file", "tokenizer.json")
    .option("-m, --min-freq <number>", "minimum token frequency", "1")
    .action(async (options) => {
        try {
            console.log(chalk.blue("🚀 Training tokenizer..."));

            const text = options.input
                ? fs.readFileSync(options.input, "utf8")
                : "Hello world! This is a sample text for training our custom tokenizer. It handles punctuation, special tokens, and vocabulary learning.";

            const tokenizer = new CustomTokenizer();
            tokenizer.train(text, parseInt(options.minFreq));

            fs.writeFileSync(
                options.output,
                JSON.stringify(tokenizer.export(), null, 2)
            );

            console.log(chalk.green("✅ Training complete!"));
            console.log(
                chalk.yellow(`📊 Vocabulary size: ${tokenizer.vocabSize}`)
            );
            console.log(chalk.yellow(`💾 Saved to: ${options.output}`));
        } catch (error) {
            console.error(chalk.red("❌ Error:"), error.message);
        }
    });

program
    .command("encode")
    .description("Encode text to token IDs")
    .option("-t, --tokenizer <file>", "tokenizer file", "tokenizer.json")
    .option("-s, --special", "add special tokens")
    .argument("<text>", "text to encode")
    .action(async (text, options) => {
        try {
            const tokenizerData = JSON.parse(
                fs.readFileSync(options.tokenizer, "utf8")
            );
            const tokenizer = new CustomTokenizer().import(tokenizerData);

            const tokenIds = tokenizer.encode(text, options.special);

            console.log(chalk.blue("📝 Input:"), text);
            console.log(chalk.green("🔢 Token IDs:"), tokenIds.join(", "));
            console.log(chalk.yellow("📊 Token count:"), tokenIds.length);
        } catch (error) {
            console.error(chalk.red("❌ Error:"), error.message);
        }
    });

program
    .command("decode")
    .description("Decode token IDs to text")
    .option("-t, --tokenizer <file>", "tokenizer file", "tokenizer.json")
    .option("-k, --keep-special", "keep special tokens in output")
    .argument("<ids>", "comma-separated token IDs")
    .action(async (ids, options) => {
        try {
            const tokenizerData = JSON.parse(
                fs.readFileSync(options.tokenizer, "utf8")
            );
            const tokenizer = new CustomTokenizer().import(tokenizerData);

            const tokenIds = ids.split(",").map((id) => parseInt(id.trim()));
            const text = tokenizer.decode(tokenIds, !options.keepSpecial);

            console.log(chalk.blue("🔢 Token IDs:"), tokenIds.join(", "));
            console.log(chalk.green("📝 Decoded text:"), text);
        } catch (error) {
            console.error(chalk.red("❌ Error:"), error.message);
        }
    });

program
    .command("stats")
    .description("Show tokenizer statistics")
    .option("-t, --tokenizer <file>", "tokenizer file", "tokenizer.json")
    .action(async (options) => {
        try {
            const tokenizerData = JSON.parse(
                fs.readFileSync(options.tokenizer, "utf8")
            );
            const tokenizer = new CustomTokenizer().import(tokenizerData);

            const stats = tokenizer.getStats();

            console.log(chalk.blue("📊 Tokenizer Statistics:"));
            console.log(chalk.yellow("  Vocabulary size:"), stats.vocabSize);
            console.log(chalk.yellow("  Special tokens:"), stats.specialTokens);
            console.log(chalk.yellow("  Is trained:"), stats.isTraned);
            console.log(chalk.yellow("  Sample tokens:"));
            stats.sampleTokens.forEach(([token, id]) => {
                console.log(chalk.gray(`    ${id}: "${token}"`));
            });
        } catch (error) {
            console.error(chalk.red("❌ Error:"), error.message);
        }
    });

program.parse();
