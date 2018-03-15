import {CalendarEvent} from "./event";

export class EventBuilder {
  constructor(calendar, jsonEventFunctions) {
    this.calendar = calendar;

    this.eventFunctions = {};
    
  }

  appendActionCallback(actionCode, func){

    if(!this.eventFunctions[actionCode]){
      this.eventFunctions[actionCode] = [];
    }

    this.eventFunctions[actionCode].push(func);
  }

  createEvent(id, start, end, title) {
    const event = new CalendarEvent(this.calendar);
    this.fillEvent(event, id, start, end, title);
    this.applyActionFunctions(event);

    event.initialize();
    
    return event;
  }


  fillEvent(event, id, start, end, title) {
    event.setId(id);
    event.setTitle(title);
    event.setStart(start);
    event.setEnd(end);
  }

  applyActionFunctions(event){
    for(const key in this.eventFunctions){
      if(this.eventFunctions[key]){
        this.eventFunctions[key].forEach((func) => event.overloadOnActionFunction(key, func));
      }
      else{
        console.log('Bad action function name in builder : ', key);
      }
    }
  }
}