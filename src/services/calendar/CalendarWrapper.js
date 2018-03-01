import {EventBuilder} from './EventBuilder'
import {Calendar} from './Calendar'


export class CalendarWrapper {
  constructor(selector){

    this.selector = selector;
    this.calendar = new Calendar(selector);

    this.builder = null;
    this.staticBuilder = null;
  }

  print(printSettings){
    this.setParameters();

    this.builder = new EventBuilder(this.calendar, {
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

    this.calendar.setCalendarFunctions({
      onSelection: (calendar, start, end, eventsWithin) => {
        if(eventsWithin.length === 0) {

          const startDate = new Date(start);
          const endDate = new Date(end);

          const differenceInMs = endDate - startDate;
          const THREE_HOURS = 1000 * 60 * 60 * 3;
          if(differenceInMs < THREE_HOURS){

            const id = calendar.getHighestEventId() + 1;

            if(this.canCreateStaticEvents()){
              this.addStaticEvent(id, start, end);
            }
            else{
              this.addEditableEvent(id,start,end);
            }
          }
        } 
        else {

          if(!this.canSelectMultiple()){
            eventsWithin.length = 1;
          }

          calendar.unselectEvents();
          eventsWithin.forEach((event) => event.manageAction('select'));
        }
      }
    });

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

    this.calendar.print(basePrintSettings);
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
      console.log(name, value);
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
      'create-events-static' : false
    }

    
    for(let key in baseValues){
      if(!this.parameters[key]){
        console.log(this.parameters[key]);
        this.parameters[key] = baseValues[key];
      }
    }

    console.log(this.parameters);
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

