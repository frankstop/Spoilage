(function () {
  const S = (window.SPOILAGE = window.SPOILAGE || {});
  S.enemies = [
    {id:'orchard_wasp',name:'Wasp in the Pear',role:'Contaminator',hp:24,art:0,pattern:[{type:'markFreshest',label:'Mark freshest'},{type:'bruiseMarked',amount:1,label:'Bruise marked · 1'},{type:'attack',amount:7,label:'Attack · 7'}],lore:'It eats the house first, then the fruit.'},
    {id:'market_hound',name:'Market Hound',role:'Feaster',hp:32,art:1,pattern:[{type:'attackPerRipe',amount:5,per:2,label:'Attack · 5 + 2 per Ripe'},{type:'attack',amount:8,label:'Attack · 8'}],lore:'The tags on its collar are all overdue.'},
    {id:'bruised_boar',name:'Bruised Boar',role:'Bruiser',hp:38,art:2,pattern:[{type:'attack',amount:9,label:'Attack · 9'},{type:'defendAttack',block:7,amount:5,label:'Guard 7 · Attack 5'}],lore:'A purple orchard moving at speed.'},
    {id:'mold_finch',name:'Mold Finch',role:'Contaminator',hp:22,art:3,pattern:[{type:'applyMold',amount:2,label:'Mold · 2'},{type:'attack',amount:6,label:'Attack · 6'},{type:'attack',amount:6,label:'Attack · 6'}],lore:'Its song improves in damp rooms.'},
    {id:'cellar_rat',name:'Cellar Rat',role:'Feaster',hp:27,art:4,pattern:[{type:'applySated',amount:1,label:'Sated · 1'},{type:'attack',amount:8,label:'Attack · 8'}],lore:'It has learned the inventory by smell.'},
    {id:'crabapple_louse',name:'Crabapple Louse',role:'Bruiser',hp:30,art:5,pattern:[{type:'attack',amount:5,label:'Attack · 5'},{type:'attack',amount:7,label:'Attack · 7'},{type:'bruiseOldest',amount:1,label:'Bruise oldest · 1'}],lore:'One apple, too many legs.'},
    {id:'vinebound_stag',name:'Vinebound Stag',role:'Bruiser',hp:44,art:6,pattern:[{type:'attack',amount:10,label:'Attack · 10'},{type:'tenderAttack',amount:5,label:'Tender · Attack 5'}],lore:'Every antler remembers a trellis.'},
    {id:'cider_hag',name:'Cider Hag',role:'Elite · Feaster',elite:true,hp:72,art:7,pattern:[{type:'attackPerPlayed',amount:5,per:1,label:'Attack · 5 + cards played'},{type:'applyMold',amount:2,label:'Mold · 2'},{type:'attack',amount:14,label:'Attack · 14'}],lore:'The barrel knocks back.'},
    {id:'glasshouse_bailiff',name:'Glasshouse Bailiff',role:'Elite · Contaminator',elite:true,hp:82,art:8,pattern:[{type:'sealCostliest',label:'Seal costliest'},{type:'attack',amount:15,label:'Attack · 15'},{type:'bruiseAll',amount:1,label:'Bruise all · 1'}],lore:'Preservation, with fees.'},
    {id:'orchard_king',name:'The Orchard King',role:'Boss',boss:true,hp:240,art:9,pattern:[{type:'harvest',attack:12,label:'Harvest · Fruit 2 · Attack 12',phase:'Harvest'},{type:'feast',base:10,amount:6,label:'Feast · 10 + 6 per unused fruit',phase:'Feast'},{type:'famine',amount:22,label:'Famine · Attack 22, draw 3',phase:'Famine'}],lore:'Three faces. One appetite.'}
  ];
  S.enemyById = Object.fromEntries(S.enemies.map(e => [e.id,e]));
})();
