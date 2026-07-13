
const DataStore = {
  defaults: {
    person: {
      id: "person_mama",
      name: "Mama",
      avatar: "",
      allergies: "Keine hinterlegt",
      emergencyContact: "Noch nicht hinterlegt",
      doctor: "Dr. Thomas Müller",
      insurance: "Noch nicht hinterlegt"
    },
    medications: [
      { id:"med_ram", name:"Ramipril", strength:"5 mg", form:"Tablette", description:"Weiße Tablette", dosage:"1-0-0", time:"08:00", amount:1, unit:"Tablette", stock:84, minStock:10, expiry:"2027-04-30", active:true, pill:"white", image:"" },
      { id:"med_met", name:"Metformin", strength:"850 mg", form:"Tablette", description:"Rosa Tablette", dosage:"1-0-1", time:"12:00", amount:1, unit:"Tablette", stock:42, minStock:10, expiry:"2027-02-28", active:true, pill:"pink", image:"" },
      { id:"med_vit", name:"Vitamin D", strength:"1000 IE", form:"Kapsel", description:"Gelbe Kapsel", dosage:"0-0-1", time:"20:00", amount:1, unit:"Kapsel", stock:60, minStock:10, expiry:"2027-08-31", active:true, pill:"yellow", image:"" }
    ],
    events: [
      { id:"evt_1", title:"Hausarzt", date:new Date().toISOString().slice(0,10), time:"15:30", location:"Dr. Thomas Müller", type:"doctor" },
      { id:"evt_2", title:"Zahnarzt", date:new Date(Date.now()+86400000).toISOString().slice(0,10), time:"09:00", location:"Kontrolltermin", type:"doctor" }
    ],
    settings: {
      theme:"dark",
      fontScale:"normal",
      adminPin:"1234",
      activePersonId:"person_mama"
    }
  },

  key(name) { return `mediplan_${name}`; },
  today() { return new Date().toISOString().slice(0,10); },

  init() {
    ["person","medications","events","settings"].forEach(name => {
      if (!Storage.get(this.key(name))) {
        Storage.set(this.key(name), structuredClone(this.defaults[name]));
      }
    });
    this.ensureTodayIntakes();
  },

  get(name) { return Storage.get(this.key(name), structuredClone(this.defaults[name])); },
  set(name, value) { Storage.set(this.key(name), value); },

  ensureTodayIntakes() {
    const key = this.key(`intakes_${this.today()}`);
    let intakes = Storage.get(key);
    if (!intakes) {
      intakes = this.get("medications")
        .filter(m => m.active)
        .map(m => ({
          id:`${this.today()}_${m.id}_${m.time.replace(":","")}`,
          medicationId:m.id,
          scheduledTime:m.time,
          amount:m.amount,
          status:"open",
          confirmedAt:null
        }));
      Storage.set(key, intakes);
    }
    return intakes;
  },

  getTodayIntakes() { return this.ensureTodayIntakes(); },
  setTodayIntakes(value) { Storage.set(this.key(`intakes_${this.today()}`), value); },

  resetToday() {
    Storage.remove(this.key(`intakes_${this.today()}`));
    this.ensureTodayIntakes();
  },

  resetDemo() {
    ["person","medications","events","settings"].forEach(name => {
      Storage.set(this.key(name), structuredClone(this.defaults[name]));
    });
    this.resetToday();
  }
};
