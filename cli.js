#!/usr/bin/env node
const { Command } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const ora = require("ora");
const path = require("path");

const { initConfig, initSrcFun, initDependent } = require("./bin/common");

const program = new Command();

const configName = "acli.config.json";
const _ora = ora({ color: "yellow" });

program
  .version(require("./package.json").version)
  .usage("<command> [options]")
  .option("-c, --component < 组件文件名 >", "创建组件文件结构目录")
  .option("-crm, --remove < 组件文件名 >", "删除组件文件")
  .action(args => {
    console.log("option", args);
  });

program
  .command("init")
  .description("项目初始")
  .action(args => {
    const configPath = path.join(process.cwd(), configName);
    if (!fs.pathExistsSync(configPath)) {
      _ora.fail("配置文件不存在！");
      initConfig();
    }
    const configJson =
      fs.readJsonSync(configPath, {
        throws: false
      }) || {};
    const { initDir, ts } = configJson;
    if (!initDir) {
      _ora.fail(`${configName}中的initDir必须有值！`);
      return;
    }
    const srcDir = path.join(process.cwd(), initDir);
    if (fs.pathExistsSync(srcDir)) {
      inquirer
        .prompt([
          {
            type: "confirm",
            name: "over",
            message: `${initDir}已存在！是否覆盖`,
            default: false
          }
        ])
        .then(answer => {
          if (!answer.over) {
            _ora.fail(`${initDir}已存在！请修改配置文件后在初始化目录`);
            return;
          }
          initSrcFun(path.join(process.cwd(), initDir), ts);
        });
      return;
    }
    initSrcFun(srcDir, ts);
  });

program
  .command("install")
  .description("安装默认依赖")
  .action(() => {
    if (!fs.pathExistsSync(path.join(process.cwd(), "package.json"))) {
      _ora.fail(`package.json不存在！请先执行npm init或者yarn init`);
      return;
    }
    initDependent();
  });

program.parse(process.argv);
