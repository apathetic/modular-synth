import Vue from 'vue';
import App from 'src/App';

describe('App.vue', () => {
  it('should render correct contents', () => {

    const vm = new Vue({
      template: '<div><app></app></div>',
      components: { App }
    }).$mount();

    expect(vm.$el.querySelector('#modules').to.exist());
    expect(vm.$el.querySelector('#connections').to.exist());
    expect(vm.$el.querySelector('#controls').to.exist());

  });
})
