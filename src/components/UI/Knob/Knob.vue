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
  - 'raised'   medium beveled cap with a pointer and faint outer track.
  - 'skirted'  large cap with a skirt shoulder, pointer, and tick ring.
All variants share the same drag-to-change behavior and reactive state.
-->

<template>
  <!-- arc (default, legacy) -->
  <svg
    v-if="variant === 'arc'"
    class="knob knob--arc"
    @mousedown.stop.prevent="start"
  >
    <path :d="track" class="track" fill="none" stroke-width="3" stroke-linecap="round"></path>
    <path :d="arc" class="display" fill="none" stroke-width="3" stroke-linecap="round"></path>
    <text x="24" y="28" class="value">{{ parseFloat(mapped).toFixed(precision) }}</text>
    <text x="24" y="54" class="label">{{ param }}</text>
  </svg>

  <!-- pointer: small, flat cap, single indicator line -->
  <svg
    v-else-if="variant === 'pointer'"
    class="knob knob--pointer"
    viewBox="0 0 36 52"
    @mousedown.stop.prevent="start"
  >
    <circle cx="18" cy="18" r="14" class="cap" />
    <line
      x1="18" y1="18" x2="18" y2="6"
      class="pointer"
      stroke-width="3"
      :transform="`rotate(${angleDeg} 18 18)`"
    />
    <text x="18" y="42" class="value">{{ parseFloat(mapped).toFixed(precision) }}</text>
    <text x="18" y="50" class="label">{{ param }}</text>
  </svg>

  <!-- raised: medium cap with bevel + faint outer track -->
  <svg
    v-else-if="variant === 'raised'"
    class="knob knob--raised"
    viewBox="0 0 56 76"
    @mousedown.stop.prevent="start"
  >
    <defs>
      <radialGradient :id="bevelId" cx="50%" cy="30%" r="70%">
        <stop offset="0%"   stop-color="#6a6a6a" />
        <stop offset="60%"  stop-color="#3a3a3a" />
        <stop offset="100%" stop-color="#1c1c1c" />
      </radialGradient>
    </defs>

    <path :d="raisedTrack" class="track" fill="none" stroke-width="2" />
    <circle cx="28" cy="28" r="22" class="cap-outer" :fill="`url(#${bevelId})`" />
    <circle cx="28" cy="28" r="18" class="cap-inner" />
    <line
      x1="28" y1="28" x2="28" y2="11"
      class="pointer"
      stroke-width="4"
      :transform="`rotate(${angleDeg} 28 28)`"
    />
    <text x="28" y="62" class="value">{{ parseFloat(mapped).toFixed(precision) }}</text>
    <text x="28" y="72" class="label">{{ param }}</text>
  </svg>

  <!-- skirted: large cap with skirt, pointer, tick ring -->
  <svg
    v-else-if="variant === 'skirted'"
    class="knob knob--skirted"
    viewBox="0 0 80 104"
    @mousedown.stop.prevent="start"
  >
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

    <line
      v-for="(_, i) in tickCount"
      :key="i"
      x1="40" y1="4" x2="40" y2="10"
      class="tick"
      :transform="`rotate(${i * 30 - 150} 40 40)`"
    />

    <circle cx="40" cy="40" r="32" class="skirt" :fill="`url(#${skirtId})`" />
    <circle cx="40" cy="40" r="22" class="cap"   :fill="`url(#${sheenId})`" />
    <line
      x1="40" y1="40" x2="40" y2="20"
      class="pointer"
      stroke-width="5"
      :transform="`rotate(${angleDeg} 40 40)`"
    />
    <text x="40" y="86" class="value">{{ parseFloat(mapped).toFixed(precision) }}</text>
    <text x="40" y="98" class="label">{{ param }}</text>
  </svg>
</template>


<script lang="ts">
  import { defineComponent, computed, watchEffect, ref, onMounted } from 'vue';
  import { useParameter, useModuleId } from '@/composables';
  import type { PropType } from 'vue';

  type KnobVariant = 'arc' | 'pointer' | 'raised' | 'skirted';

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
    },

    emits: ['value'],

    setup (props, { emit }) {
      const { param, min, max, mode } = props;
      const moduleId = useModuleId();
      const track = ref('');
      const arc = ref('');
      const type = 'knob';

      const { start, mapped, normalized } = useParameter({ moduleId, param, type, min, max, mode });

      // for the component
      watchEffect(() => {
        emit('value', mapped.value);
      });

      // for the UI
      watchEffect(() => {
        // 30 -> 330. Dials start 30deg in and end 30deg before 360.
        const rotationValue = normalized.value * 300 + 30;
        arc.value = describeArc(X, Y, SIZE, 30, rotationValue);
      });

      onMounted(() => {
        track.value = describeArc(X, Y, SIZE, 30, 330); // draw track
      });

      // Rotation for pointer-style variants. 0 -> -150deg (hard left),
      // 1 -> +150deg (hard right), matching the 300deg sweep of the arc.
      const angleDeg = computed(() => normalized.value * 300 - 150);

      // Faint outer track for the 'raised' variant, drawn once per resize
      // (viewBox is static, so we could memoize but it's cheap).
      const raisedTrack = computed(() => describeArc(28, 28, 24, 30, 330));

      // 11 ticks equally spaced across the 300deg sweep (every 30deg from
      // -150 to +150). Rendered by the template via v-for.
      const tickCount = 11;

      // Per-instance gradient IDs so multiple Knobs on the same page
      // don't collide on <defs> lookups.
      const uid = Math.random().toString(36).slice(2, 8);
      const bevelId = `knob-bevel-${uid}`;
      const skirtId = `knob-skirt-${uid}`;
      const sheenId = `knob-sheen-${uid}`;

      return {
        param,
        track,
        arc,
        start, mapped,
        angleDeg,
        raisedTrack,
        tickCount,
        bevelId,
        skirtId,
        sheenId,
      }
    }
  });
</script>


<style>
  .knob {
    cursor: pointer;

    text {
      text-anchor: middle;
      font-size: 1rem;
      /* fill: #fff; */
    }
  }

  /* --- arc (legacy) ------------------------------------------------ */

  .knob--arc {
    width: 48px;
    height: 64px;

    .track   { stroke: var(--color-grey-medium); }
    .display { stroke: var(--color-highlight); }
  }

  /* --- pointer ----------------------------------------------------- */

  .knob--pointer {
    width: 36px;
    height: 52px;

    .cap     { fill: #2a2a2a; stroke: #0a0a0a; stroke-width: 1; }
    .pointer { stroke: var(--color-highlight); stroke-linecap: round; }
    .value, .label { font-size: 0.8rem; }
  }

  /* --- raised ------------------------------------------------------ */

  .knob--raised {
    width: 56px;
    height: 76px;

    .track     { stroke: var(--color-grey-medium); opacity: 0.6; }
    .cap-outer { stroke: #0a0a0a; stroke-width: 1; }
    .cap-inner { fill: #222; }
    .pointer   { stroke: var(--color-highlight); stroke-linecap: round; }
    .value, .label { font-size: 0.9rem; }
  }

  /* --- skirted ----------------------------------------------------- */

  .knob--skirted {
    width: 80px;
    height: 104px;

    .skirt   { stroke: #0a0a0a; stroke-width: 1; }
    .cap     { stroke: #000; stroke-width: 1; }
    .tick    { stroke: var(--color-grey-medium); stroke-width: 1.5; stroke-linecap: round; }
    .pointer { stroke: var(--color-highlight); stroke-linecap: round; }
    .value   { font-size: 1rem; }
    .label   { font-size: 0.8rem; letter-spacing: 0.05em; }
  }
</style>
