import {EventBuilder} from "./EventBuilder"

export class Calendar {
  constructor(selector) {
    this.htmlSelector = selector;
    this.events = [];
    this.defaultView = null;
    this.printed = false;
    this.calendarActions = {
      onSelection:[],
      onAddition:[],
      onRemoval:[],
      load:[]
    };
  }

  print(calendarSettings) {
    if (this.printed) {
      this.reprint();
      return;
    }

    this.callAction('load');

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

        this.callAction('onSelection', {start:start, end:end, eventsWithin:eventsWithin});

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
    if(!this.calendarActions[key]){
      console.log("There is no '" + key + "' calendar function");
      return;
    }

    this.calendarActions[key].push(func);
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

    if(this.printed){
      this.callAction('onAddition', {event:event});
    }
  }

  removeEvent(event) {

    const id = event.id;
    const calendarEvent = this.getEvent(id);

    this.events = this.events.filter((currEvent) => currEvent.id != id);
    this.selector.fullCalendar('removeEvents', id);

    this.callAction('onRemoval', {event:calendarEvent});
  }

  removeSelectedEvents(){
    this.getSelectedEvents().forEach((event) => this.removeEvent(event));
  }

  rerenderEvents() {

    const eventsToRender = this.events.filter((event) => event.needsRendering());

    const TOO_MANY_INDIVIDUAL_EVENTS = 10;
    if(eventsToRender.length > TOO_MANY_INDIVIDUAL_EVENTS){
      this.selector.fullCalendar('removeEvents');
      this.selector.fullCalendar('renderEvents', this.events);
    }
    else{
      eventsToRender.forEach((event) => this.selector.fullCalendar('removeEvents', event.id));
      this.selector.fullCalendar('renderEvents', eventsToRender);
    }
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

  callAction(actionCode, data){
    if(!data){
      data = {};
    }

    const actionCallbacks = this.calendarActions[actionCode];

    let actioncall = (func) => func(this, data);

    if(actionCode == 'onSelection'){
      actioncall = (func) => func(this, data.start, data.end, data.eventsWithin);
    }
    else if(actionCode == 'onAddition' || actionCode == 'onRemoval'){
      actioncall = (func) => func(this, data.event);
    }

    actionCallbacks.forEach(actioncall);
  }
}