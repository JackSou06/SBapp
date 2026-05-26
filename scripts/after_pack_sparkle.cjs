const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") {
    return;
  }

  const repoRoot = context.packager.projectDir;
  const helperSource = path.join(repoRoot, "build", "native", "SparkleUpdateHelper");
  const frameworkSource =
    process.env.SPARKLE_FRAMEWORK_PATH || path.join(repoRoot, "native", "vendor", "Sparkle.framework");

  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appBundle = path.join(context.appOutDir, appName);
  const resourcesDir = path.join(appBundle, "Contents", "Resources");
  const frameworksDir = path.join(appBundle, "Contents", "Frameworks");

  if (fs.existsSync(helperSource)) {
    fs.copyFileSync(helperSource, path.join(resourcesDir, "SparkleUpdateHelper"));
    fs.chmodSync(path.join(resourcesDir, "SparkleUpdateHelper"), 0o755);
  } else {
    console.warn("SparkleUpdateHelper was not found; packaged app will show a setup message for update checks.");
  }

  if (fs.existsSync(frameworkSource)) {
    fs.mkdirSync(frameworksDir, { recursive: true });
    const result = spawnSync("ditto", [frameworkSource, path.join(frameworksDir, "Sparkle.framework")], {
      stdio: "inherit"
    });

    if (result.status !== 0) {
      throw new Error("Failed to copy Sparkle.framework into the app bundle.");
    }
  } else {
    console.warn("Sparkle.framework was not found at native/vendor/Sparkle.framework.");
  }
};
