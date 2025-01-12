/* eslint-disable no-undef */

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    // todo Configuração de LESS
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

    // todo Minificação de HTML
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
        },
        files: {
          "prebuild/index.html": "src/index.html",
        },
      },
    },

    // todo Substituição de caminhos no HTML
    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: "ENDEREÇO_DO_CSS",
              replacement: "./styles/style.css",
            },
            {
              match: "ENDEREÇO_DO_JS_1",
              replacement: "../src/scripts/script.js",
            },
            {
              match: "ENDEREÇO_DO_JS_2",
              replacement: "../src/scripts/sketch.js",
            },
          ],
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ["src/index.html"],
            dest: "dev/",
          },
        ],
      },
      dist: {
        options: {
          patterns: [
            {
              match: "ENDEREÇO_DO_CSS",
              replacement: "styles/style.min.css",
            },
            {
              match: "ENDEREÇO_DO_JS_1",
              replacement: "scripts/script.min.js",
            },
            {
              match: "ENDEREÇO_DO_JS_2",
              replacement: "scripts/sketch.min.js",
            },
          ],
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ["prebuild/index.html"],
            dest: "dist/",
          },
        ],
      },
    },

    // todo Minificação de JavaScript
    uglify: {
      target: {
        files: {
          "dist/scripts/script.min.js": ["src/scripts/script.js"],
          "dist/scripts/sketch.min.js": ["src/scripts/sketch.js"],
        },
      },
    },

    // todo Copiar imagens
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

    // todo Limpar diretórios temporários
    clean: ["prebuild"],

    // todo Observador de mudanças
    watch: {
      less: {
        files: ["src/styles/*.less"],
        tasks: ["less:development"],
      },
      html: {
        files: ["src/index.html"],
        tasks: ["replace:dev"],
      },
      images: {
        files: ["src/images/**"],
        tasks: ["copy:development"],
      },
    },
  });

  // todo Carregando tarefas do Grunt
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks("grunt-contrib-htmlmin");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-copy");

  // todo Registrando tarefas
  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", [
    "less:production",
    "htmlmin:dist",
    "replace:dist",
    "copy:production",
    "uglify",
    "clean",
  ]);
};
