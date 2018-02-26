
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
  constructor(calendar){
    super(calendar);
  }

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
      drag: (data) => { 

        if(data.delta){

          var appendToDate = (date, append) => {
            date = new Date(date);
            append = new Date(append);
            
            const newDate = new Date(date.getTime() + append.getTime());
            return newDate.toISOString();
          }

          this.setStart(appendToDate(this.start, data.delta));
          this.setEnd(appendToDate(this.end, data.delta));

        }
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
  
  manageAction(actionCode, data) {
    if(data.event){
      this.pullDataFrom(data.event);
    }
    this.actionFunctions[actionCode](data);
  }
}



class RevertableEvent extends ActionnableEvent{
  manageAction(actionCode, data) {
    this.saveData();
    super.manageAction(actionCode,data);
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



export class CalendarEvent extends OverloadableEvent{
}
