<template>
  <div class=wrapper>
    <div v-for="color in colors"
         :class="{'color-square': true, selected: color.selected}"
         :style="{background: color.code}"
         @click="onClick(color)">
    </div>
  </div>
</template>

<script>
export default {
  name: 'color-picker',
  methods: {
    onClick(targetColor) {
      for (const color of this.colors) {
        color.selected = color.code === targetColor.code
      }
      this.currentColor = targetColor.code
      this.$emit('input', this.currentColor)
    }
  },
  mounted() {
    this.$emit('input', this.currentColor)
  },
  data () {
    const colors = ['red', 'green', 'blue'].map(code => ({code, selected: false}))
    colors[0].selected = true
    return {
      colors,
      currentColor: colors[0].code
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.color-square {
  display: inline-block;
  width: 32px;
  height: 32px;
  margin-right: 8px;
  border-radius: 8px;
  box-sizing: border-box;
}
.color-square.selected {
  border: 3px solid orange;
}
.wrapper {
  width: 800px;
  margin: auto;
}
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
