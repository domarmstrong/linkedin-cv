/*
 gulpfile.js
 ===========
 Rather than manage one giant configuration file responsible
 for creating multiple tasks, tasks are broken out into
 separate files in src/gulp/tasks. Any files in that directory get
 automatically required below.
 To add a new task, simply add a new task file that directory.
 gulp/tasks/default.js specifies the default set of tasks to run
 when you run `gulp`.
 Tasks may be grouped in files by relevance.
 Any imports are parsed with babel from this point.
 */

var requireDir = require('require-dir');

// Parse further import with babel
require('babel/register')({
  only: /src/
});

// Require all tasks in gulp/tasks, including subfolders
requireDir('./src/gulp/tasks', { recurse: true });

