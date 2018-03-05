<template>

  <div class=wrapper>
    <div id=calendar ></div>
  </div>
</template>

<script>
import {Calendar} from '@/services/calendar/Calendar'
import {EventBuilder} from '@/services/calendar/EventBuilder'


export default {
  name: 'PatientCalendar',
  created() {
    this.calendar = new Calendar("#calendar");
    this.builder = new EventBuilder(this.calendar, {
      onInitialize: (event, calendar) => {
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

    this.takenBuilder = new EventBuilder(this.calendar, {
      onInitialize: (event) =>{
        event.setColor("red");
      }
    });

    this.calendar.setCalendarFunctions({
      onSelection: function(calendar, start, end, eventsWithin){
        if(eventsWithin.length > 0) {
          eventsWithin[0].select();
        } 
        else {
          calendar.unselectEvents();
        }
      }
    });
    
    this.populateCalendar(this.pullCalendarData());



  },
  data:{
    calendar:null,
    builder:null,
    takenBuilder:null
  },
  methods:{
    pullCalendarData() {
      return [
          {taken:true, start:"2018-02-26 09:00", end:"2018-02-26 09:15", id:856853},
          {taken:false, start:"2018-02-26 10:00", end:"2018-02-26 10:15", id:12347},
          {taken:true, start:"2018-02-26 11:00", end:"2018-02-26 11:15", id:231},
          {taken:false, start:"2018-02-26 11:30", end:"2018-02-26 11:45", id:13},
          {taken:false, start:"2018-02-26 13:00", end:"2018-02-26 13:15", id:1245},
          {taken:false, start:"2018-02-26 14:00", end:"2018-02-26 14:15", id:12355},
          {taken:true, start:"2018-02-26 15:00", end:"2018-02-26 15:15", id:1232},

          {taken:false, start:"2018-02-27 09:00", end:"2018-02-27 09:15", id:32323462},
          {taken:false, start:"2018-02-27 10:00", end:"2018-02-27 10:15", id:122},
          {taken:true, start:"2018-02-27 11:00", end:"2018-02-27 11:15", id:2312},
          {taken:false, start:"2018-02-27 11:30", end:"2018-02-27 11:45", id:132},
          {taken:false, start:"2018-02-27 13:00", end:"2018-02-27 13:15", id:12452},
          {taken:false, start:"2018-02-27 14:00", end:"2018-02-27 14:15", id:123552},
          {taken:true, start:"2018-02-27 15:00", end:"2018-02-27 15:15", id:12322},

          {taken:false, start:"2018-02-28 09:00", end:"2018-02-28 09:15", id:11412352362},
          {taken:false, start:"2018-02-28 10:00", end:"2018-02-28 10:15", id:112},
          {taken:false, start:"2018-02-28 11:00", end:"2018-02-28 11:15", id:2121},
          {taken:true, start:"2018-02-28 11:30", end:"2018-02-28 11:45", id:1312},
          {taken:false, start:"2018-02-28 13:00", end:"2018-02-28 13:15", id:12412},
          {taken:false, start:"2018-02-28 14:00", end:"2018-02-28 14:15", id:123512},
          {taken:true, start:"2018-02-28 15:00", end:"2018-02-28 15:15", id:12312},

          {taken:true, start:"2018-03-01 09:00", end:"2018-03-01 09:15", id:124},
          {taken:false, start:"2018-03-01 10:00", end:"2018-03-01 10:15", id:1242},
          {taken:true, start:"2018-03-01 11:00", end:"2018-03-01 11:15", id:21241},
          {taken:false, start:"2018-03-01 11:30", end:"2018-03-01 11:45", id:1243},
          {taken:false, start:"2018-03-01 13:00", end:"2018-03-01 13:15", id:121245},
          {taken:false, start:"2018-03-01 14:00", end:"2018-03-01 14:15", id:1231245},
          {taken:true, start:"2018-03-01 15:00", end:"2018-03-01 15:15", id:121242},

          {taken:false, start:"2018-03-02 09:00", end:"2018-03-02 09:15", id:568},
          {taken:false, start:"2018-03-02 10:00", end:"2018-03-02 10:15", id:1568},
          {taken:true, start:"2018-03-02 11:00", end:"2018-03-02 11:15", id:23568},
          {taken:false, start:"2018-03-02 11:30", end:"2018-03-02 11:45", id:1568132435},
          {taken:true, start:"2018-03-02 13:00", end:"2018-03-02 13:15", id:1245568},
          {taken:false, start:"2018-03-02 14:00", end:"2018-03-02 14:15", id:1235568},
          {taken:false, start:"2018-03-02 15:00", end:"2018-03-02 15:15", id:125682}
          ]


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
