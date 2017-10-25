+++ b/modular-synth/test/unit/specs/Synth.spec.js
@@ -0,0 +1,18 @@
+import Vue from 'vue';
+import Synth from 'src/Synth';
+
+describe('Synth.vue', () => {
+  it('should render correct contents', () => {
+
+    const vm = new Vue({
+      template: '<div><synth></synth></div>',
+      components: { Synth }
+    }).$mount();
+
+    // NOTE: no, move to e2e... or SEPARATE UI functionality from core JS
+    expect(vm.$el.querySelector('#modules').to.exist());
+    expect(vm.$el.querySelector('#connections').to.exist());
+    expect(vm.$el.querySelector('#controls').to.exist());
+
+  });
+})
diff --git a/modular-synth/test/unit/specs/VCO.spec.js b/modular-synth/test/unit/specs/VCO.spec.js
new file mode 100644
index 0000000..c1c65d9
--- /dev/null
+++ b/modular-synth/test/unit/specs/VCO.spec.js
@@ -0,0 +1,18 @@
+import Vue from 'vue';
+import App from 'src/components/VCO.vue';
+
+describe('VCO.vue', () => {
+  it('should render correct contents', () => {
+
+    const vm = new Vue({
+      template: '<div>vco></vco></div>',
+      components: { App }
+    }).$mount();
+
+    // NOTE: no, move to e2e... or SEPARATE UI functionality from core JS
+    // expect(vm.$el.querySelector('#modules').to.exist());
+    // expect(vm.$el.querySelector('#connections').to.exist());
+    // expect(vm.$el.querySelector('#controls').to.exist());
+
+  });
+})
