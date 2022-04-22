//collect files, call function to setup the environment, and run those files

const fs = require('fs');
const {readdir, lstat} = require('fs/promises');
const path = require('path');
const chalk = require('chalk')
const render = require('./render.js')

const forbiddenDirs = ['node_modules'];

class Runner {
    constructor() {
        this.testFiles = [];

    }

    async runTests() {
        const startTime = Date.now();
        for (let file of this.testFiles) {
            console.log(chalk.grey(`-----${file.shortName}`));
            const beforeEaches = [];
            global.render = render;
            global.beforeEach = (fn) => {
                beforeEaches.push(fn);
            }

            //define gloabl it function
            global.it = async (desc, fn) => {
                beforeEaches.forEach(func => func());
                try {
                    await fn();
                    console.log(chalk.green(`\tOK - ${desc}`));
                    const endTime = Date.now();
                    console.log(chalk.cyan(`\ttest completed in ${endTime - startTime} ms`));
                } catch (err) {
                    const message = err.message.replace(/\n/g, '\n\t\t')
                    console.log(chalk.red(`\tX - ${desc}`));
                    console.log(chalk.red('\t------', message));
                    const endTime = Date.now();
                    console.log(chalk.cyan(`\ttest completed in ${endTime - startTime} ms`));
                }
            };
                try {
                    require(file.name) //node will automatically load and run this file
                } catch (err) {
                    console.log(chalk.red('\t--------', err));
                }

            }
        
    }

    async collectFiles(targetPath) {
        const files = await readdir(targetPath);
        for (let file of files) {
            const filepath = path.join(targetPath, file);
            const stats = await lstat(filepath);

            if (stats.isFile() && file.includes('.test.js')) {
                this.testFiles.push({ name: filepath, shortName: file});
            } else if (stats.isDirectory() && !forbiddenDirs.includes(file)) {
                const childFiles = await readdir(filepath);
                files.push(...childFiles.map(f => path.join(file, f))); //take all files in childFiles array and add them each in individually
            }
        }
    }
}

module.exports = Runner; 