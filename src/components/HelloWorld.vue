<template>

  <div class=wrapper>
    <div id="calendar"></div>
  </div>
</template>

<script>
import {EditableCalendarFactory} from '@/services/calendar/EditableCalendarFactory'



export default {
  name: 'HelloWorld',
  created() {
    const factory = new EditableCalendarFactory('blue', 'black', 30);
    this.calendar = factory.buildCalendar("#calendar");
  },
  data: () => {
    return {calendar:this.calendar};
  },
  mounted() {
    
     window.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if(keyName === 'Delete'){   
         this.calendar.removeSelectedEvents();
      }
    });

    this.calendar.print({
      header: {
        left: 'prev, next, today',
        center: 'title',
        right: 'agendaWeek, agendaDay, listWeek'
      },
      defaultView: 'agendaWeek',
      businessHours: true,
      minTime: '7:00',
      maxTime: '20:00',
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      allDaySlot: false,
      selectable: true,
      eventOverlap: true,
      editable: true
    });
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
