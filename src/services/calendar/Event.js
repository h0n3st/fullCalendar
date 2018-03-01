
export class CalendarEvent{
  constructor(calendar) {
    this.calendar = calendar;
    this.editable = false;
    this.initialColor = null;

    this.modified = false;

    this.selected = false;

    this.onActionFunctions = {
      onDrag:[],
      onResize:[],
      onClick:[],
      onInitialize:[],
      onSelection:[],
      onUnselection:[]
    };
  }

  //PUBLIC FUNCTIONS

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

  isWithin(start, end){
    const startTime = (new Date(start)).getTime();
    const endTime = (new Date(end)).getTime();

    const eventStartTime = (new Date(this.start)).getTime();
    const eventEndTime = (new Date(this.end)).getTime();

    return (eventStartTime > startTime && eventStartTime < endTime) || 
          (eventEndTime > startTime && eventEndTime < endTime);
  }

  setEditable() {
    this.setProperty('editable', true); 
  }

  setEditable(value) {
    this.setProperty('editable', value); 
  }

  setColor(color) {
    this.setProperty('color', color);
    if (!this.initialColor) {
      this.setProperty('initialColor', color);
    }
  }

  isInitialColor() {
    return this.color == this.initialColor;
  }
  reinitializeColor() {
    this.setProperty('color', this.initialColor);
  }
  
  setMustBeRendered(mustRender) {
    this.modified = mustRender;
  }
  needsRendering() {
    return this.modified;
  }

  select() {
    this.setProperty('selected', true);
  }
  unselect() {
    this.setProperty('selected', false);
  }

  isSelected() {
    return this.selected;
  }

  revert() {
    this.pullDataFrom(this.initialData);
    this.setMustBeRendered(true);
  }

  manageAction(actionCode, data) {

    if (!data){
      data = {};
    }

    this.saveData();

    if(data.event){
      this.pullDataFrom(data.event);
    }

    this.actionFunctions = {
      drag: (data) => { 
        this.manageDrag(data);
      },
      click: (data) => { 
        this.manageClick(data); 
      },
      resize: (data) =>  { 
        this.manageResize(data); 
      },
      select: (data) => {
        this.manageSelection(data);
      },
      unselect: (data) => {
        this.manageUnselection(data);
      }
    };

    this.actionFunctions[actionCode](data);

    this.clearSavedData();
  }

  //PRIVATE

  manageDrag(data){
    
    const delta = data.delta;

    this.setStart(appendToDate(this.start, delta));
    this.setEnd(appendToDate(this.end, delta));
    
    this.propagateActionToOtherSelectedEvents("drag", data);

    this.onDrag(delta); 
  }

  manageClick(data){
    this.onClick();
  }

  manageResize(data){
    if(data.delta){
      const delta = data.delta;
      this.setEnd(appendToDate(this.end, delta));
    }

    if(data.length){
      const length = data.length;
      this.setEnd(appendToDate(this.start, length));
    }

    const newLength = getDateDelta(this.start, this.end);

    this.propagateActionToOtherSelectedEvents("resize", {length:newLength});
    
    this.onResize(getDateDelta(this.start, this.end));
  }

  manageSelection(data){
    this.select();
    this.onSelection();
  }
  
  manageUnselection(data){
    this.unselect();
    this.onUnselection();
  }

  propagateActionToOtherSelectedEvents(actionCode, data){

    if(this.actionPropagated){
      return;
    }

    this.actionPropagated = true;

    this.calendar.getSelectedEvents().filter((event) => !event.actionPropagated).forEach((event) => {
      event.actionPropagated = true;
      event.manageAction(actionCode, data);
    });
    
    this.actionPropagated = false;

    this.calendar.getSelectedEvents().forEach((event) => event.actionPropagated = false);
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

  overloadOnActionFunction(name, func){
    this.onActionFunctions[name].push(func);
  }

  onDrag(){
    if(this.onActionFunctions.onDrag.forEach((func) => {
      func(this, this.calendar)
    }));
  }

  onResize(){
    if(this.onActionFunctions.onResize.forEach((func) => {
      func(this, this.calendar)
    }));
  }

  onClick(){
    if(this.onActionFunctions.onClick.forEach((func) => {
      func(this, this.calendar)
    }));
  }

  onInitialize(){
    if(this.onActionFunctions.onInitialize.forEach((func) => {
      func(this, this.calendar)
    }));
  }

  onSelection(){
    if(this.onActionFunctions.onSelection.forEach((func) => {
      func(this, this.calendar)
    }));
  }

  onUnselection(){
    if(this.onActionFunctions.onUnselection.forEach((func) => {
      func(this, this.calendar);
    }));
  }

  pullDataFrom(jsonEvent) {
    for(const key in jsonEvent) {
      this[key] = jsonEvent[key];
    }
  }

  setProperty(key,value) {
    if(this[key] != value) {
      this.setMustBeRendered(true);
    }
    this[key] = value;
  }
}

function appendToDate(date, append){
  date = new Date(date);
  append = new Date(append);
  
  const newDate = new Date(date.getTime() + append.getTime());
  return newDate.toISOString();
}

function getDateDelta(start, end){
  const startDate = new Date(start);
  const endDate = new Date(end);

  return endDate.getTime() - startDate.getTime();
}