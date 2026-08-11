const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "data.json");
const initial = { tickets: {}, ratings: [], status: { state: "🟢 Online", players: "Não informado", info: "Servidor funcionando normalmente." } };

function load() {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { save(initial); return JSON.parse(JSON.stringify(initial)); }
}
function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  setTicket(id, data) { const d=load(); d.tickets[id]={...(d.tickets[id]||{}),...data}; save(d); return d.tickets[id]; },
  getTicket(id) { return load().tickets[id]; },
  addRating(data) { const d=load(); d.ratings.push({...data, created:Date.now()}); save(d); },
  ratingStats(guild) {
    const a=load().ratings.filter(x=>x.guild===guild);
    return { count:a.length, avg:a.length ? (a.reduce((s,x)=>s+x.stars,0)/a.length).toFixed(2) : "0.00" };
  },
  setStatus(data) { const d=load(); d.status={...d.status,...data}; save(d); return d.status; },
  getStatus() { return load().status; }
};