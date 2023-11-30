// import Vue from 'vue';
import { storiesOf } from '@storybook/vue';
import OSC from '@/components/OSC.vue';


storiesOf('OSC', module)
  .add('Edit Mode', () => ({
    components: { OSC },
    template: `
      <div class="edit-mode">
        <div class="module module--tall _4U">
          <OSC :id="1"></OSC>
        </div>
      </div>
      `
    }))
  .add('Play Mode', () => ({
    components: { OSC },
    template: `
      <div class="play-mode">
        <div class="module module--tall _4U">
          <OSC :id="1"></OSC>
        </div>
      </div>
      `
  }));
