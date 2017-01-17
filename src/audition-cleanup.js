const fs = require('fs'),
      path = require('path'),
      glob = require('glob'),
      async = require("async"),
      xml2js = require('xml2js');

import {
  thenErrorHelper
} from './thenErrorHelper.js';

const projectFileScanners = {};
projectFileScanners['1.0'] =
projectFileScanners['1.1'] =
projectFileScanners['1.2'] =
projectFileScanners['1.3'] = (rootNode, filesToKeep) => {

  if (!(rootNode.files && Array.isArray(rootNode.files)
        && rootNode.files.length >= 1)) {
    throw new Error('Invalid project file. Unable to find file list.');
  }

  // # Collect files from each file list.
  rootNode.files.forEach((fileListNode) => {
    if (fileListNode && typeof fileListNode === 'object'
        && fileListNode.file && Array.isArray(fileListNode.file)
        && fileListNode.file.length > 0) {

      fileListNode.file.forEach((fileNode) => {

        if (fileNode && typeof fileNode === 'object'
            && fileNode.$ && typeof fileNode.$ === 'object'
            && fileNode.$.relativePath && typeof fileNode.$.relativePath === 'string') {

          filesToKeep.add(fileNode.$.relativePath);

        }

      });

    }

  });

};

const parser = new xml2js.Parser({
  explicitRoot: false,
  async: false
});

/**
 * @async
 * @param {string} projectFolderPath
 * @param {Set.<string>} filesToKeep
 * @param {Function} then(err, filesDeleted)
 */
const removeUnusedFilesInProjectFolder = (projectFolderPath, filesToKeep, then) => {
  // # Scan files in the next level.
  glob("*/**/*.*", {
    cwd: projectFolderPath
  }, (err, files) => {
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // err is an error object or null.

    if (thenErrorHelper(err, then)) return;

    const filesToDelete = [];

    files.forEach((filePath) => {

      if (!filesToKeep.has(filePath)) {
        filesToDelete.push(filePath);
      }

    });

    filesToDelete.forEach((filePath) => {
      fs.unlinkSync(path.join(projectFolderPath, filePath));
    });

    if (then) {
      then(null, filesToDelete);
    }

  });
};

/**
 * @async
 * @param {string} rootDir
 * @param {Function} then(err, filesDeleted)
 */
export const cleanupProjectFolder = (rootDir, then) => {

  // # Scan current directory for `.sesx` files. There should be only one. But in case we found multiple, do these for each one of them.
  glob("*.sesx", {
    cwd: rootDir
  }, (err, files) => {
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // err is an error object or null.

    if (thenErrorHelper(err, then)) return;

    if (files.length === 0) {
      console.log('No project file found.');
      then(null, []);
      return;
    }

    const filesToKeep = new Set();

    async.eachSeries(files, function scanThisProject (projectFile, next) {

      const projectFileAbsPath = path.join(rootDir, projectFile);

      console.log(`Reading project file: ${projectFile}`);

      fs.readFile(projectFileAbsPath, (err, data) => {

        if (thenErrorHelper(err, next)) return;

        console.log('Parsing...');
        parser.parseString(data, function (err, result) {

          if (thenErrorHelper(err, next)) return;

          try {

            if (!(result && typeof result === 'object')) {
              throw new Error('Invalid project file. Unable to find root node.');
            }

            const rootNode = result;

            // # Check scheme version.
            if (!(rootNode.$ && typeof rootNode.$ === 'object'
                  && rootNode.$.version)) {
              throw new Error('Invalid project file. Unable to find project file version.');
            }
            if (!projectFileScanners[rootNode.$.version]) {
              throw new Error('Invalid project file. Unsupported project file version.');
            }

            projectFileScanners[rootNode.$.version](rootNode, filesToKeep);

          } catch (err) {

            if (thenErrorHelper(err, next)) return;

          }

          next(null);

        });

      });

    }, function scanAllComplete (err) {

      if (thenErrorHelper(err, then)) return;

      console.log('Files to keep:', filesToKeep);

      removeUnusedFilesInProjectFolder(rootDir, filesToKeep, then);

    });

  });

};
