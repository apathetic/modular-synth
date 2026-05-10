<script lang="ts">
  import { defineComponent, computed, ref, onUnmounted } from 'vue';
  import { useMidi, useKeyboard } from '~/composables';
  import { useAppStore } from '~/stores/app';
  import { dispatchToWorker, onWorkerMessage } from '~/utils/worker';
  import { Knob, Slider, Button } from '~/components/UI';

  const noteNames: string[] = [];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let i = 0; i < 127; i++) {
    let key = notes[i % 12] + '-';
    const octave = ((i / 12) | 0) - 1; // MIDI scale starts at octave = -1

    key += octave;
    noteNames[i] = key;
  }

  export default defineComponent({
    name: 'NoteIn',
    components: {
      Knob,
      Slider,
      Button,
    },
    props: {
      id: {
        type: Number,
        required: true
      }
    },

    setup (props, { expose }) {
      const store = useAppStore();
      const midi = useMidi({ noteOn, noteOff, pitchWheel, controller });
      const unsubcribeKeys = useKeyboard({ noteOn, noteOff });

      const note = ref(0);
      const pitch = computed(() => {
        const bentNote = note.value + (bend.value * 2);
        return 440 * Math.pow(2, (bentNote - 69) / 12);
      });
      const gate = ref(0);
      const velocity = ref(0);
      const mod = ref(0);
      const bend = ref(0);
      const noteName = computed(() => noteNames[note.value] || '');

      // UI state
      const muted = ref(false);
      const glide = ref(0);
      const legato = ref(false);
      const priority = ref('LAST');
      const priorityOptions = ['LAST', 'HI', 'LO'];

      const outlets = [
        { label: 'pitch', data: 'pitch' },
        { label: 'gate',  data: 'gate' },     // binary 0|1
        { label: 'vel',   data: 'velocity' }, // 0–1 float
        { label: 'bend',  data: 'bend' },
        { label: 'mod',   data: 'mod' },
      ];

      const cyclePriority = () => {
        const index = priorityOptions.indexOf(priority.value);
        priority.value = priorityOptions[(index + 1) % priorityOptions.length];
      };

      const snapOnRelease = (param: string) => {
        window.addEventListener('mouseup', () => {
          store.setParameter({ moduleId: props.id, param, value: 0 });
        }, { once: true });
      };

      // Handle messages from the Service Worker assigning notes to this tab
      const unsubscribeWorker = onWorkerMessage((data) => {
        if (data.type === 'playNote') {
          playNote(data.note, data.velocity);
        } else if (data.type === 'stopNote') {
          stopNote(data.note);
        }
      });


      /**
       * Handles a note-on event.
       * @param {number} note     Midi note.
       * @param {number} velocity Midi velocity beteen 1 - 127.
       */
      function noteOn(n: number, v: number) {
        if (muted.value) return;

        // dispatchToWorker({ type: 'noteOn', note: n, velocity: v });
        playNote(n, v);
      }

      /**
       * Handles a note-off event.
       * @param {number} note     Midi note.
       */
      function noteOff(n: number) {
        // dispatchToWorker({ type: 'noteOff', note: n });
        stopNote(n);
      }

      function playNote(n: number, v: number) {
        note.value = n;
        velocity.value = (v / 127.0);
        gate.value = 1;
      }

      function stopNote(n: number) {
        if (note.value === n) {
          gate.value = 0;
          velocity.value = 0;
        }
      }

      function pitchWheel(b: number) {
        bend.value = b;
      }

      function controller(_target: number, val: number) {
        mod.value = val / 127.0;
      }

      onUnmounted(() => {
        midi.unsubscribe();
        unsubcribeKeys();
        unsubscribeWorker();
      });

      // DATA / AUDIO
      expose({
        outlets
      });

      // UI
      return {
        outlets,
        noteName,
        pitch,
        gate,
        velocity,
        bend,
        mod,
        muted,
        glide,
        legato,
        priority,
        cyclePriority,
        snapOnRelease,
      };
    }

  });
</script>


<template>
  <div class="note-in">
    <div class="module-details">
      <h3>Note In</h3>
    </div>

    <div class="module-interface">
      <div class="name-bar">
        <Button class="mute" :active="muted" @mousedown.stop="muted = !muted">MUTE</Button>


        <p>
          {{ noteName }}
          <!--  {{ Math.round(pitch) }} Hz -->
          <!-- {{ +velocity.toFixed(3) }} -->
        </p>

        <span class="led" :class="{ active: gate }"></span>
      </div>

      <div class="channel">CH. <span>1</span></div>

      <div class="pb" @mousedown.capture="snapOnRelease('bend')">
        <Slider
          label="PB"
          param="bend"
          :min="-1"
          :max="1"
          variant="large"
          @value="bend = $event"
        />
      </div>

      <div class="mw" @mousedown.capture="snapOnRelease('mod')">
        <Slider
          label="MW"
          param="mod"
          :min="0"
          :max="1"
          variant="large"
          @value="mod = $event"
        />
      </div>

      <Knob
        class="glide"
        param="glide"
        :min="0"
        :max="1"
        :precision="2"
        :default="0"
        variant="pointer"
        size="small"
        @value="glide = $event"
      />

      <Button class="legato" :active="legato" @mousedown.stop="legato = !legato">LEGATO</Button>

      <div class="priority">
        <span class="label">PRIORITY</span>
        <button @mousedown.stop="cyclePriority">{{ priority }}</button>
      </div>

      <!-- <div class="range-group">
        <div class="range-title">RANGE</div>
        <div class="range-row">HI <span>G8</span></div>
        <div class="range-row">LO <span>C-2</span></div>
      </div> -->
    </div>

    <div class="module-connections">
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>



<style>
  .note-in {
    background: #282828;
    color: #eee;

    .led {
      width: 8px;
      height: 8px;
      border-radius: 1px;
      background: #444;
      margin-right: 4px;

      &.active {
        background: #ff3e3e;
      }
    }


    .channel {
      position: absolute;
      top: 48px;
      left: 10px;
      span { color: var(--color-highlight); }
    }




    .pb {
      left: 10px;
      position: absolute;
      bottom: 12px;
    }

    .mw {
      left: 40px;
      position: absolute;
      bottom: 12px;
    }

    .glide {
      position: absolute;
      top: 48px;
      right: 16px;
      text-align: center;
    }

    .legato {
      position: absolute;
      top: 92px;
      right: 10px;
    }


    .priority {
      position: absolute;
      top: 180px;
      right: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;

      button {
        color: var(--color-highlight);
        font-size: 0.8rem;
        font-family: inherit;
        width: 100%;
      }
    }

    .range-group {
      position: absolute;
      bottom: 12px;
      right: 10px;
      width: 50px;
      text-align: center;

      .range-title {
        background: #333;
        font-size: 0.6rem;
        color: #888;
        padding: 1px 0;
        margin-bottom: 4px;
      }

      .range-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.7rem;
        color: #666;
        span { color: #aaa; }
      }
    }
  }
</style>
