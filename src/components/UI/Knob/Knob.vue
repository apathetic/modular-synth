<!--
THE Knob allows the manipulation of a particular parameter. Internally, the
Knob's value can vary between zero and one (0 -> 1). This value is then
mapped to the min and max properties passed into the component, and $emit'd
back to the parent.

When init'd the Knob "registers" itself with the store, via REGISTER_PARAMETER.
Settings, updates, etc. are tracked this way i.e. all parameter changes
are automatically persisted to the vuex store.

Notes: the "param" property _must_ match the name of the data it represents
in the parent component. For example, Knob param="freq" implies that there
is a "freq" parameter in the parent Component.

Visual variants (prop `variant`, default `'arc'`):
  - 'arc'      current open-ring arc around the value text.
  - 'pointer'  small flat cap with a single radial indicator.
  - 'skirted'  large cap with a skirt shoulder, pointer, and tick ring.
All variants share the same drag-to-change behavior and reactive state.
-->

<script lang="ts">
  import { defineComponent, computed, watchEffect, ref, onMounted } from 'vue';
  import { useParameter, useModuleId } from '~/composables';
  import type { PropType } from 'vue';

  type KnobVariant = 'arc' | 'pointer' | 'skirted';

  const SIZE = 20;
  const X = 24; // half the css knob radius (arc variant)
  const Y = 24;

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees + 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }


  export default defineComponent({
    name: 'Knob',

    props: {
      default: Number,
      precision: 0,
      min: 0,
      max: 1,
      param: { // ie. name
        type: String,
        required: true
      },
      mode: {
        type: String,
        default: 'linear'
      },
      variant: {
        type: String as PropType<KnobVariant>,
        default: 'arc',
      },
      steps: {
        type: Array as PropType<string[]>,
        default: undefined
      },
      size: {
        type: String as PropType<'small' | 'medium' | 'large'>,
        default: 'medium'
      }
    },

    emits: ['value'],

    setup (props, { emit }) {
      const { param, mode } = props;
      const isDragging = ref(false);
      const track = ref('');
      const arc = ref('');
      const type = 'knob';
      const discrete = !!props.steps?.length;
      const min = discrete ? 0 : props.min;
      const max = discrete ? props.steps.length - 1 : props.max;

      const moduleId = useModuleId();
      const { start, mapped, normalized } = useParameter({ moduleId, param, type, min, max, mode, discrete });


      function handleStart(e: MouseEvent) {
        isDragging.value = true;
        start(e);
        window.addEventListener('mouseup', () => { isDragging.value = false; }, { once: true });
      }

      const internal = computed(() => {
        if (discrete) {
          const count = props.steps.length;
          return Math.round(normalized.value * (count - 1)) / (count - 1);
        }
        return normalized.value;
      });

      const displayValue = computed(() => {
        if (discrete) {
          const index = Math.round(internal.value * (props.steps.length - 1));
          return props.steps[index];
        }
        return parseFloat(mapped.value).toFixed(props.precision);
      });

      const emittedValue = computed(() => {
        if (discrete) {
          const index = Math.round(internal.value * (props.steps.length - 1));
          return props.steps[index];
        }
        return mapped.value;
      });

      // for the component
      watchEffect(() => {
        emit('value', emittedValue.value);
      });

      // for the UI
      watchEffect(() => {
        // 30 -> 330. Dials start 30deg in and end 30deg before 360.
        const rotationValue = internal.value * 300 + 30;
        arc.value = describeArc(X, Y, SIZE, 30, rotationValue);
      });

      onMounted(() => {
        track.value = describeArc(X, Y, SIZE, 30, 330); // draw track
      });

      // Rotation values: 0 -> -150deg (hard left), 1 -> +150deg (hard right)
      const angleDeg = computed(() => internal.value * 300 - 150);


      // Per-instance gradient IDs so multiple Knobs on the same page
      // don't collide on <defs> lookups.
      const uid = Math.random().toString(36).slice(2, 8);
      const skirtId = `knob-skirt-${uid}`;
      const sheenId = `knob-sheen-${uid}`;

      return {
        param,
        track,
        arc,
        handleStart,
        displayValue,
        angleDeg,
        size: props.size,
        skirtId,
        sheenId,
        isDragging,
      }
    }
  });
