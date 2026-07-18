
const DataStore = {
  defaults: {
    person: {
      id: "person_mama",
      firstName: "Mama",
      lastName: "",
      displayName: "Mama",
      birthDate: "",
      gender: "",
      bloodGroup: "",
      heightCm: "",
      weightKg: "",
      avatar: "",
      allergies: "Keine hinterlegt",
      insurance: "Noch nicht hinterlegt",
      emergencyContacts: [
        { id: "contact_1", firstName: "", lastName: "", phone: "", relationship: "" },
        { id: "contact_2", firstName: "", lastName: "", phone: "", relationship: "" }
      ],
      doctor: {
        id: "doctor_1",
        firstName: "Thomas",
        lastName: "Müller",
        phone: "",
        practice: "",
        address: ""
      }
    },
    medications: [
      { id:"med_ram", name:"Ramipril", strength:"5 mg", form:"Tablette", description:"Weiße Tablette", dosage:"1-0-0", time:"08:00", amount:1, unit:"Tablette", stock:84, minStock:10, expiry:"2027-04-30", active:true, pill:"white", image:"" },
      { id:"med_met", name:"Metformin", strength:"850 mg", form:"Tablette", description:"Rosa Tablette", dosage:"1-0-1", time:"12:00", amount:1, unit:"Tablette", stock:42, minStock:10, expiry:"2027-02-28", active:true, pill:"pink", image:"" },
      { id:"med_vit", name:"Vitamin D", strength:"1000 IE", form:"Kapsel", description:"Gelbe Kapsel", dosage:"0-0-1", time:"20:00", amount:1, unit:"Kapsel", stock:60, minStock:10, expiry:"2027-08-31", active:true, pill:"yellow", image:"" }
    ],
    events: [
      { id:"evt_1", title:"Hausarzt", date:new Date().toISOString().slice(0,10), time:"15:30", location:"Dr. Thomas Müller", type:"doctor", followUp:false },
      { id:"evt_2", title:"Zahnarzt", date:new Date(Date.now()+86400000).toISOString().slice(0,10), time:"09:00", location:"Kontrolltermin", type:"doctor", followUp:false }
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

    const person = this.get("person");

    if (!person.firstName && person.name) {
      const parts = String(person.name).trim().split(/\s+/);
      person.firstName = parts.shift() || "";
      person.lastName = parts.join(" ");
    }

    person.firstName = person.firstName || "";
    person.lastName = person.lastName || "";
    person.displayName = person.displayName ||
      [person.firstName, person.lastName].filter(Boolean).join(" ") ||
      person.name ||
      "Person";
    person.birthDate = person.birthDate || "";
    person.gender = person.gender || "";
    person.bloodGroup = person.bloodGroup || "";
    person.heightCm = person.heightCm || "";
    person.weightKg = person.weightKg || "";
    person.allergies = person.allergies || "Keine hinterlegt";
    person.insurance = person.insurance || "Noch nicht hinterlegt";
    delete person.name;

    let changed = true;

    if (!Array.isArray(person.emergencyContacts)) {
      person.emergencyContacts = [
        { id:"contact_1", firstName:"", lastName:"", phone:"", relationship:"" },
        { id:"contact_2", firstName:"", lastName:"", phone:"", relationship:"" }
      ];
      changed = true;
    } else {
      person.emergencyContacts = person.emergencyContacts.slice(0,2).map((contact,index) => ({
        id: contact.id || `contact_${index+1}`,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        phone: contact.phone || "",
        relationship: contact.relationship || ""
      }));
      while (person.emergencyContacts.length < 2) {
        person.emergencyContacts.push({
          id:`contact_${person.emergencyContacts.length+1}`,
          firstName:"",
          lastName:"",
          phone:"",
          relationship:""
        });
      }
    }

    if (!person.doctor || Array.isArray(person.doctors)) {
      const oldDoctor = Array.isArray(person.doctors) && person.doctors.length
        ? person.doctors[0]
        : { firstName:"", lastName:"", phone:"" };

      person.doctor = {
        id: oldDoctor.id || "doctor_1",
        firstName: oldDoctor.firstName || "",
        lastName: oldDoctor.lastName || "",
        phone: oldDoctor.phone || "",
        practice: oldDoctor.practice || "",
        address: oldDoctor.address || ""
      };
      delete person.doctors;
      changed = true;
    }

    this.set("person", person);

    this.cleanupPastEvents();
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

    const person = this.get("person");
    let changed = false;

    if (!Array.isArray(person.emergencyContacts)) {
      person.emergencyContacts = [
        { id:"contact_1", firstName:"", lastName:"", phone:"", relationship:"" },
        { id:"contact_2", firstName:"", lastName:"", phone:"", relationship:"" }
      ];
      changed = true;
    } else {
      person.emergencyContacts = person.emergencyContacts.slice(0,2).map((contact,index) => ({
        id: contact.id || `contact_${index+1}`,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        phone: contact.phone || "",
        relationship: contact.relationship || ""
      }));
      while (person.emergencyContacts.length < 2) {
        person.emergencyContacts.push({
          id:`contact_${person.emergencyContacts.length+1}`,
          firstName:"",
          lastName:"",
          phone:"",
          relationship:""
        });
      }
    }

    if (!person.doctor || Array.isArray(person.doctors)) {
      const oldDoctor = Array.isArray(person.doctors) && person.doctors.length
        ? person.doctors[0]
        : { firstName:"", lastName:"", phone:"" };

      person.doctor = {
        id: oldDoctor.id || "doctor_1",
        firstName: oldDoctor.firstName || "",
        lastName: oldDoctor.lastName || "",
        phone: oldDoctor.phone || "",
        practice: oldDoctor.practice || "",
        address: oldDoctor.address || ""
      };
      delete person.doctors;
      changed = true;
    }

    if (changed) this.set("person", person);

    this.cleanupPastEvents();
    this.ensureTodayIntakes();
  },


  cleanupPastEvents() {
    const today = this.today();
    const events = this.get("events");
    const normalized = events.map(event => ({
      ...event,
      followUp: Boolean(event.followUp)
    }));

    const filtered = normalized.filter(event => {
      if (!event.date) return true;
      if (event.followUp) return true;
      return event.date >= today;
    });

    if (JSON.stringify(filtered) !== JSON.stringify(events)) {
      this.set("events", filtered);
    }

    return filtered;
  },

  resetDemo() {
    ["person","medications","events","settings"].forEach(name => {
      Storage.set(this.key(name), structuredClone(this.defaults[name]));
    });
    this.resetToday();
  }
};
