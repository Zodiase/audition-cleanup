[![Build Status](https://travis-ci.com/Zodiase/audition-cleanup.svg?branch=master)](https://travis-ci.com/Zodiase/audition-cleanup)
[![Greenkeeper badge](https://badges.greenkeeper.io/Zodiase/audition-cleanup.svg)](https://greenkeeper.io/)

This program scans the given Adobe Audition project directories and deletes unused files.
Please make sure to backup your data and only delete your backup after verifying the 
clean up was successful.

# Install

```
$ npm install @xch/audition-cleanup
```

# Example

Suppose there is a project folder at `/some/path/foobar` and the project file at
`/some/path/foobar/foobar.sesx`.

```Bash
$ audition-cleanup /some/path/foobar
```

Running the above command would delete all the files under sub-folders of the project 
folder that are not used by the project file.

You can cleanup multiple project folders together by appending all the paths to the 
command, such as:
```Bash
$ audition-cleanup /some/path/proj_1 /some/path/proj_2 /some/path/proj_3
```
