const Intake={
load(){this.meds=Data.meds();this.items=Data.intakes()},
confirm(id){
this.load();const x=this.items.find(i=>i.id===id);if(!x)return;
if(x.status==="done"){UI.toast("Diese Einnahme wurde bereits bestätigt.");return}
const m=this.meds.find(m=>m.id===x.medicationId);x.status="done";x.confirmedAt=new Date().toISOString();m.stock=Math.max(0,m.stock-x.amount);
Data.saveIntakes(this.items);Data.saveMeds(this.meds);Dashboard.render();UI.toast(m.name+" wurde bestätigt.");
},
reset(){Data.reset();this.load();Dashboard.render();UI.toast("Testdaten wurden zurückgesetzt.")}
};