/*global config:true, task:true*/
config.init({
  pkg: '<json:package.json>',
  meta: {
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= template.today("m/d/yyyy") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
      '* Copyright (c) <%= template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
  },
  concat: {
    'dist/platoon.js': ['<banner>', '<file_strip_banner:lib/platoon.js>'],
    'public/javascripts/platoon.js': ['<banner>', '<file_strip_banner:lib/platoon.js>']
  },
  min: {
    'dist/platoon.min.js': ['<banner>', 'dist/platoon.js'],
    'public/javascripts/platoon.min.js': ['<banner>', 'public/javascripts/platoon.js']
  },
  test: {
    files: ['test/**/*.html']
  },
  lint: {
    files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
  },
  watch: {
    files: '<config:lint.files>',
    tasks: 'lint test'
  },
  jshint: {
    options: {
      curly: true,
      eqeqeq: true,
      immed: true,
      latedef: true,
      newcap: true,
      noarg: true,
      sub: true,
      undef: true,
      boss: true,
      eqnull: true,
      browser: true
    },
    globals: {
      jQuery: true,
      exports: true,
      module: true,
      console: true
    }
  },
  uglify: {}
});

// Default task.
task.registerTask('default', 'lint test concat min');
