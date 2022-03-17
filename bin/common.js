const path = require("path");
const chalk = require("chalk");
const ejs = require("ejs");
const fs = require("fs-extra");
const ora = require("ora");
const childProcess = require("child_process");

const resolve = _path => path.resolve(__dirname, _path);
const _ora = ora({ color: "yellow" });

function throwError(error) {
  _ora.fail(error);
  throw error;
}

const initConfig = () => {
  const configPath = "../templates/configs";
  const fileArr = fs.readdirSync(resolve(configPath));
  try {
    fileArr.forEach(f => {
      const targetPath = path.join(process.cwd(), f);
      fs.copyFileSync(path.join(configPath, f), targetPath);
    });
    _ora.succeed("配置文件初始化成功！");
  } catch (error) {
    throwError(error);
  }
};

const initSrcFun = (_path, isTS) => {
  const copyDir = resolve("../templates/srcTemp");
  const jsxDirArr = ["components", "container", "layout"];
  const jsDirArr = ["redux", "router", "utils"];
  const dirArr = ["styles"];

  const fileType = isTS ? "t" : "j";

  fs.ensureDir(_path)
    .then(() => {
      jsxDirArr.concat(jsDirArr, dirArr).forEach(i => {
        const fileDir = path.join(_path, i);
        if (jsxDirArr.includes(i)) {
          fs.ensureFile(path.join(fileDir, `index.${fileType}sx`));
        }
        if (jsDirArr.includes(i)) {
          fs.ensureFile(path.join(fileDir, `index.${fileType}s`));
        }
        if (dirArr.includes(i)) {
          fs.ensureDir(path.join(fileDir, `index.${fileType}s`));
        }
      });

      fs.readdir(copyDir, (e, result) => {
        result.forEach(r => {
          let _r = r;
          if (r === "index.jsx") {
            _r = `index.${fileType}sx`;
          }
          fs.copy(path.join(copyDir, r), path.join(_path, _r));
        });
      });
      _ora.succeed("目录初始成功");
    })
    .catch(throwError);
};

const initDependent = () => {
  _ora.start("安装依赖");
  childProcess.execFile(
    resolve("../dependent.sh"),
    {
      cwd: process.cwd()
    },
    (error, stdout, stderr) => {
      if (error) {
        throwError(error);
      }
      if (stderr) {
        _ora.fail(stderr);
      }
      _ora.info(stdout);
      _ora.succeed("安装依赖完成！");
    }
  );
};

module.exports = { initSrcFun, initConfig, initDependent };
