import {EventBuilder} from "./EventBuilder"

export class Calendar {
  constructor(selector) {
    this.htmlSelector = selector;
    this.events = [];
    this.defaultView = null;
    this.printed = false;
    this.calendarFunctions = {
      onSelection:[]
    };
  }

  print(calendarSettings) {
    if (this.printed) {
      this.reprint();
      return;
    }
    this.selector = $(this.htmlSelector);
    calendarSettings.editable = true;
    calendarSettings.selectable = true;
    calendarSettings.events = this.events;

    this.businessHours = calendarSettings.businessHours;

    const calendarFunctions = {
      viewRender: () => {
        this.reprint();
      },
      select: (start, end) => {

        this.selector.fullCalendar('unselect');

        const eventsWithin = this.getEventsWithin(start, end);

        this.calendarFunctions.onSelection.forEach((func) => {
          func(this, start, end, eventsWithin);
        });
        this.rerenderEvents();
      },
      eventClick: (event) => {
        this.getEvent(event.id).manageAction('click', {event:event});
        this.rerenderEvents();
      },
      eventDrop: (event, delta) => {
        this.getEvent(event.id).manageAction('drag', {delta:delta});
        this.rerenderEvents();
      },
      eventResize: (event, delta) => {
        this.getEvent(event.id).manageAction('resize', {delta:delta});
        this.rerenderEvents();
      }
    }

    const fullCalendarData = Object.assign({},calendarFunctions, calendarSettings);

    this.selector.fullCalendar(fullCalendarData);
    this.printed = true;

  }

  addCalendarFunction(key, func){
    if(!this.calendarFunctions[key]){
      this.calendarFunctions[key] = [];
    }
    this.calendarFunctions[key].push(func);
  }

  getHighestEventId() {

    if(this.events.length == 0){
      return 0;
    }

    return this.events.map((event) => {
      return event.id;
    }).reduce((max, currValue) => {
      return (currValue > max) ? currValue : max;
    });
  }

  getEventsWithin(start, end) {

    const startTime = (new Date(start)).getTime();
    const endTime = (new Date(end)).getTime();

    return this.events.filter((event) => event.isWithin(startTime, endTime));
  }

  getEvent(id) {  
    return this.events.find((event) => event.id == id);
  }

  getSelectedEvents() {
    return this.events.filter((event) => event.isSelected());
  }

  unselectEvents() {
    this.getSelectedEvents().forEach((event) => event.manageAction("unselect"));
  }

  addEvent(event) {
    this.events.push(event);
  }

  removeEvent(event) {
    const id = event.id;
    this.events = this.events.filter((currEvent) => currEvent.id != id);
    this.selector.fullCalendar('removeEvents', id);
  }

  removeSelectedEvents(){
    this.getSelectedEvents().forEach((event) => this.removeEvent(event));
  }

  rerenderEvents() {

    const eventsToRender = this.events.filter((event) => event.needsRendering());
    eventsToRender.forEach((event) => this.selector.fullCalendar('removeEvents', event.id))
    this.selector.fullCalendar('renderEvents', eventsToRender);
    eventsToRender.forEach((event) => event.setMustBeRendered(false));
  }

  //Fully reprint events, shouldn't be used
  reprint() {
    this.events.forEach((event) => event.setMustBeRendered(true));
    this.rerenderEvents();
  }

  maxEventDuration(newDuration){
    if(newDuration){
      this.maxduration = newDuration;
    }

    return newDuration;
  }
}