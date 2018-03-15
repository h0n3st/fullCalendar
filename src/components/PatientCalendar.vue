<template>

  <div class=wrapper>
    <div id=calendar ></div>
  </div>
</template>

<script>
import {Calendar} from '@/services/calendar/Calendar'
import {EventBuilder} from '@/services/calendar/EventBuilder'
import {SelectableCalendarFactory} from '@/services/calendar/SelectableCalendarFactory'


export default {
  name: 'PatientCalendar',
  created() {

    const factory = new SelectableCalendarFactory();

    this.calendar = factory.getCalendar("#calendar");
    this.builder = factory.getEventBuilder(this.calendar);
    
    this.takenBuilder = factory.getEventBuilder(this.calendar);
    this.takenBuilder.appendActionCallback('initialize', (event) => {
      event.setColor('green');
      event.setInitialColor('green');
      event.setSelectable(false);
    });
    
    this.populateCalendar(this.pullCalendarData());

  },
  data: () => {return {
      calendar:this.calendar,
      builder:this.builder,
      takenBuilder:this.takenBuilder
    }
  },
  methods:{
    pullCalendarData() {

      const calendarData = [];

      let i = 1;
      const startDate = new Date();
      startDate.setHours(6);
      startDate.setMinutes(0);

      const appendMinutes = (date, minutes) => {
        date.setTime(date.getTime() + minutes * 1000 * 60);
        return date;
      }

      while(startDate.getHours() < 14){

        calendarData.push({
          taken: i % 2 == 1,
          start: startDate.toISOString(),
          end : appendMinutes(startDate, 15).toISOString(),
          id: i++
        });

        appendMinutes(startDate, 30);
      }

      return calendarData;

    },
    populateCalendar(calendarData){
      this.calendar.events = [];
      this.pullCalendarData().forEach((eventData) => {
        const builder = eventData.taken 
                            ? this.takenBuilder
                            : this.builder;
        
      this.calendar.addEvent(builder.createEvent(eventData.id, eventData.start, eventData.end));
      });
    }
  },
  mounted() {

    this.calendar.print({
      header: {
        left: 'prev, next, today',
        center: 'title',
        right: 'agendaWeek, agendaDay, listDay'
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
