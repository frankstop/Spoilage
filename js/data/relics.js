(function () {
  const S = (window.SPOILAGE = window.SPOILAGE || {});
  S.relics = [
    {id:'coolcloth',name:'Coolcloth',art:11,text:'The first card you Preserve each combat gains +1 temporary power.',hook:'coolcloth'},
    {id:'bees_wax',name:'Bee’s Wax',art:13,text:'The leftmost card in hand is Sealed at end of turn.',hook:'sealLeft'},
    {id:'blue_crock',name:'Blue Crock',art:14,text:'The first Rot consumed each turn grants 1 extra Compost.',hook:'extraCompost'},
    {id:'dinner_bell',name:'Dinner Bell',art:7,text:'When you play the final perishable card in hand, draw 1.',hook:'lastPerishableDraw'},
    {id:'silver_mold',name:'Silver Mold',art:15,text:'Cards that perish while Ripe deal 3 damage to all enemies.',hook:'ripePerishDamage'},
    {id:'ledger_waste',name:'Ledger of Waste',art:16,text:'Every fifth card that perishes grants 10 Coin.',hook:'wasteCoin'},
    {id:'amber_clock',name:'Amber Clock',art:2,text:'The first card to become Ripe each turn draws 1.',hook:'ripeDraw'},
    {id:'gleaners_hook',name:'Gleaner’s Hook',art:12,text:'The first Rot consumed each combat heals 4 HP.',hook:'rotHeal'},
    {id:'white_thread',name:'White Thread',art:11,text:'Stable cards that grant Guard grant 2 more.',hook:'stableGuard'},
    {id:'cracked_larder',name:'Cracked Larder',art:5,text:'Start combat with +1 Vigor. Perishable cards enter with 1 less Freshness.',hook:'riskVigor'}
  ];
  S.relicById = Object.fromEntries(S.relics.map(r => [r.id,r]));
})();
