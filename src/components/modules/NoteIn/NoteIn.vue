<template>
  <div class="note-in">
    <div class="module-details">
      <h3>NoteIn</h3>
    </div>

    <div class="module-interface">
      <span class="received" :class="{active: active}"></span>

      <p>note: {{ noteName }}</p>
      <p>freq: {{ Math.round(freq) }} Hz</p>
      <p>vel:  {{ velocity }}</p>
      <p>bend: {{ bend }}</p>
      <p>mod:  {{ mod }}</p>
    </div>

    <div class="module-connections">
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, computed, ref, onUnmounted } from 'vue';
  import { useEventBus, useKeyboard } from '@/composables';
  import sync from './worker';
  // import rollover from './rollover';

  const noteNames: String[] = [];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let i = 0; i < 127; i++) {
    let key = notes[i % 12] + '-';
    const octave = ((i / 12) | 0) - 1; // MIDI scale starts at octave = -1

    key += octave;
    noteNames[i] = key;
  }

  export default defineComponent({
    name: 'NoteIn',
    props: {
      id: null
    },

    setup (props, { expose }) {
      const note = ref(0);
      const freq = ref(440);
      const velocity = ref(0);
      const mod = ref(0);
      const bend = ref(0);
      const active = ref(0);
      const noteName = computed(() => noteNames[note.value] || '');


      const outlets = [
        { label: 'freq', data: 'freq' }, // "string" of the property to connect
        { label: 'vel', data: 'velocity' }, // for now. should be "gate" or "trigger"...
        { label: 'bend', data: 'bend' },
        { label: 'mod', data: 'mod' }
      ];


      const bus = useEventBus('midi');
      // const bus = useMidi();
      // const bus = useOSC();
      // const sw = useSW();

      // call `unsubscribe` to stop listening for events
      const unsubscribeMIDI = bus.on((event, ...payload) => {
        console.log(`news: ${event}`, payload);
      });

      const unsubcribeKeys = useKeyboard({ noteOn, noteOff });


      /**
      * [noteOn description]
      * @param  {number} note     Midi note.
      * @param  {number} velocity Midi velocity beteen 1 - 127.
      */
      function noteOn(n: number, v: number) {
        note.value = n;
        velocity.value = (v / 127.0);
        freq.value = 440 * (Math.pow(2, ((n - 69) / 12)));
        active.value = n;
        sync({ note: n, velocity: v });
      }

      function noteOff(n: number) {
        note.value = n;

        if (n === active.value) {
          active.value = 0;
          velocity.value = 0;
          sync({ note: n, velocity:0 });
        }
      }

      function pitchWheel(b: number) {
        bend.value = +b.toFixed(3);
      }

      function controller(target, val: number) {
        mod.value = (val / 127.0); //.toFixed(3);
      }

      onUnmounted(() => {
        unsubscribeMIDI();
        unsubcribeKeys();
        // unsubOSC();
        // unsubSW()
      });

      // DATA / AUDIO
      expose({
        outlets
      });

      // UI
      return {
        outlets,
        noteName,
        freq,
        velocity,
        bend,
        mod,
        active
      };
    }

  });
</script>

<style lang="scss">
  // @import 'styles/variables.scss';
  .note-in {
    .received {
      display: block;
      border-radius: 1em;
      width: 2em;
      height: 2em;
      background: var(--color-grey-medium);

      &.active {
        background: var(--color-green);
      }
    }
  }
</style>
