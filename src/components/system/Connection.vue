<template>
  <line
    @click="removeConnection()"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
    :stroke="stroke"
    stroke-width="3">
  </line>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { cellWidth } from '@/constants';
  import { Parameter } from '@/audio';

  export default {
    props: {
      id: Number,
      to: Object,   // { port, id }
      from: Object,  // { port, id }
    },

    computed: {
      x1() {
        return this.source.coords.x + cellWidth + 3;
      },
      y1() {
        return this.source.coords.y + (this.from.port * 20) + 27;
      },
      x2() {
        return this.dest.coords.x - 3;
      },
      y2() {
        return this.dest.coords.y + (this.to.port * 20) + 27;
      },

      /**
       * Calculate destination information
       *   - audio inlets
       *   - UI coords
       */
      dest() {
        const node = this.node(this.to.id); // audio stuffs
        if (!node) { this.logError('node not registered'); return; }
        // const module = this.module(this.to.id); // UI stuffs
        const module = this.to.id === 0 ? node : node.$parent; // UI stuffs

        return {
          name: node.name,
          coords: { x: module.x, y: module.y },
          node,
          // inlets: node.inlets,
        };
      },

      /**
       * Calculate source information
       *   - audio outlets
       *   - UI coords
       * @return {Node}
       */
      source() {
        const node = this.node(this.from.id); // audio stuffs
        // const module = this.module(this.from.id); // UI stuffs

        if (!node) { this.logError('node not registered'); return; }


        const module = node.$parent;

        return {
          name: node.name,
          coords: { x: module.x, y: module.y },
          node,
          // outlets: node.outlets,
        };
      },

      ...mapGetters([
        'node',    // audio
        // 'module',  // UI
      ])
    },

    data() {
      return {
        stroke: 'white'
      };
    },

    created() {
      this.route();
    },

    destroyed() {
      this.route(false);
      this.unwatch && this.unwatch();
      console.log('removed', this.id);
    },

    methods: {
      /**
       * Connect the actual AudioNode of the module. This is the meat-and-bones of
       * the App, so to speak.
       * @type {Boolean} connect Connect two nodes if true, disconnect if false.
       * @return {Void}
       */
      route(connect = true) {
        const inlet = this.dest.node.inlets[this.to.port];
        const outlet = this.source.node.outlets[this.from.port];

        try {
          if (outlet.audio && inlet.audio) {
            // -------------------
            // AUDIO -> AUDIO
            // -------------------
            const source = outlet.audio;
            const destination = inlet.audio;

            (connect) ? source.connect(destination) : source.disconnect(destination);

            //
          } else if (outlet.data && inlet.audio) {
            // -------------------
            // DATA -> AUDIO
            // -------------------

            console.log('CONNECTION FROM DAT TO AUDIO ', this.from.id, this.to.id);
            const interpolator = new Parameter(0);



            this.source.node.$watch(outlet.data, interpolator.set);
            // this.$watch(outlet.data, interpolator.set);



            interpolator.output.connect(inlet.audio);

            //
          } else if (outlet.data && inlet.data) {
            // -------------------
            // DATA -> DATA
            // -------------------
            const action = outlet.data; // STRING
            const update = inlet.data;  // FUNCTION

            if (typeof update === 'function') {
              // "this.unwatch" is a fn that removes itself
              // "action" is a string -- is refers us to the property on source.node that should be watched;
              // ... when it is changed, the receiver function, "update" (on toModule), is fired with the new value.
              this.unwatch = this.source.node.$watch(action, update);
              // this.unwatch = this.$watch(action, update);
              this.stroke = '#999';
              // this.fromModule.$on(action, update);

            //
            }
          } else {
            const inType = inlet.data ? 'data' : inlet.audio ? 'audio' : 'unknown';
            const outType = outlet.data ? 'data' : outlet.audio ? 'audio' : 'unknown';

            this.stroke = 'red';

            // throw new Error('Connection: mismatch (' + outType + ' ⟹ ' + inType + ')');
            this.logError('Connection: mismatch (' + outType + ' ⟹ ' + inType + ')');
          }

          // success message:
          console.log('%c[connection] %s ⟹ %s', 'color: green', this.source.name, this.dest.name);
          //
        } catch (e) {
          this.logError(e);
          this.removeConnection();
        }
      },

      logError(e) {
        console.log('%c%s', 'color: red', e.toString().slice(0, 100));
        console.log('%c[error] connection: #%s[%d] ⟹ #%s[%d]', 'color: red',
          this.from.id, this.from.port + 1, this.to.id, this.to.port + 1);

        // bail whenever the connection fails.
        this.removeConnection();
        // this.$destroy();
      },

      destroyed() {
        console.log('removed', this.id);
      },

      removeConnection() {
        this.$store.commit('patch/REMOVE_CONNECTION', this.id, { root: true });
      }
    }
  };
</script>

<style lang="scss">
  svg {
    line {
      &:hover {
        stroke: lightblue;
      }
    }
  }
</style>
