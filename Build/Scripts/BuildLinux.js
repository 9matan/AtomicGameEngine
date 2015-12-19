var fs = require('fs-extra');
var path = require("path");
var host = require("./Host");
var atomicRoot = host.atomicRoot;

var buildDir = host.artifactsRoot + "Build/Linux/";
var editorAppFolder = host.artifactsRoot + "AtomicEditor/";

namespace('build', function() {

// Builds a standalone Atomic Editor, which can be distributed out of build tree
task('atomiceditor', {
  async: true
}, function() {

  // Clean build
  var cleanBuild = true;
  if (cleanBuild) {
    common.cleanCreateDir(buildDir);
    common.cleanCreateDir(editorAppFolder);
    common.cleanCreateDir(host.getGenScriptRootDir("LINUX"));
  }

  // create the generated script files, so they will be picked up by cmake
  host.createGenScriptFiles("LINUX");

  process.chdir(buildDir);

  var cmds = [];

  cmds.push("cmake ../../../ -DATOMIC_DEV_BUILD=0 -DCMAKE_BUILD_TYPE=Release -DATOMIC_BUILD_2D=0 -DLINUX=1 ");
  cmds.push("make GenerateScriptBindings")
  cmds.push("make AtomicEditor AtomicPlayer")

  jake.exec(cmds, function() {

      // Copy the Editor binaries
      fs.copySync(buildDir + "Source/AtomicEditor/AtomicEditor",
        host.artifactsRoot + "AtomicEditor/AtomicEditor");

      // We need some resources to run
      fs.copySync(atomicRoot + "Resources/CoreData",
        editorAppFolder + "Resources/CoreData");

      fs.copySync(atomicRoot + "Resources/PlayerData",
        editorAppFolder + "Resources/PlayerData");

      fs.copySync(atomicRoot + "Data/AtomicEditor",
        editorAppFolder + "Resources/ToolData");

      fs.copySync(atomicRoot + "Resources/EditorData",
        editorAppFolder + "Resources/EditorData");

      fs.copySync(atomicRoot + "Artifacts/Build/Resources/EditorData/AtomicEditor/EditorScripts",
        editorAppFolder + "Resources/EditorData/AtomicEditor/EditorScripts");

      fs.copySync(buildDir +  "Source/AtomicPlayer/Application/AtomicPlayer",
        editorAppFolder + "Resources/ToolData/Deployment/Linux/AtomicPlayer");

    console.log("\n\nAtomic Editor build to " + editorAppFolder + "\n\n");

    complete();

  }, {
    printStdout: true
  });

});

});// end of build namespace
