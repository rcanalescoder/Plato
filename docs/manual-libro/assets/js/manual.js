
const q = document.querySelector('#search');
const chapters = [...document.querySelectorAll('.chapter')];
const readingSections = [...document.querySelectorAll('.chapter[id], .book-section[id]')];
q?.addEventListener('input', () => {
  const term = q.value.trim().toLowerCase();
  chapters.forEach(ch => {
    const hit = !term || ch.innerText.toLowerCase().includes(term);
    ch.hidden = !hit;
  });
});
document.querySelectorAll('.layer-tabs').forEach(group=>{
  const chapter=group.closest('.chapter');
  group.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      group.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      chapter.querySelectorAll('.layer').forEach(x=>x.classList.remove('active'));
      chapter.querySelector(`.layer[data-layer="${btn.dataset.layer}"]`)?.classList.add('active');
    });
  });
});
const navLinks=[...document.querySelectorAll('.sidebar a')];
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
    }
  });
},{rootMargin:'-20% 0px -70% 0px'});
readingSections.forEach(section=>obs.observe(section));

function money(n){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n||0)}
function calc(){
  const v=id=>Number(document.getElementById(id)?.value||0);
  const monthlyVisits=v('visits');
  const series=v('series');
  const court=v('court');
  const boxes=v('boxes');
  const boxPrice=v('boxPrice');
  const travel=v('travel');
  const annualFixed=v('fixed');
  const perVisit=series*court + series*boxes*boxPrice + travel;
  const monthlyRecurring=monthlyVisits*perVisit;
  const monthlyEquivalent=monthlyRecurring+annualFixed/12;
  const annual=monthlyRecurring*12+annualFixed;
  const write=(id,value)=>{
    const output=document.getElementById(id);
    if(output) output.textContent=money(value);
  };
  write('perVisit',perVisit);
  write('monthly',monthlyEquivalent);
  write('annual',annual);
}
document.querySelectorAll('.calc input').forEach(i=>i.addEventListener('input',calc));calc();
