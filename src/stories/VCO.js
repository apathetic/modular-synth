// import Vue from 'vue';
import { storiesOf } from '@storybook/vue';
import VCO from '@/components/VCO.vue';


storiesOf('VCO', module)
  .add('Edit Mode', () => ({
    components: { VCO },
    template: `
      <div class="edit-mode">
        <div class="module module--tall _4U">
          <VCO :id="1"></VCO>
        </div>
      </div>
      `
    }))
  .add('Play Mode', () => ({
    components: { VCO },
    template: `
      <div class="play-mode">
        <div class="module module--tall _4U">
          <VCO :id="1"></VCO>
        </div>
      </div>
      `
  }));
