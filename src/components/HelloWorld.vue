<template>

  <div class=wrapper v-on:keyup.delete="deleteSelectedEvents()">
    <div id=calendar ></div>
  </div>
</template>

<script>
import {Calendar} from '@/services/calendar/Calendar'
import {EventBuilder} from '@/services/calendar/EventBuilder'


export default {
  name: 'HelloWorld',
  created() {
    this.calendar = new Calendar("#calendar");
    this.builder = new EventBuilder(this.calendar, {
      onInitialize: (event, calendar) => {
        event.setEditable();
        event.setColor("blue");
      },
      onClick: (event, calendar) =>{

        const eventIsInitiallySelected = event.isSelected();

        calendar.unselectEvents();
        if(eventIsInitiallySelected){
          event.unselect();
        }
        else{
          event.select();
        }
      },
      onSelection(event){
        event.setColor("green");
      },
      onUnselection(event){
        event.reinitializeColor();
      }
    });

    const builder = this.builder;

    this.calendar.setCalendarFunctions({
      onSelection: function(calendar, start, end, eventsWithin){
        if(eventsWithin.length === 0) {

          const startDate = new Date(start);
          const endDate = new Date(end);

          const differenceInMs = endDate - startDate;
          const THREE_HOURS = 1000 * 60 * 60 * 3;
          if(differenceInMs < THREE_HOURS){
            const newEvent = builder.createEvent(calendar.getHighestEventId() + 1, 'test', start, end);
            calendar.addEvent(newEvent);
          }
        } 
        else {
          calendar.unselectEvents();
          eventsWithin.forEach((event) => event.select());
        }
      }
    });

     window.addEventListener('keyup', (event) => {
      const keyName = event.key;
      if(keyName === 'Delete'){   
        this.deleteSelectedEvents();
      }
    });
  },
  data:{
    calendar:null,
    builder:null
  },
  methods:{
    deleteSelectedEvents() {
      this.calendar.getSelectedEvents().forEach((event) => this.calendar.removeEvent(event));
      console.log(this.calendar.events.length);
    }
  },
  mounted() {



    this.calendar.print({
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
