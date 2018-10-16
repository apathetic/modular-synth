import { storiesOf } from '@storybook/vue';
// import VCO from '@/components/VCO.vue';

storiesOf('VCO', module)
  .add('story as a template', () => '<VCO :rounded="true">story as a function template</VCO>')
  .add('story as a component', () => ({
    components: { VCO },
    template: '<VCO :id="1"></VCO>'
  }));