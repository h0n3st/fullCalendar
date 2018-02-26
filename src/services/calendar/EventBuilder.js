import {CalendarEvent} from "./event";

export class EventBuilder {
  constructor(calendar, jsonEventFunctions) {
    this.calendar = calendar;
    this.eventFunctions = {};
    if(jsonEventFunctions){
      this.eventFunctions = jsonEventFunctions;
    }
  }

  createEvent(id, start, end, title) {
    const event = new CalendarEvent(this.calendar);
    this.fillEvent(event, id, start, end, title);
    this.applyActionFunctions(event);
    event.onInitialize();
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
      event.overloadOnActionFunction(key, this.eventFunctions[key]);
    }
  }
}