var cssnext = require('cssnext');

module.exports = {
  sass: {
    includePaths: [
      'src/assets/scss/'
    ]
  },

  postcss: [cssnext()],

  autoprefixer: false
};
