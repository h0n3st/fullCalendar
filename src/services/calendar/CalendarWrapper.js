import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'


export class CalendarWrapper {
  constructor(selector){

    this.selector = selector;
    this.calendar = new Calendar(selector);

    this.builder = null;
    this.staticBuilder = null;
    this.editableBuilder = null;
  }

  print(printSettings){
    
    this.initializeBuilders();
    //Needs to be after builder creations
    this.setParameters();

    this.initializeCalendarFunctions();

    const finalPrintSettings = this.generateCalendarSettings(printSettings);

    this.calendar.print(finalPrintSettings);
  }

  initializeBuilders(){
    this.editableBuilder = new EventBuilder(this.calendar, {
      onInitialize: (event, calendar) => {
        event.setEditable();
        event.setColor(this.editableColor());
      },
      onClick: (event, calendar) =>{
        const eventIsInitiallySelected = event.isSelected();

        calendar.unselectEvents();
        if(eventIsInitiallySelected){
          event.manageAction('unselect');
        }
        else{
          event.manageAction('select');
        }
      },
      onSelection : (event) => {
        event.setColor(this.selectedColor());
      },
      onUnselection : (event) => {
        event.reinitializeColor();
      }
    });

    this.staticBuilder = new EventBuilder(this.calendar, {
      onInitialize: (event, calendar) => {
        event.setColor(this.staticColor());
      },
      onSelection: (event) => {
        event.unselect();
      }
    });
  }

  initializeCalendarFunctions(){

    this.calendar.addCalendarFunction("onSelection", (calendar, start, end, eventsWithin) => {

      calendar.unselectEvents();

      if(eventsWithin.length === 0 && this.builder) {

        const id = calendar.getHighestEventId() + 1;

        const event = this.builder.createEvent(id,start,end);

        const differenceInMs = event.getDuration();
        const differenceInMins = differenceInMs / 1000 / 60;

        if(this.validEventDuration(differenceInMins) && this.builder){
          this.calendar.addEvent(event);
        }
      } 
      else {

        if(!this.canSelectMultiple()){
          eventsWithin.length = 1;
        }

        eventsWithin.forEach((event) => event.manageAction('select'));
      }
      
    });

    this.calendar.addCalendarFunction("onAddition", (calendar, event) => {

      console.log('Event ' + event.id + ' has been added');
      
    });

    this.calendar.addCalendarFunction("onRemoval", (calendar, event) => {

      console.log('Event ' + event.id + ' has been removed');
      
    });
  }
  generateCalendarSettings(printSettings){
    const basePrintSettings = {
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
    };

    if(printSettings){
      for(const key in printSettings){
        basePrintSettings[key] = printSettings[key];
      }
    }

    return basePrintSettings;
  }

  addEvent(id, start, end, title){
    this.calendar.addEvent(this.builder.createEvent(id, start, end, title));
  }

  addStaticEvent(id, start, end, title){
    this.calendar.addEvent(this.staticBuilder.createEvent(id, start, end, title));
  }

  addEditableEvent(id, start, end, title){
    this.calendar.addEvent(this.builder.createEvent(id, start, end, title));
  }

  removeSelectedEvents(){
    this.calendar.removeSelectedEvents();
  }

  parseAttributes(selector){

    const baseAttributes = $(selector)[0].attributes;

    this.parameters = {};

    for(let i = 0 ; i < baseAttributes.length; i++){
      let name = baseAttributes.item(i).name;
      let value = baseAttributes.item(i).value;

      this.parameters[name] = (value === '') ? true : value;
    }
  }

  setParameters(){

    this.parseAttributes(this.selector);

    const baseValues = {
      'selected-color' : 'green',
      'editable-color' : 'blue',
      'static-color' : 'darkgrey',
      'select-multiple' : false,
      'create-events' : false,
      'create-events-static' : false,
      'max-event-duration' : 180
    }

    
    for(let key in baseValues){
      if(!this.parameters[key]){
        this.parameters[key] = baseValues[key];
      }
    }

    if(this.parameters['create-events']){
      this.builder = this.editableBuilder;
    }

    if(this.parameters['create-events-static']){
      this.builder = this.staticBuilder;
    }
  }

  validEventDuration(durationInMinutes){
    const maxDuration = parseInt(this.parameters['max-event-duration']);
    return durationInMinutes <= maxDuration;
  }

  selectedColor(){
    return this.parameters['selected-color'];
  }

  editableColor(){
    return this.parameters['editable-color'];
  }

  staticColor(){
    return this.parameters['static-color'];
  }

  canSelectMultiple(){
    return this.parameters['select-multiple'];
  }

  canCreateEvents(){
    return this.parameters['create-events'];
  }

  canCreateStaticEvents(){
    return this.parameters['create-events-static'];
  }
}

