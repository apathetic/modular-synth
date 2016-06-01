<template>

    <filter id="filt" type="bandpass" output="del">
      <knob data="Q"><!-- filter Q --></knob>
      <!-- <knob data="freq"></knob> -->
      <control data="freq">
        <gain id="add" output="filt.freq">
          <knob default="xx" max="100"><!-- filter center freq --></knob>

          <gain id="mult" output="add">
            <knob data="gain" default="40" max="100"><!-- sweep depth --></knob>

            <oscillator id="sweep" type="saw" output="mult">
              <knob data="freq" default="0.5" max="2"><!-- sweep speed --></knob>
            </oscillator>
          </gain>
        </gain>
      </control>

      <oscillator id="gen" type="saw" output="filt">
        <knob data="freq" default="85" max="200"><!-- main gen freq --></knob>
      </oscillator>
    </filter>

    <delay id="del" output="comp1">
      <knob data="time"></knob>
      <knob data="feedback" max="0.99"></knob>
    </delay>

</template>

<script>
  import Knob from './components/Knob'
  import Gain from './components/Gain'
  import Oscillator from './components/Oscillator'
  import Filter from './components/Filter'

  export default {
    components: {
      Filter
    }
  }
</script>
