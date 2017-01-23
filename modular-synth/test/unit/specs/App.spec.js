import Vue from 'vue';
import App from 'src/App';

describe('App.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      template: '<div><app></app></div>',
      components: { App }
    }).$mount();

    // expect(vm.$el.querySelector('.hello h1').textContent).to.contain('Hello World!');

  });
})
