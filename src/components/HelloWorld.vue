<template>
  <div class=wrapper>
    <color-picker @input="newColor => { color = newColor }" />
    <div id=calendar></div>
  </div>
</template>

<script>
import ColorPicker from '@/components/ColorPicker'
import Calendar from '@/services/Calendar/Calendar'


export default {
  name: 'HelloWorld',
  components: { 'color-picker': ColorPicker },
  mounted() {

    const calendar = new Calendar('#calendar');

    const builder = new EventBuilder(calendar, {
      onInitialize: (event, calendar) => {
        event.setEditable();
        event.setColor("green");
      },
      onClick: (event, calendar) =>{
        calendar.unselectEvents();
        if(event.isSelected()){
          event.unselect();
        }
        else{
          event.select();
        }
      },
      onSelection(event){
        event.setColor("blue");
      },
      onUnselection(event){
        event.reinitializeColor();
      }
    });

    calendar.setCalendarFunctions({
        onSelection: function(calendar, start, end, eventsWithin){
          if(eventsWithin.length === 0) {
                    //if no other events are within the start and end
                    const newEvent = builder.createEvent(calendar.getHighestEventId() + 1, 'test', start, end);
                    calendar.addEvent(newEvent);
                } 
                else {
                    calendar.unselectEvents();
                    eventsWithin.forEach((event) => event.select());
                }
        }
      });
    
    calendar.print({
      header: {
        left: 'prev, next, today',
        center: 'title',
        right: 'agendaWeek, agendaDay'
      },
      businessHours: true,
      minTime: '7:00',
      maxTime: '20:00',
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00',
      allDaySlot: false,
      defaultView: 'agendaWeek',
      selectable: true,
      selectHelper: true,
      eventOverlap: false,
      editable: true
    });
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      color: ''
    }
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
