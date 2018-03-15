
export class CalendarEvent{
  constructor(calendar) {
    this.calendar = calendar;

    this.onActionFunctions = {
      drag:[],
      resize:[],
      click:[],
      initialize:[],
      select:[],
      unselect:[]
    };

    this.dataToPull = [
      'start', 'end', 'color', 'editable'
    ];

    this.actionFunctions = {
      drag: { 
        baseFunction : (data) => { 
          this.manageDrag(data);
        },
        additionnalFunctions : []
      },
      click: {
        baseFunction : (data) => { 
          this.manageClick(data); 
        },
        additionnalFunctions : []
      },
      resize: {
        baseFunction : (data) =>  { 
          this.manageResize(data); 
        },
        additionnalFunctions : []
      },
      select: {
        baseFunction : (data) => {
          this.manageSelection(data);
        },
        additionnalFunctions : []
      },
      unselect: {
        baseFunction : (data) => {
          this.manageUnselection(data);
        },
        additionnalFunctions : []
      },
      initialize: {
        baseFunction : (data) => {
          this.manageInitialization(data);
        },
        additionnalFunctions : []
      }
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
    const dateStart = new Date(start);
    this.setProperty('start', dateStart.toISOString());   
  }
  setEnd(end) {
    const dateEnd = new Date(end);
    this.setProperty('end', dateEnd.toISOString());     
  }

  getLength(){
    return getDateDelta(this.start, this.end) / 1000 / 60;
  }

  isWithin(start, end) {

    return dateIsWithin(this.start, start, end) ||
          dateIsWithin(this.end, start, end) ||
          dateIsWithin(start, this.start, this.end) ||
          dateIsWithin(end, this.start, this.end);
  }

  setEditable(value) {
    this.setProperty('editable', value); 
  }

  setColor(color) {
    this.setProperty('color', color);
    if (!this.initialColor) {
      this.setInitialColor(color);
    }
  }

  setInitialColor(color) {
    this.setProperty('initialColor', color);
  }

  isInitialColor() {
    return this.color == this.initialColor;
  }
  reinitializeColor() {
    this.setProperty('color', this.initialColor);
  }
  
  getDuration() {
    return getDateDelta(this.start, this.end);
  }

  //Manage rendering
  setMustBeRendered(mustRender) {
    this.modified = mustRender;
  }
  needsRendering() {
    return this.modified;
  }

  setSelectable(value) {
    this.setProperty('selectable', value);
  }

  isSelectable() {
    return this.selectable;
  }

  isSelected() {
    return this.selected;
  }

  setSelected(value) {
    this.setProperty('selected', value);
  }

  revert() {
    this.pullDataFrom(this.initialData);
    this.setMustBeRendered(true);
  }

  select(data) {
    this.manageAction('select',data);
  }
  unselect(data) {
    this.manageAction('unselect', data);
  }

  drag(data) {
    this.manageAction('drag', data);
  }

  //Data takes a length (for a fixed length) or delta (for a delta modification to length) parameter
  resize(data) {
    this.manageAction('resize', data);
  }

  click(data) {
    this.manageAction('click', data);
  }

  initialize(data) {
    this.manageAction('initialize', data);
  }

  /////////////////////////////////////////////////////////////////////////
  ///PRIVATE

  manageAction(actionCode, data) {

    if (!data) {
      data = {};
    }

    this.saveData();

    if(data.event) {
      this.pullDataFrom(data.event);
    }

    //Call the basic action managers
    if(this.actionFunctions[actionCode].baseFunction){
      this.actionFunctions[actionCode].baseFunction(data);
    }
    else{
      console.log('Bad basic action manager : ', actionCode);
    }

    this.clearSavedData();
  }

  manageDrag(data) {
    
    const delta = data.delta;

    this.setStart(appendToDate(this.start, delta));
    this.setEnd(appendToDate(this.end, delta));
    
    if(this.isSelected()) {
      this.propagateActionToOtherSelectedEvents("drag", data);
    }
    this.onAction('drag', delta);

  }

  manageClick(data) {
    this.onAction('click', data);
  }

  manageResize(data) {
    if(data.delta) {
      const delta = data.delta;
      this.setEnd(appendToDate(this.end, delta));
    }

    if(data.length) {
      const length = data.length;
      this.setEnd(appendToDate(this.start, length));
    }

    if(this.isSelected()) {
      this.propagateActionToOtherSelectedEvents('resize', {
          length : getDateDelta(this.start, this.end)
        });
    }
    this.onAction('resize', getDateDelta(this.start, this.end));
  }

  manageSelection(data) {
    if(this.isSelectable()) {
      this.setProperty('selected', true);
      this.onAction('select', data);
    }
  }
  
  manageUnselection(data) {
    if(this.isSelectable()) {
      this.setProperty('selected', false);
      this.onAction('unselect', data);
    }
  }

  manageInitialization(data) {
    this.setInitialColor(null);
    this.setSelected(false);
    this.setEditable(false);
    this.setSelectable(false);

    this.onAction('initialize', data);

  }

  propagateActionToOtherSelectedEvents(actionCode, data) {

    if(this.actionPropagated) {
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

  overloadOnActionFunction(name, func) {
    if(this.actionFunctions[name].additionnalFunctions){
      this.actionFunctions[name].additionnalFunctions.push(func);
    }
    else{
      console.log('Bad action name : ', name);
    }
  }

  onAction(actionCode, data) {
    if(this.actionFunctions[actionCode].additionnalFunctions) {
      this.actionFunctions[actionCode].additionnalFunctions.forEach((func) => {
        func(this, this.calendar, data);
      });
    }
    else{
      console.log('bad action name', actionCode);
    }
  }

  pullDataFrom(jsonEvent) {
    this.dataToPull.forEach((key) => this[key] = jsonEvent[key]);
  }

  setProperty(key,value) {
    if(this[key] != value) {
      this.setMustBeRendered(true);
    }
    this[key] = value;
  }
}

function appendToDate(date, append) {
  date = new Date(date);
  append = new Date(append);
  
  const newDate = new Date(date.getTime() + append.getTime());
  return newDate.toISOString();
}

function getDateDelta(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return endDate.getTime() - startDate.getTime();
}

function getEpochTime(date) {
  const actualDate = new Date(date);
  return actualDate.getTime();
}

function dateIsWithin(date, start, end) {

  const startTime = getEpochTime(start);
  const endTime = getEpochTime(end);
  const dateTime = getEpochTime(date);

  return (dateTime > startTime && dateTime < endTime);
}