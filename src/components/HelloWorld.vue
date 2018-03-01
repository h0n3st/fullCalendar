<template>

  <div class=wrapper>
    <div id="calendar" 
        create-events
        selected-color="black"
        editable-color="orange"
        static-color="blue"
        select-multiple
        max-event-duration="90"
        ></div>
  </div>
</template>

<script>
import {CalendarWrapper} from '@/services/calendar/CalendarWrapper'



export default {
  name: 'HelloWorld',
  created() {
    this.calendar = new CalendarWrapper("#calendar");
  },
  data:{
    calendar:null
  },

  mounted() {
    
     window.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if(keyName === 'Delete'){   
         this.calendar.removeSelectedEvents();
      }
    });

    this.calendar.print();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
