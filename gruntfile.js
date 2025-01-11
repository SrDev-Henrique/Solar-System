/* eslint-disable no-undef */

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    less: {
      development: {
        files: {
          "dev/styles/style.css": "src/styles/style.less",
        },
      },
      production: {
        options: {
          compress: true,
        },
        files: {
          "dist/styles/style.min.css": "src/styles/style.less",
        },
      },
    },
    copy: {
      development: {
        files: [
          {
            expand: true,
            cwd: "src/images/",
            src: ["**"],
            dest: "dev/images/",
          },
        ],
      },
      production: {
        files: [
          {
            expand: true,
            cwd: "src/images/",
            src: ["**"],
            dest: "dist/images/",
          },
        ],
      },
    },
    watch: {
      less: {
        files: ["src/styles/style.less"],
        tasks: ["less:development"],
      },
      images: {
        files: ["src/images/**"],
        tasks: ["copy:development"],
      },
    },
    replace: {
      production: {
        options: {
          patterns: [
            {
              match: /dev\/styles\/style\.css/g,
              replacement: "dist/styles/style.min.css",
            },
          ],
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ["index.html"],
            dest: "dist/",
          },
        ],
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-replace");

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", ["less:production", "copy:production"]);
};
