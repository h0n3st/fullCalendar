
class Calendar {
  constructor(selector, calendarFunctions) {
    this.selector = selector;
    this.events = [];
    this.views = [];
    this.defaultView = null;
    this.builder = null;
    this.printed = false;
    this.calendarFunctions = calendarFunctions;
    if(!this.calendarFunctions){
      this.calendarFunctions = {};
    }
  }
  print(jsonData) {
    if (this.printed) {
      this.reprint();
      return;
    }

    jsonData.editable = true;
    jsonData.selectable = true;
    jsonData.events = this.events;

    jsonData.viewRender = () => {
      this.reprint();
    };

    jsonData.select = (start, end) => {

      const eventsWithin = this.getEventsWithin(start, end);

      if(this.calendarFunctions.onSelection){
        this.calendarFunctions.onSelection(this, start, end, eventsWithin);
      }

      this.rerenderEvents();
    };

    jsonData.eventClick = (event) => {
      this.getEvent(event.id).manageAction('click', event);
      this.rerenderEvents();
    };

    jsonData.eventDrop = (event) => {
      this.getEvent(event.id).manageAction('drag', event);
      this.rerenderEvents();
    };

    jsonData.eventResize = (event) => {
      this.getEvent(event.id).manageAction('resize', event);
      this.rerenderEvents();
    };

    $(this.selector).fullCalendar(jsonData);
    this.printed = true;

  }

  setCalendarFunctions(calendarFunctions){
    for(const key in calendarFunctions){
      this.calendarFunctions[key] = calendarFunctions[key];
    }
  }

  canCreateEvents(builder) {
    this.builder = builder;
  }

  getHighestId() {
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
    this.events.forEach((event) => (event.isSelected()) ? event.unselect() : null);
  }

  addEvent(event) {
    this.events.push(event);
  }

  removeEvent(id) {
    this.events = this.events.filter((event) => event.id == id);
    $(this.selector).fullCalendar('removeEvents', id);
  }

  rerenderEvents() {

    const eventsToRender = this.events.filter((event) => event.needsRendering());

    eventsToRender.forEach((event) => $(this.selector).fullCalendar('removeEvents', event.id))

    $(this.selector).fullCalendar('renderEvents', eventsToRender);

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

  createEvent(id, title, start, end) {
    const event = new BaseEvent(this.calendar);
    this.fillEvent(event, id, title, start, end);
    this.applyActionFunctions(event);
    event.onInitialize();

    return event;
  }


  fillEvent(event, id, title, start, end) {
    event.setId(id);
    event.setTitle(title);
    event.setStart(start);
    event.setEnd(end);
  }

  applyActionFunctions(event){
    for(let key in this.eventFunctions){
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
  constructor(calendar, id, start, end){
    super(calendar, id, start, end);
  }

  onInitialize() {}
}

class RenderableEvent extends InitializableEvent{
  constructor(calendar, id, start, end) {
    super(calendar, id, start, end);
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

  onSelection(){ }

  onUnselection(){ }

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
  
  manageAction(actionCode, event) {
    this.manageAction(actionCode, event, {});
  }

  manageAction(actionCode, event) {
    this.pullDataFrom(event);
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

class BaseEvent extends RevertableEvent{

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