</script>



<template>
  <div
    class="knob"
    :class="[`knob--${variant}`, `size-${size}`]"
    @mousedown.stop.prevent="handleStart"
  >
    <!-- arc (default, legacy) -->
    <svg v-if="variant === 'arc'" class="knob-svg" viewBox="0 0 48 48">
      <path :d="track" class="track" fill="none" stroke-width="5" stroke-linecap="round"></path>
      <path :d="arc" class="display" fill="none" stroke-width="3" stroke-linecap="round"></path>
      <text x="24" y="29" class="value">{{ displayValue }}</text>
    </svg>

    <!-- pointer: small, flat cap, single indicator line -->
    <svg v-else-if="variant === 'pointer'" class="knob-svg" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="14" class="cap" />
      <line x1="18" y1="18" x2="18" y2="6" class="pointer" stroke-width="2" :transform="`rotate(${angleDeg} 18 18)`" />
    </svg>

    <!-- skirted: large cap with skirt, pointer, tick ring -->
    <svg v-else-if="variant === 'skirted'" class="knob-svg" viewBox="0 0 80 80">
      <defs>
        <linearGradient :id="skirtId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#4a4a4a" />
          <stop offset="100%" stop-color="#1a1a1a" />
        </linearGradient>
        <linearGradient :id="sheenId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#6a6a6a" />
          <stop offset="55%"  stop-color="#2d2d2d" />
          <stop offset="100%" stop-color="#111111" />
        </linearGradient>
      </defs>

      <line v-for="(_, i) in 11" :key="i" x1="40" y1="4" x2="40" y2="10" class="tick" :transform="`rotate(${i * 30 - 150} 40 40)`" />

      <circle cx="40" cy="40" r="32" class="skirt" :fill="`url(#${skirtId})`" />
      <circle cx="40" cy="40" r="22" class="cap"   :fill="`url(#${sheenId})`" />
      <line x1="40" y1="21" x2="40" y2="20" class="pointer" stroke-width="5" :transform="`rotate(${angleDeg} 40 40)`" />
    </svg>

    <label class="label">{{ isDragging ? displayValue : param }}</label>
  </div>
</template>


<style>
  .knob {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    --scale: 1;

    &.size-small { --scale: 0.6; }
    &.size-large { --scale: 1.8; }


    text {
      text-anchor: middle;
    }
  }

  .knob-svg {
    overflow: visible;
    display: block;
    width: calc(var(--w) * var(--scale));
    height: calc(var(--h) * var(--scale));
    transition: width 0.2s ease, height 0.2s ease;

    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
  }

  /* --- arc (legacy) ------------------------------------------------ */

  .knob--arc {
    --w: 48px;
    --h: 48px;

    .track   { stroke: var(--color-grey-medium); }
    .display { stroke: var(--color-highlight); }
  }

  /* --- pointer ----------------------------------------------------- */

  .knob--pointer {
    --w: 40px;
    --h: 40px;

    .cap     { fill: #2a2a2a; stroke: #0a0a0a; stroke-width: 1; }
    .pointer { stroke: var(--color-highlight); stroke-linecap: round; }
  }

  /* --- skirted ----------------------------------------------------- */

  .knob--skirted {
    --w: 80px;
    --h: 80px;

    .skirt   { stroke: #0a0a0a; stroke-width: 1; }
    .cap     { stroke: #000; stroke-width: 1; }
    .tick    { stroke: var(--color-grey-medium); stroke-width: 1.5; stroke-linecap: round; }
    .pointer { stroke: var(--color-highlight); stroke-linecap: round; }
  }
</style>
