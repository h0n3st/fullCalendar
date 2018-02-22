
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

  //This wraps the call to fullcalendar(initialData)
  //It also adds the event handlers and pull the effective data from the locally created event objects
  //Once the calendar has already been printed, recalling this will only refresh the events.
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
      viewRender: () => this.reprint(),
      select: (start, end) => {
        
        if(this.calendarFunctions.onSelection){
          const eventsWithin = this.getEventsWithin(start, end);
          this.calendarFunctions.onSelection(this, start, end, eventsWithin);
        }

        this.selector.fullCalendar('unselect');
        this.rerenderEvents();
      },
      eventClick: (rawCalendarEvent) => {
        this.getEvent(rawCalendarEvent.id).manageAction('click', rawCalendarEvent);
        this.rerenderEvents();
      },
      eventDrop: (rawCalendarEvent) => {
        this.getEvent(rawCalendarEvent.id).manageAction('drag', rawCalendarEvent);
        this.rerenderEvents();
      },
      eventResize: (rawCalendarEvent) => {
        this.getEvent(rawCalendarEvent.id).manageAction('resize', rawCalendarEvent);
        this.rerenderEvents();
      }
    }

    const fullCalendarData = Object.assign(calendarSettings, calendarFunctions);

    this.selector.fullCalendar(fullCalendarData);
    //This needs to be called to make sure the initially created evens are consistent with the events created in the future
    this.updateEventsData();
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
        start: new Date(event.start),
        end: new Date(event.end)
      };
    }).filter((value) => {
      return (value.start > startTime && value.start < endTime) || 
          (value.end < endTime && value.end > startTime);
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

  //Update all event with the locally contained data in the fullCalendar jquery object
  updateEventsData(){
    this.selector.fullCalendar('clientEvents').forEach((rawCalendarEvent) => {
      this.events.find((event) => rawCalendarEvent.id == event.id).pullDataFrom(rawCalendarEvent);
    });
  }

  //Removes an event from the event array and remove it from the calendar view
  removeEvent(id) {
    this.events = this.events.filter((event) => event.id == id);
    this.selector.fullCalendar('removeEvents', id);
  }

  //Pulls the event flagged as modified, erase them, then reprint them and remove their modified flag
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

class EventBuilder {
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

class AbstractEvent{
  constructor(calendar) {
    this.calendar = calendar;
    this.editable = false;
    this.initialColor = null;
  }

  setId(id) { 
    this.setProperty('id', id);
  }
  setTitle(title) {
    this.setProperty('title', title);   
  }
  setStart(start) {
    this.setProperty('start', start);   
  }
  setEnd(end) {
    this.setProperty('end', end);     
  }
  setEditable() {
    this.setProperty('editable', true); 
  }
  setColor(color) {
    this.setProperty('color', color);
    if (!this.initialColor) {
      this.setProperty('initialColor', color);
    }
  }
  setProperty(key, value) {
    this[key] = value;
  }
  isInitialColor() {
    return this.color == this.initialColor;
  }
  reinitializeColor() {
    this.setProperty('color', this.initialColor);
  }
  pullDataFrom(jsonEvent) {
    for(const key in jsonEvent) {
      this[key] = jsonEvent[key];
    }
  }
}

class InitializableEvent extends AbstractEvent{
  onInitialize() {}
}

class RenderableEvent extends InitializableEvent{
  constructor(calendar) {
    super(calendar);
    this.modified = false;
  }
  setProperty(key,value) {
    if(this[key] != value) {
      this.setMustBeRendered(true);
    }
    super.setProperty(key,value);
  }
  setMustBeRendered(mustRender) {
    this.modified = mustRender;
  }
  needsRendering() {
    return this.modified;
  }
}

class SelectableEvent extends RenderableEvent{
  constructor(calendar) {
    super(calendar); 
    this.selected = false;
  }

  select() {
    this.setProperty('selected', true);
    this.onSelection();
  }
  unselect() {
    this.setProperty('selected', false);
    this.onUnselection();
  }

  onSelection() { }
  onUnselection() { }

  isSelected() {
    return this.selected;
  }
}

class ActionnableEvent extends SelectableEvent{
  constructor(calendar){
    super(calendar);
    this.actionFunctions = {
      drag: () => { 
        this.onDrag(); 
      },
      click: () => { 
        this.onClick(); 
      },
      resize: () =>  { 
        this.onResize(); 
      }
    };

    this.overloadedOnActionFunctions = {};
  }
  
  manageAction(actionCode, rawCalendarEvent) {
    this.pullDataFrom(rawCalendarEvent);
    this.actionFunctions[actionCode]();
  }
}


class RevertableEvent extends ActionnableEvent{
  manageAction(actionCode, event) {
    this.saveData();
    super.manageAction(actionCode,event);
    this.clearSavedData();
  }

  saveData() {
    const initialData = {};
    for(const key in this) {
      initialData[key] = this[key];
    }

    this.initialData = initialData;
  }

  clearSavedData() {
    this.initialData = undefined;
  }
  revert() {
    this.pullDataFrom(this.initialData);
    this.setMustBeRendered(true);
  }
}

class OverloadableEvent extends RevertableEvent{
  constructor(calendar){
    super(calendar);
    this.onActionFunctions = {};
  }

  overloadOnActionFunction(name, func){
    this.onActionFunctions[name] = func;
  }
  onDrag(){
    if(this.onActionFunctions.onDrag){
      this.onActionFunctions.onDrag(this, this.calendar);
    }
  }
  onResize(){
    if(this.onActionFunctions.onResize){
      this.onActionFunctions.onResize(this, this.calendar);
    }
  }
  onClick(){
    if(this.onActionFunctions.onClick){
      this.onActionFunctions.onClick(this, this.calendar);
    }
  }
  onInitialize(){
    if(this.onActionFunctions.onInitialize){
      this.onActionFunctions.onInitialize(this, this.calendar);
    }
  }
  onSelection(){
    if(this.onActionFunctions.onSelection){
      this.onActionFunctions.onSelection(this, this.calendar);
    }
  }
  onUnselection(){
    if(this.onActionFunctions.onUnselection){
      this.onActionFunctions.onUnselection(this, this.calendar);
    }
  }
}

class CalendarEvent extends OverloadableEvent{

}
