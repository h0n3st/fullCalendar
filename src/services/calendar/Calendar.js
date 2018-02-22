require("./eventBuilder.js");

class Calendar {
  constructor(selector) {
    this.htmlSelector = selector;
    this.events = [];
    this.views = [];
    this.defaultView = null;
    this.builder = null;
    this.printed = false;
    this.calendarFunctions = {};
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

    const calendarFunctions = {
      viewRender: () => {
        this.reprint();
      },
      select: (start, end) => {
        const eventsWithin = this.getEventsWithin(start, end);

        if(this.calendarFunctions.onSelection){
          this.calendarFunctions.onSelection(this, start, end, eventsWithin);
        }

        this.selector.fullCalendar('unselect');
        this.rerenderEvents();
      },
      eventClick: (event) => {
        this.getEvent(event.id).manageAction('click', event);
        this.rerenderEvents();
      },
      eventDrop: (event) => {
        this.getEvent(event.id).manageAction('drag', event);
        this.rerenderEvents();
      },
      eventResize: (event) => {
        this.getEvent(event.id).manageAction('resize', event);
        this.rerenderEvents();
      }
    }

    const fullCalendarData = Object.assign({},calendarFunctions, calendarSettings);

    this.selector.fullCalendar(fullCalendarData);
    this.printed = true;

  }
  setCalendarFunctions(calendarFunctions){

    for(const key in calendarFunctions){
      this.calendarFunctions[key] = calendarFunctions[key];
    }
  }

  getHighestEventId() {
    return this.events.map((event) => {
      return event.id;
    }).reduce((max, currValue) => {
      return (currValue > max) ? currValue : max;
    });
  }

  getEventsWithin(start, end) {
    const startTime = (new Date(start)).getTime();
    const endTime = (new Date(end)).getTime();

    return this.events.map((event) => {
      return {
        event: event,
        start: (new Date(event.start)).getTime(),
        end: (new Date(event.end)).getTime()
      };
    }).filter((value) => {
      return (value.start >= startTime && value.start <= endTime) || 
          (value.end >= startTime && value.end <= endTime);
    }).map((value) => value.event);
  }

  getEvent(id) {  
    return this.events.find((event) => event.id == id);
  }

  getSelectedEvents() {
    return this.events.filter((event) => event.isSelected());
  }

  unselectEvents() {
    this.getSelectedEvents().forEach((event) => event.unselect());
  }

  addEvent(event) {
    this.events.push(event);
  }

  removeEvent(id) {
    this.events = this.events.filter((event) => event.id == id);
    this.selector.fullCalendar('removeEvents', id);
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
}