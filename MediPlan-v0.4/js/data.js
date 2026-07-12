const Data={
defaults:[
{id:"ram",name:"Ramipril",strength:"5 mg",time:"08:00",amount:1,unit:"Tablette",stock:84,min:10,pill:"white"},
{id:"met",name:"Metformin",strength:"850 mg",time:"12:00",amount:1,unit:"Tablette",stock:42,min:10,pill:"pink"},
{id:"vit",name:"Vitamin D",strength:"1000 IE",time:"20:00",amount:1,unit:"Kapsel",stock:60,min:10,pill:"yellow"}],
today(){return new Date().toISOString().slice(0,10)},
meds(){let m=Store.get("meds");if(!m){m=structuredClone(this.defaults);Store.set("meds",m)}return m},
intakes(){const k="intakes_"+this.today();let x=Store.get(k);if(!x){x=this.meds().map(m=>({id:this.today()+"_"+m.id,medicationId:m.id,time:m.time,amount:m.amount,status:"open",confirmedAt:null}));Store.set(k,x)}return x},
saveMeds(v){Store.set("meds",v)},saveIntakes(v){Store.set("intakes_"+this.today(),v)},
reset(){Store.set("meds",structuredClone(this.defaults));Store.remove("intakes_"+this.today())}
};